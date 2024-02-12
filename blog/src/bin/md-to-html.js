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

function retrieveFrontmatterBody(mdContent) {
  const { body } = frontmatter(mdContent);
  return body;
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

function writeIndexHtml() {
  const postLinks = mdFiles.map((file) => {
    const mdContent = readFileSync(`${inputFolder}/${file}`, 'utf8');
    const { title } = retrieveFrontmatterAttributes(mdContent);
    const htmlFile = file.replace('.md', '.html');
    return `<li><a href="${htmlFile}">${title}</a></li>`;
  }).join('\n');

  const indexHtml = readFileSync(`${partialsFolder}/${indexFileName}`, 'utf8').replace('${postLinks}', postLinks);

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

  mdFiles.forEach((file) => {
    const mdContent = readFileSync(`${inputFolder}/${file}`, 'utf8');
    const { title, date } = retrieveFrontmatterAttributes(mdContent);
    const content = retrieveFrontmatterBody(mdContent);
    const htmlFile = file.replace('.md', '.html');
    feed.addItem({
      title,
      content,
      id: `${rssBaseUrl}/${htmlFile}`,
      link: `${rssBaseUrl}/${htmlFile}`,
      date: new Date(date),
      author: [author],
    })
  })

  console.log('Writing rss.xml…');

  writeFileSync(`${outputFolder}/rss.xml`, feed.rss2());
}

writeMdFilesToHtml();
writeIndexHtml();
writeRssFeed();
