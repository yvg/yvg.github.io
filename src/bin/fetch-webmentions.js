// Pulls responses into src/webmentions.json, which is committed. The build
// reads that file and never touches the network, so a build stays offline,
// deterministic, and survives any of these services going away.
//
// Two sources:
//
//  1. Mastodon, read directly. The account's own toots are scanned for links
//     to posts, the pairing is remembered in src/toots.json, and each toot's
//     replies, favourites and boosts come from the instance's public API.
//     This used to go through Bridgy and webmention.io, and Bridgy silently
//     lost replies both on the way in and on the way out.
//
//  2. webmention.io, for real webmentions: someone answering from their own
//     blog. It also still holds everything Bridgy relayed over the years,
//     and since the account deletes its old toots, that is the only copy of
//     older threads. The merge folds the two sources together by permalink.
//
// Run by the hourly workflow, or by hand with `npm run webmentions`.

const { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } = require('fs');
const { createHash } = require('crypto');
const { execFileSync } = require('child_process');

const mdFolder = './src/md';
const outputFile = './src/webmentions.json';
const tootsFile = './src/toots.json';
const avatarFolder = './assets/avatars';
const siteUrl = 'https://yves.vg';

const mastodon = { instance: 'https://indieweb.social', account: 'yvg' };

// Avatars are mirrored, never hotlinked. Loading them from a third party
// would send every reader's IP there, which is the same thing that made
// hotlinked Google Fonts a GDPR problem, and the reason the typefaces here
// are self-hosted too.
//
// 64px covers a 32px circle on a retina screen. The originals average 46K,
// which is more than the entire body typeface.
const avatarSize = 64;

// Aggregators that repost anything carrying a hashtag. Not people.
const blockedHosts = ['tags.pub'];

const replyProperty = 'in-reply-to';
const applauseProperties = ['like-of', 'repost-of'];

class RateLimited extends Error {}

function targets() {
  return readdirSync(mdFolder)
    .filter((file) => file.endsWith('.md'))
    .map((file) => `/blog/${file.replace('.md', '.html')}`);
}

function host(url) {
  try {
    return new URL(url).host;
  } catch (e) {
    return '';
  }
}

async function getJson(url) {
  const response = await fetch(url, { headers: { 'User-Agent': `${siteUrl} responses fetch` } });

  if (response.status === 429) {
    throw new RateLimited(`${host(url)} rate-limited the fetch`);
  }
  if (!response.ok) {
    throw new Error(`${host(url)} returned ${response.status} for ${url}`);
  }

  return { body: await response.json(), link: response.headers.get('link') || '' };
}

// Mastodon pages with a Link header, not a page number.
function nextPage(link) {
  const match = link.match(/<([^>]+)>;\s*rel="next"/);
  return match ? match[1] : null;
}

async function getAllPages(url) {
  const items = [];
  let next = url;
  while (next) {
    const page = await getJson(next);
    items.push(...page.body);
    next = nextPage(page.link);
  }
  return items;
}

// ---------------------------------------------------------- mastodon ------

function decodeEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

// Mastodon hands back sanitised HTML: paragraphs, line breaks, links whose
// text is wrapped in spans. The page wants text, so paragraphs become blank
// lines, breaks become newlines, and every tag goes.
function tootText(html) {
  return decodeEntities(
    html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')
      .replace(/<[^>]+>/g, '')
  ).trim();
}

function tootLinks(status) {
  const links = [];
  const pattern = /href="([^"]+)"/g;
  let match;
  while ((match = pattern.exec(status.content || '')) !== null) {
    links.push(decodeEntities(match[1]));
  }
  if (status.card && status.card.url) links.push(status.card.url);
  return links;
}

// Which post, if any, a toot is about. A link to the site with a post's
// path, ignoring query and fragment.
function postOf(status, paths) {
  for (const link of tootLinks(status)) {
    try {
      const url = new URL(link);
      if (`${url.protocol}//${url.host}` !== siteUrl) continue;
      if (paths.includes(url.pathname)) return url.pathname;
    } catch (e) {
      // Not a URL. Mastodon should not produce one, but strangers' markup is
      // strangers' markup.
    }
  }
  return null;
}

function loadToots() {
  return existsSync(tootsFile) ? JSON.parse(readFileSync(tootsFile, 'utf8')) : null;
}

