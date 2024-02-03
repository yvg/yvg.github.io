const Marked = require('marked').Marked;
const markedSequentialHooks = require('marked-sequential-hooks');
const markedHookFrontmatter = require('marked-hook-frontmatter');
const { readdirSync, readFileSync, writeFileSync, read } = require('fs');

const inputFolder = './blog2/src/md';
const outputFolder = './blog2';
const partialsFolder = './blog2/src/partials';
const mdFiles = readdirSync(inputFolder).filter((file) => file.endsWith('.md'));

function layoutHook(html, data) {
  return readFileSync(`${partialsFolder}/layout.html`, 'utf8')
    .replace('${html}', html)
    .replace('${data.title}', data.page.title);
}

const marked = new Marked().use(
  markedSequentialHooks({
    markdownHooks: [markedHookFrontmatter({ dataPrefix: 'page' })],
    htmlHooks: [layoutHook]
  })
)

function doesHtmlFileNotExist(fileName) {
  return !readdirSync(outputFolder).includes(fileName);
}

function writeMdFilesToHtml() {
  mdFiles.forEach((file) => {
    const mdContent = readFileSync(`${inputFolder}/${file}`, 'utf8');
    const htmlContent = marked.parse(mdContent);
    const outputFileName = file.replace('.md', '.html');

    if (doesHtmlFileNotExist(outputFileName)) {
      console.log(`Converting ${file} to HTML…`);
      writeFileSync(`${outputFolder}/${outputFileName}`, htmlContent);
    } else {
      console.log(`Skipping ${file} as HTML file already exists…`);
    }
  });
}

writeMdFilesToHtml();
