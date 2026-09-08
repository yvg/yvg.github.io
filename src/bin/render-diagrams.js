// Renders src/diagrams/*.mmd to assets/diagrams/*.svg. Run by hand when a
// diagram changes (`npm run diagrams`); the SVGs are committed and the page
// build inlines them. mermaid-cli comes in through npx and is not a
// dependency of the site: the build itself never needs it.
//
// The SVGs are theme-aware without any script: mermaid is configured with
// sentinel colours (mermaid.config.json) that are rewritten here into the
// page's custom properties, so a drawing follows light, dark and the toggle
// exactly like the text does.
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', '..');
const src = path.join(root, 'src', 'diagrams');
const out = path.join(root, 'assets', 'diagrams');
fs.mkdirSync(out, { recursive: true });

// Labels are measured while rendering, with whatever face the headless
// browser has at that moment, which is not the site's. So mermaid measures
// at a slightly larger size (mermaid.config.json) and the output is rewritten
// to the size the page uses: every box ends up a hair wider than its text,
// and a box a little too wide shows nothing while one a pixel too narrow
// clips. Bold weight is declared so bold labels are measured bold.
const measureCss = path.join(src, '.measure.css');
fs.writeFileSync(measureCss, '.nodeLabel b{font-weight:700;}\n');
const config = JSON.parse(fs.readFileSync(path.join(src, 'mermaid.config.json'), 'utf8'));
const measuredSize = config.themeVariables.fontSize;
const pageSize = '15px';

const tokens = {
  '#010101': 'var(--text)',
  '#020202': 'var(--muted)',
  '#030303': 'var(--mark)',
  '#040404': 'var(--rule)',
  '#050505': 'transparent',
  '#060606': 'var(--rule)',
  '#070707': 'var(--bg)',
  // mermaid's own leftovers: arrowhead fill and shadow colour
  '#f8f8f8': 'var(--muted)',
  '#000000': 'var(--text)'
};

const grid = 28;

for (const file of fs.readdirSync(src).filter((f) => f.endsWith('.mmd'))) {
  const name = path.basename(file, '.mmd');
  const raw = path.join(src, `${name}.raw.svg`);
  execFileSync('npx', [
    '--yes', '--package=@mermaid-js/mermaid-cli', 'mmdc',
    '-i', path.join(src, file), '-o', raw,
    '-c', path.join(src, 'mermaid.config.json'), '-C', measureCss,
    '-b', 'transparent', '-I', `diagram-${name}`, '-q'
  ], { cwd: root, stdio: 'inherit' });
  let svg = fs.readFileSync(raw, 'utf8');
  fs.unlinkSync(raw);

  for (const [hex, token] of Object.entries(tokens)) svg = svg.split(hex).join(token);
  svg = svg.split(measuredSize).join(pageSize);
  // No fixed pixel size and no inline max-width: the figure decides. The
  // viewBox keeps the aspect ratio, with its height rounded up to the grid
  // so a figure at natural size hands the baseline back.
  svg = svg
    .replace(/\swidth="[^"]*"/, '')
    .replace(/\sheight="[^"]*"/, '')
    .replace(/\sstyle="max-width:[^"]*"/, '')
    .replace(/viewBox="([-\d.]+) ([-\d.]+) ([-\d.]+) ([-\d.]+)"/, (m, x, y, w, h) =>
      `viewBox="${x} ${y} ${w} ${Math.ceil(parseFloat(h) / grid) * grid}"`)
    .replace(/<svg /, '<svg role="img" ');
  fs.writeFileSync(path.join(out, `${name}.svg`), svg);
  console.log(`${name}: ${svg.match(/viewBox="[^"]*"/)[0]}, ${Math.round(svg.length / 1024)} KB`);
}
fs.unlinkSync(measureCss);