// Scan the account's toots for links to posts and remember every pairing.
// Replies are scanned too: a post announced inside a thread is still a toot
// about that post. The first run pages through the whole timeline; afterwards
// one page of recent toots is enough, since the map never forgets, and since
// the account deletes old toots the timeline is short anyway.
async function discoverToots(paths) {
  const known = loadToots();
  const toots = known || {};
  const api = `${mastodon.instance}/api/v1`;

  const account = (await getJson(`${api}/accounts/lookup?acct=${mastodon.account}`)).body;
  let next = `${api}/accounts/${account.id}/statuses?exclude_reblogs=true&limit=40`;

  let found = 0;
  while (next) {
    const page = await getJson(next);
    for (const status of page.body) {
      const path = postOf(status, paths);
      if (!path) continue;
      toots[path] = toots[path] || [];
      if (!toots[path].includes(status.id)) {
        toots[path].push(status.id);
        found += 1;
        console.log(`  ${path} <- ${status.url}`);
      }
    }
    next = known ? null : nextPage(page.link);
  }

  for (const path of Object.keys(toots)) toots[path].sort();
  const ordered = {};
  for (const path of Object.keys(toots).sort()) ordered[path] = toots[path];

  writeFileSync(tootsFile, JSON.stringify(ordered, null, 2) + '\n');
  console.log(`${found} new toot${found === 1 ? '' : 's'} paired with posts`);
  return ordered;
}

function accountName(account) {
  return cleanName(account.display_name || account.username || '');
}

function isBlockedAccount(account) {
  return !account || !account.url || blockedHosts.includes(host(account.url));
}

async function fromMastodon(tootIds) {
  const api = `${mastodon.instance}/api/v1/statuses`;
  const replies = [];
  const applause = [];

  for (const id of tootIds) {
    const context = (await getJson(`${api}/${id}/context`)).body;
    for (const status of context.descendants || []) {
      // Direct replies only. An answer to an answer is that person's thread.
      if (status.in_reply_to_id !== id) continue;
      if (isBlockedAccount(status.account)) continue;
      const text = tootText(status.content || '');
      if (!text) continue;
      replies.push({
        at: status.created_at || '',
        name: accountName(status.account),
        profile: status.account.url,
        avatar: await mirrorAvatar(status.account.avatar_static, status.account.url),
        url: status.url || status.uri,
        published: (status.created_at || '').slice(0, 10),
        text
      });
    }

    const fans = [
      ...(await getAllPages(`${api}/${id}/favourited_by?limit=80`)),
      ...(await getAllPages(`${api}/${id}/reblogged_by?limit=80`))
    ];
    for (const account of fans) {
      if (isBlockedAccount(account)) continue;
      applause.push({
        name: accountName(account),
        profile: account.url,
        avatar: await mirrorAvatar(account.avatar_static, account.url)
      });
    }
  }

  return { replies, applause };
}

// ------------------------------------------------------ webmention.io ------

function profileOf(entry) {
  const author = entry.author && entry.author.url;
  if (author) return author;
  try {
    // A reply from someone's own blog can arrive without an author card.
    // That is still a person; link them to the site the reply came from.
    return new URL(entry.url).origin;
  } catch (e) {
    return '';
  }
}

// webmention.io pads a missing author name with the page URL. Mastodon leaves
// custom emoji in display names as :shortcodes:, which only render on the
// instance that owns the image; here they are just noise.
function cleanName(raw) {
  return raw
    .replace(/\s*https?:\/\/\S+/g, '')
    .replace(/:[a-z0-9_]+:/gi, '')
    .replace(/\s+/g, ' ')
    .trim() || 'Someone';
}

function nameOf(entry) {
  return cleanName((entry.author && entry.author.name) || '');
}

function isBlocked(entry) {
  const profile = profileOf(entry);
  return !profile || blockedHosts.some((blocked) => host(profile) === blocked);
}

