const Marked = require('marked').Marked;
const markedSequentialHooks = require('marked-sequential-hooks');
const markedHookFrontmatter = require('marked-hook-frontmatter');
const frontmatter = require('front-matter');
const { Feed } = require('feed');
const { existsSync, readdirSync, readFileSync, writeFileSync } = require('fs');

const mdFolder = './src/md';
const pagesFolder = './src/pages';
const partialsFolder = './src/partials';
const blogFolder = './blog';
const mdFiles = readdirSync(mdFolder).filter((file) => file.endsWith('.md'));

// Written by `npm run webmentions`, committed, and read here. The build never
// touches the network, so it works offline and stays deterministic.
const webmentionsFile = './src/webmentions.json';
const webmentions = existsSync(webmentionsFile)
  ? JSON.parse(readFileSync(webmentionsFile, 'utf8'))
  : {};
const blogTitle = `Yves Van Goethem's blog`;
const siteUrl = 'https://yves.vg';
const rssBaseUrl = `${siteUrl}/blog`;
const rssAuthor = 'Yves Van Goethem';
const rssDescription = 'Occasional writing about software and teams.';
const shareImage = `${siteUrl}/assets/yvg.jpg`;

// Repeated in every BlogPosting and once as the homepage's own Person entry.
const person = {
  '@type': 'Person',
  name: rssAuthor,
  url: `${siteUrl}/`
};

// Substituted fragments drop their trailing newline, otherwise every slot
// would gain a blank line. The page shell keeps its own, so files end with one.
const read = (folder, name) => readFileSync(`${folder}/${name}.html`, 'utf8');
const shell = () => read(partialsFolder, 'page');
const partial = (name) => read(partialsFolder, name).replace(/\n$/, '');
const page = (name) => read(pagesFolder, name).replace(/\n$/, '');

// Replacements go through a function so a $ in the content stays a $. A plain
// string would let $&, $' and friends eat the surrounding text.
const fill = (template, token, value) => template.replace('${' + token + '}', () => value);

// One nav for the whole site. `current` is the active item's own href, which
// lets the homepage be marked too now that it has an About link of its own.
function renderNav(current) {
  const nav = partial('nav');
  if (!current) return nav;
  return nav.replace(`href="${current}"`, `href="${current}" aria-current="page"`);
}

// Only & and " actually break a double-quoted attribute; < is escaped so a
// title can never close the JSON-LD script element early.
const escapeAttribute = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const escapeText = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Canonical URL, sharing card, and optional schema.org data. Everything here is
// derived from frontmatter, so a post carries its own metadata.
function renderMeta({ ogType, title, description, path, jsonLd }) {
  const url = `${siteUrl}${path}`;
  const lines = [
    `    <link rel="canonical" href="${url}">`,
    `    <meta property="og:type" content="${ogType}">`,
    `    <meta property="og:title" content="${escapeAttribute(title)}">`
  ];

  if (description) {
    lines.push(`    <meta property="og:description" content="${escapeAttribute(description)}">`);
  }

  lines.push(
    `    <meta property="og:url" content="${url}">`,
    `    <meta property="og:image" content="${shareImage}">`,
    `    <meta name="twitter:card" content="summary">`
  );

  if (jsonLd) {
    const json = JSON.stringify({ '@context': 'https://schema.org', ...jsonLd }).replace(/</g, '\\u003c');
    lines.push(`    <script type="application/ld+json">${json}</script>`);
  }

  return `\n${lines.join('\n')}`;
}

// description, htmlClass and meta are optional and leave no trace when absent.
function renderPage({ title, description, htmlClass, current, main, meta }) {
  let html = shell();
  html = fill(html, 'htmlClass', htmlClass ? ` class="${htmlClass}"` : '');
  html = fill(html, 'title', title);
  html = fill(html, 'description', description ? `\n    <meta name="description" content="${escapeAttribute(description)}">` : '');
  html = fill(html, 'meta', meta || '');
  html = fill(html, 'nav', renderNav(current));
  html = fill(html, 'main', main);
  html = fill(html, 'footer', partial('footer'));
  return html;
}

// The hook only strips frontmatter. Wrapping happens where the filename and the
// frontmatter are both in hand, so a post can build its own canonical URL.
const marked = new Marked().use(
  markedSequentialHooks({
    markdownHooks: [markedHookFrontmatter({ dataPrefix: 'page' })],
    htmlHooks: [(html) => html]
  })
)

