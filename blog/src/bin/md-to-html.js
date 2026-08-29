const Marked = require('marked').Marked;
const markedSequentialHooks = require('marked-sequential-hooks');
const markedHookFrontmatter = require('marked-hook-frontmatter');
const frontmatter = require('front-matter');
const { Feed } = require('feed');
const { readdirSync, readFileSync, writeFileSync } = require('fs');

const inputFolder = './blog/src/md';
const outputFolder = './blog';
const partialsFolder = './blog/src/partials';
const mdFiles = readdirSync(inputFolder).filter((file) => file.endsWith('.md'));
const postLayoutFileName = 'layout.html';
const indexFileName = 'index.html';
const rssTitle = `Yves Van Goethem's blog`;
const rssBaseUrl = 'https://yves.vg/blog';
const rssAuthor = 'Yves Van Goethem';

function layoutHook(html, data) {
  return readFileSync(`${partialsFolder}/${postLayoutFileName}`, 'utf8')
    .replace('${html}', html)
    .replace('${data.title}', data.page.title);
}

const marked = new Marked().use(
  markedSequentialHooks({
    markdownHooks: [markedHookFrontmatter({ dataPrefix: 'page' })],
    htmlHooks: [layoutHook]
  })
)

function retrieveFrontmatterAttributes(mdContent) {
  const { attributes } = frontmatter(mdContent);
  return attributes
}

function writeMdFilesToHtml() {
  mdFiles.forEach((file) => {
    const mdContent = readFileSync(`${inputFolder}/${file}`, 'utf8');
    const htmlContent = marked.parse(mdContent);
    const outputFileName = file.replace('.md', '.html');

    console.log(`Converting ${file} to HTML…`);
    writeFileSync(`${outputFolder}/${outputFileName}`, htmlContent);
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
      const mdContent = readFileSync(`${inputFolder}/${file}`, 'utf8');
      const { date, title } = retrieveFrontmatterAttributes(mdContent);

      return {
        htmlFile: file.replace('.md', '.html'),
        title: title,
        date: new Date(date)
      };
    })
    .filter((article) => !Number.isNaN(article.date.getTime()))
    .sort((a, b) => b.date - a.date);
}

function writeIndexHtml() {
  const postLinks = getArticlesNewestFirst()
    .map(({ htmlFile, title, date }) =>
      `<li>` +
        `<time datetime="${date.toISOString().slice(0, 10)}">${formatDate(date)}</time>` +
        `<a href="${htmlFile}">${title}</a>` +
      `</li>`
    )
    .join('');

  const indexHtml = readFileSync(`${partialsFolder}/${indexFileName}`, 'utf8')
    .replace('${postLinks}', `<ul class="archive">${postLinks}</ul>`);

  console.log(`Writing ${indexFileName}…`)
  writeFileSync(`${outputFolder}/${indexFileName}`, indexHtml);
}

function writeRssFeed() {
  const author = {
    name: rssAuthor,
    link: rssBaseUrl,
  };

  const feed = new Feed({
    title: rssTitle,
    id: rssBaseUrl,
    link: rssBaseUrl,
    language: 'en',
    author: author,
  });

  getArticlesNewestFirst().forEach(({ htmlFile, title, date }) => {
    feed.addItem({
      title,
      id: `${rssBaseUrl}/${htmlFile}`,
      link: `${rssBaseUrl}/${htmlFile}`,
      date: date,
      author: [author],
    })
  })

  console.log('Writing rss.xml…');

  writeFileSync(`${outputFolder}/rss.xml`, feed.rss2());
}

writeMdFilesToHtml();
writeIndexHtml();
writeRssFeed();