async function fromWebmentionIo(path) {
  const url = `https://webmention.io/api/mentions.jf2?target=${siteUrl}${path}&per-page=500`;
  const entries = ((await getJson(url)).body.children || [])
    .filter((entry) => !isBlocked(entry));

  const replies = [];
  for (const entry of entries) {
    if (entry['wm-property'] !== replyProperty) continue;
    if (!entry.content || !entry.content.text) continue;
    const profile = profileOf(entry);
    const at = entry.published || entry['wm-received'] || '';
    replies.push({
      at,
      name: nameOf(entry),
      profile,
      avatar: await mirrorAvatar(entry.author && entry.author.photo, profile),
      url: entry.url,
      published: at.slice(0, 10),
      // text, never html. That field is arbitrary markup from strangers.
      text: entry.content.text.trim()
    });
  }

  const applause = [];
  for (const entry of entries) {
    if (!applauseProperties.includes(entry['wm-property'])) continue;
    const profile = profileOf(entry);
    applause.push({
      name: nameOf(entry),
      profile,
      avatar: await mirrorAvatar(entry.author && entry.author.photo, profile)
    });
  }

  return { replies, applause };
}

// ------------------------------------------------------------ avatars ------

// Whichever machine fetches first sets the bytes. Re-encoding an existing
// avatar would churn the file on every run, since sips and ImageMagick do not
// produce identical output.
function resize(input, output) {
  for (const attempt of [
    ['magick', [input, '-resize', `${avatarSize}x${avatarSize}^`, '-gravity', 'center',
      '-extent', `${avatarSize}x${avatarSize}`, '-quality', '72', output]],
    ['convert', [input, '-resize', `${avatarSize}x${avatarSize}^`, '-gravity', 'center',
      '-extent', `${avatarSize}x${avatarSize}`, '-quality', '72', output]],
    ['sips', ['-Z', String(avatarSize), '-s', 'format', 'jpeg',
      '-s', 'formatOptions', '72', input, '--out', output]]
  ]) {
    try {
      execFileSync(attempt[0], attempt[1], { stdio: 'ignore' });
      return true;
    } catch (e) {
      // Tool missing or failed on this image; try the next one.
    }
  }
  return false;
}

async function mirrorAvatar(photo, profile) {
  if (!photo || !profile) return null;

  const name = createHash('sha256').update(profile).digest('hex').slice(0, 16) + '.jpg';
  const path = `${avatarFolder}/${name}`;
  const publicPath = `/assets/avatars/${name}`;

  if (existsSync(path)) return publicPath;

  const response = await fetch(photo);
  if (!response.ok) return null;

  const temporary = `${avatarFolder}/.incoming`;
  writeFileSync(temporary, Buffer.from(await response.arrayBuffer()));

  if (!resize(temporary, path)) {
    throw new Error('No image tool found. Install ImageMagick, or run this on macOS for sips.');
  }

  console.log(`  mirrored avatar for ${profile}`);
  return publicPath;
}

// -------------------------------------------------------------- merge ------

// One reply per permalink, one face per person, however many sources saw
// them. Replies run in the order they were written; the full timestamp only
// serves the sort and is not written out.
function merge(parts) {
  const replies = new Map();
  const applause = new Map();

  for (const part of parts) {
    for (const reply of part.replies) {
      if (!replies.has(reply.url)) replies.set(reply.url, reply);
    }
    for (const fan of part.applause) {
      if (!applause.has(fan.profile)) applause.set(fan.profile, fan);
    }
  }

  return {
    replies: [...replies.values()]
      .sort((a, b) => a.at.localeCompare(b.at) || a.url.localeCompare(b.url))
      .map(({ at, ...reply }) => reply),
    applause: [...applause.values()].sort((a, b) => a.profile.localeCompare(b.profile))
  };
}

async function collect() {
  const mentions = {};
  mkdirSync(avatarFolder, { recursive: true });

  const paths = targets();
  const toots = await discoverToots(paths);

  for (const path of paths) {
    const found = merge([
      await fromMastodon(toots[path] || []),
      await fromWebmentionIo(path)
    ]);

    console.log(`${path}: ${found.replies.length} replies, ${found.applause.length} others`);

    if (found.replies.length || found.applause.length) {
      mentions[path] = found;
    }
  }

  return mentions;
}

collect()
  .then((mentions) => {
    // No fetched-at stamp on purpose. A quiet hour has to produce a
    // byte-identical file so the workflow commits nothing.
    writeFileSync(outputFile, JSON.stringify(mentions, null, 2) + '\n');
    console.log(`Wrote ${outputFile}`);
  })
  .catch((error) => {
    if (error instanceof RateLimited) {
      // Nothing written, nothing lost. The next run picks it up.
      console.log(`${error.message}; keeping the previous file`);
      return;
    }
    console.error(error.message);
    process.exit(1);
  });
