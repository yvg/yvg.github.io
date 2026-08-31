// Pulls webmentions from webmention.io into src/webmentions.json, which is
// committed. The build reads that file and never touches the network, so a
// build stays offline, deterministic, and survives webmention.io going away.
//
// Run by the daily workflow, or by hand with `npm run webmentions`.

const { existsSync, mkdirSync, readdirSync, writeFileSync } = require('fs');
const { createHash } = require('crypto');
const { execFileSync } = require('child_process');

const mdFolder = './src/md';
const outputFile = './src/webmentions.json';
const avatarFolder = './assets/avatars';
const siteUrl = 'https://yves.vg';

// Avatars are mirrored, never hotlinked. Loading them from
// avatars.webmention.io would send every reader's IP to a third party, which
// is the same thing that made hotlinked Google Fonts a GDPR problem, and the
// reason the typefaces here are self-hosted too.
//
// 64px covers a 32px circle on a retina screen. The originals average 46K,
// which is more than the entire body typeface.
const avatarSize = 64;

// Aggregators that repost anything carrying a hashtag. Not people.
const blockedHosts = ['tags.pub'];

const replyProperty = 'in-reply-to';
const applauseProperties = ['like-of', 'repost-of'];

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

function isBlocked(entry) {
  const author = entry.author && entry.author.url;
  return !author || blockedHosts.some((blocked) => host(author) === blocked);
}

async function fetchTarget(path) {
  const url = `https://webmention.io/api/mentions.jf2?target=${siteUrl}${path}&per-page=500`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`webmention.io returned ${response.status} for ${path}`);
  }

  const feed = await response.json();
  return feed.children || [];
}

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
  if (!photo) return null;

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

async function toReply(entry) {
  return {
    id: entry['wm-id'],
    name: entry.author.name || 'Someone',
    profile: entry.author.url,
    avatar: await mirrorAvatar(entry.author.photo, entry.author.url),
    url: entry.url,
    published: (entry.published || entry['wm-received'] || '').slice(0, 10),
    // text, never html. That field is arbitrary markup from strangers.
    text: (entry.content && entry.content.text ? entry.content.text : '').trim()
  };
}

async function toApplause(entry) {
  return {
    name: entry.author.name || 'Someone',
    profile: entry.author.url,
    avatar: await mirrorAvatar(entry.author.photo, entry.author.url)
  };
}

async function collect() {
  const mentions = {};
  mkdirSync(avatarFolder, { recursive: true });

  for (const path of targets()) {
    const entries = (await fetchTarget(path)).filter((entry) => !isBlocked(entry));

    const replies = [];
    for (const entry of entries) {
      if (entry['wm-property'] !== replyProperty) continue;
      if (!entry.content || !entry.content.text) continue;
      replies.push(await toReply(entry));
    }
    replies.sort((a, b) => a.id - b.id);

    // One person who both liked and boosted is one face, not two.
    const applause = [];
    const seen = new Set();
    const applauded = entries
      .filter((entry) => applauseProperties.includes(entry['wm-property']))
      .sort((a, b) => a['wm-id'] - b['wm-id']);

    for (const entry of applauded) {
      if (seen.has(entry.author.url)) continue;
      seen.add(entry.author.url);
      applause.push(await toApplause(entry));
    }

    console.log(`${path}: ${replies.length} replies, ${applause.length} others`);

    if (replies.length || applause.length) {
      mentions[path] = { replies, applause };
    }
  }

  return mentions;
}

collect()
  .then((mentions) => {
    // No fetched-at stamp on purpose. A quiet day has to produce a
    // byte-identical file so the workflow commits nothing.
    writeFileSync(outputFile, JSON.stringify(mentions, null, 2) + '\n');
    console.log(`Wrote ${outputFile}`);
  })
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