function retrieveFrontmatterAttributes(mdContent) {
  const { attributes } = frontmatter(mdContent);
  return attributes
}

// Replies arrive from Mastodon through Bridgy and webmention.io, fetched by
// the daily workflow into a committed JSON file. Avatars are mirrored into
// /assets by that same script, never hotlinked.
function renderResponses(path) {
  const found = webmentions[path];
  if (!found) return '';

  const lines = ['', '      <section class="responses">'];

  // Faces first. They are the quickest read, and on a post that got boosted
  // more than it got answered they are most of what happened.
  if (found.applause.length) {
    lines.push('        <h2>Likes &amp; boosts</h2>', '        <ul class="faces">');
    found.applause.forEach((fan) => {
      const name = escapeAttribute(fan.name);
      const face = fan.avatar
        ? `<img src="${fan.avatar}" alt="${name}" width="28" height="28" loading="lazy">`
        : `<span class="initial" aria-hidden="true">${escapeText(fan.name.trim().charAt(0) || '?')}</span>`;
      lines.push(
        `          <li><a href="${escapeAttribute(fan.profile)}" rel="nofollow ugc" title="${name}">${face}</a></li>`
      );
    });
    lines.push('        </ul>');
  }

  if (found.replies.length) {
    lines.push('        <h2>Responses</h2>', '        <ol class="replies">');
    found.replies.forEach((reply) => {
      // Avatar lives inside the profile link, so the whole byline is one target.
      // alt is empty because the name sits right there as the link's text.
      const avatar = reply.avatar
        ? `<img src="${reply.avatar}" alt="" width="28" height="28" loading="lazy">`
        : '';

      lines.push(
        '          <li>',
        `            <p class="who"><a class="by" href="${escapeAttribute(reply.profile)}" rel="nofollow ugc">${avatar}<span>${escapeText(reply.name)}</span></a> <a class="when" href="${escapeAttribute(reply.url)}" rel="nofollow ugc"><time datetime="${reply.published}">${formatDate(new Date(reply.published))}</time></a></p>`,
        `            <p>${escapeText(reply.text)}</p>`,
        '          </li>'
      );
    });
    lines.push('        </ol>');
  }

  lines.push(
    '        <p class="info">These come from Mastodon. Mention this page in a post and your reply shows up here within a day.</p>',
    '      </section>'
  );

  return lines.join('\n');
}

function writeMdFilesToHtml() {
  mdFiles.forEach((file) => {
    const mdContent = readFileSync(`${mdFolder}/${file}`, 'utf8');
    const { title, summary, date } = retrieveFrontmatterAttributes(mdContent);
    const body = marked.parse(mdContent);
    const outputFileName = file.replace('.md', '.html');
    const path = `/blog/${outputFileName}`;

    if (!summary) {
      console.warn(`  ${file} has no summary, so its page gets no description or preview text`);
    }

    console.log(`Converting ${file} to HTML…`);
    writeFileSync(`${blogFolder}/${outputFileName}`, renderPage({
      title: title,
      description: summary,
      current: '/blog/',
      main: `      ${body}${renderResponses(path)}`,
      meta: renderMeta({
        ogType: 'article',
        title: title,
        description: summary,
        path: path,
        jsonLd: {
          '@type': 'BlogPosting',
          headline: title,
          datePublished: new Date(date).toISOString().slice(0, 10),
          url: `${siteUrl}${path}`,
          author: person,
          ...(summary ? { description: summary } : {})
        }
      })
    }));
  });
}

