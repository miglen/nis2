// Build script: extracts the law text from the two lex.bg page dumps,
// strips site chrome, segments into blocks, and injects the data into the
// HTML template to produce a self-contained comparison.html.
const fs = require('fs');
const path = require('path');

const DIR = __dirname;

function readLines(file) {
  return fs.readFileSync(path.join(DIR, file), 'utf8').split(/\r?\n/);
}

// Lines that are pure site chrome / noise and must be dropped everywhere.
function isNoise(line) {
  const t = line.trim();
  if (t === '') return true;
  if (t.startsWith('Препратки от статии')) return true;        // repeated ref bar
  if (t === 'ДОБАВИ В МОИТЕ АКТОВЕ') return true;
  if (t.startsWith('In order to view this page')) return true; // Flash banner
  if (t === 'Get Adobe Flash player') return true;
  if (/^Error\d*$/.test(t)) return true;
  return false;
}

// Extract the law body: from the title line up to (but excluding) the
// trailing "Новини" site section.
function extractBody(lines) {
  let start = lines.findIndex((l) => l.trim() === 'ЗАКОН ЗА КИБЕРСИГУРНОСТ');
  if (start < 0) start = 0;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i].trim() === 'Новини') { end = i; break; }
  }
  return lines.slice(start, end);
}

// Classify a block for styling.
function classify(text) {
  const t = text.trim();
  if (t === 'ЗАКОН ЗА КИБЕРСИГУРНОСТ') return 'title';
  if (/^Обн\. ДВ/.test(t)) return 'promulgation';
  if (/^Глава\b/.test(t)) return 'chapter';
  if (/^Раздел\b/.test(t)) return 'section';
  if (/^(Допълнителни|Преходни|Заключителни)\b/i.test(t) && t.length < 60) return 'section';
  if (/^Приложение\b/.test(t)) return 'appendix';
  if (/^Чл\.\s/.test(t) || /^Чл\.\s*\d/.test(t)) return 'article';
  if (/^§\s*\d/.test(t)) return 'article';
  // All-caps cyrillic short line => subheading (e.g. ОБЩИ ПОЛОЖЕНИЯ)
  const letters = t.replace(/[^А-Яа-яA-Za-z]/g, '');
  if (letters.length > 2 && letters === letters.toUpperCase() && t.length < 80) return 'subheading';
  return 'text';
}

function buildBlocks(file) {
  const body = extractBody(readLines(file)).filter((l) => !isNoise(l));
  // Each remaining line is one logical block (lex.bg puts each paragraph/item
  // on its own line). Collapse internal whitespace.
  return body.map((l) => {
    const text = l.replace(/\s+/g, ' ').trim();
    return { text, kind: classify(text) };
  });
}

const oldBlocks = buildBlocks('old.txt');
const newBlocks = buildBlocks('new.txt');

const data = {
  oldLabel: 'Стара редакция',
  newLabel: 'Нова редакция (ДВ, бр. 17 от 2026 г.)',
  oldBlocks,
  newBlocks,
};

const tpl = fs.readFileSync(path.join(DIR, 'comparison.template.html'), 'utf8');
const out = tpl.replace('/*__DATA__*/null', JSON.stringify(data));
fs.writeFileSync(path.join(DIR, 'comparison.html'), out, 'utf8');

console.log('old blocks:', oldBlocks.length, '| new blocks:', newBlocks.length);
console.log('wrote comparison.html (' + out.length + ' bytes)');
