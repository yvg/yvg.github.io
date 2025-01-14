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

function getArticlesAssignedByYear() {
  const articlesByYear = new Map();

  mdFiles.forEach((file) => {
    const mdContent = readFileSync(`${inputFolder}/${file}`, 'utf8');
    const { date, title } = retrieveFrontmatterAttributes(mdContent);
    const year = new Date(date).getFullYear();

    if (!articlesByYear.has(year)) {
      articlesByYear.set(year, []);
    }

    articlesByYear.get(year).push({
      file: file,
      title: title
    });
  });

  return new Map([...articlesByYear.entries()]
    .sort((a, b) => b[0].toString().localeCompare(a[0].toString(), undefined, { numeric: true }))
    .filter(([year]) => !isNaN(Number(year))));
}

function writeIndexHtml() {
  const articlesAssignedByYear = getArticlesAssignedByYear()
  let postLinks = ''
  for (const [year, articles] of articlesAssignedByYear) {
    postLinks += `<h3>${year}</h3><ul>`
    articles.forEach((article) => {
      const { file, title } = article
      const htmlFile = file.replace('.md', '.html');
      postLinks +=`<li><a href="${htmlFile}">${title}</a></li>`
    })
    postLinks +=`</ul>`
  }

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
    const htmlFile = file.replace('.md', '.html');
    feed.addItem({
      title,
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