const monthAbbreviations = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// UTC: frontmatter dates are bare YYYY-MM-DD, parsed as UTC midnight.
function formatDate(date) {
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${monthAbbreviations[date.getUTCMonth()]}. ${day}, ${date.getUTCFullYear()}`;
}

// Newest first. Shared by the index and the feed.
function getArticlesNewestFirst() {
  return mdFiles
    .map((file) => {
      const mdContent = readFileSync(`${mdFolder}/${file}`, 'utf8');
      const { date, title, summary } = retrieveFrontmatterAttributes(mdContent);

      return {
        htmlFile: file.replace('.md', '.html'),
        title: title,
        summary: summary,
        date: new Date(date)
      };
    })
    .filter((article) => !Number.isNaN(article.date.getTime()))
    .sort((a, b) => b.date - a.date);
}

// The homepage teaser list. Titles and dates come from the same frontmatter the
// blog index reads, so the two can no longer drift apart. A post with no
// summary still lists, it just shows the date on its own.
function renderRecentPosts(count) {
  return getArticlesNewestFirst()
    .slice(0, count)
    .map(({ htmlFile, title, summary, date }) => {
      if (!summary) {
        console.warn(`  ${htmlFile} has no summary in its frontmatter`);
      }
      const meta = summary ? `${formatDate(date)} &middot; ${summary}` : formatDate(date);

      return [
        `        <li>`,
        `          <a href="/blog/${htmlFile}">${title}</a>`,
        `          <span class="meta">${meta}</span>`,
        `        </li>`
      ].join('\n');
    })
    .join('\n');
}

function writeStaticPages() {
  const pages = [
    {
      output: './index.html',
      source: 'index',
      title: 'Yves Van Goethem',
      description: 'Yves Van Goethem, co-founder and CTO at fluado, living near Bielefeld, Germany. Occasional writing about software and teams.',
      current: '/',
      path: '/',
      ogType: 'website',
      jsonLd: {
        ...person,
        jobTitle: 'Co-founder and Chief Technology Officer',
        worksFor: { '@type': 'Organization', name: 'fluado', url: 'https://fluado.com' },
        sameAs: [
          'https://github.com/yvg',
          'https://indieweb.social/@yvg',
          'https://www.linkedin.com/in/yvg/'
        ]
      },
      slots: { recentPosts: renderRecentPosts(3) }
    },
    {
      output: './cv/index.html',
      source: 'cv',
      title: `Yves Van Goethem's CV`,
      description: `Yves Van Goethem's CV. Twenty years building software and leading engineering teams: fluado, ToolTime, SoundCloud, Publicis, Digitas.`,
      htmlClass: 'cv',
      current: '/cv/',
      path: '/cv/',
      ogType: 'website'
    }
  ];

  pages.forEach(({ output, source, slots, path, ogType, jsonLd, ...rest }) => {
    console.log(`Writing ${output}…`);
    const main = Object.entries(slots || {}).reduce(
      (html, [token, value]) => fill(html, token, value),
      page(source)
    );
    const meta = renderMeta({ ogType, title: rest.title, description: rest.description, path, jsonLd });
    writeFileSync(output, renderPage({ ...rest, main, meta }));
  });
}

function writeBlogIndexHtml() {
  const postLinks = getArticlesNewestFirst()
    .map(({ htmlFile, title, date }) =>
      `<li>` +
        `<time datetime="${date.toISOString().slice(0, 10)}">${formatDate(date)}</time>` +
        `<a href="${htmlFile}">${title}</a>` +
      `</li>`
    )
    .join('');

  const main = fill(page('blog-index'), 'postLinks', `<ul class="archive">${postLinks}</ul>`);

  console.log(`Writing ${blogFolder}/index.html…`)
  writeFileSync(`${blogFolder}/index.html`, renderPage({
    title: blogTitle,
    description: rssDescription,
    current: '/blog/',
    main: main,
    meta: renderMeta({
      ogType: 'website',
      title: blogTitle,
      description: rssDescription,
      path: '/blog/'
    })
  }));
}

function writeRssFeed() {
  const author = {
    name: rssAuthor,
    link: rssBaseUrl,
  };

  const articles = getArticlesNewestFirst();

  // updated is pinned to the newest post. Left to default, the library stamps
  // the current time into lastBuildDate, so every build produced a different
  // file, CI committed it after every push, and conditional GETs from feed
  // readers never got a 304.
  const feed = new Feed({
    title: blogTitle,
    description: rssDescription,
    id: rssBaseUrl,
    link: rssBaseUrl,
    language: 'en',
    author: author,
    updated: articles[0]?.date,
  });

  articles.forEach(({ htmlFile, title, date }) => {
    feed.addItem({
      title,
      id: `${rssBaseUrl}/${htmlFile}`,
      link: `${rssBaseUrl}/${htmlFile}`,
      date: date,
      author: [author],
    })
  })

  console.log('Writing rss.xml…');

  writeFileSync(`${blogFolder}/rss.xml`, feed.rss2());
}

writeMdFilesToHtml();
writeStaticPages();
writeBlogIndexHtml();
writeRssFeed();
