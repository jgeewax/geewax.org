#!/usr/bin/env node
// House style: plain ASCII punctuation. No en/em dashes, ellipsis characters or
// curly quotes, in the source or in the built site (Markdown smartypants is off
// in astro.config.mjs, so what you type is what renders).
//
//   npm run check:chars          (checks dist/ too if it exists)

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const BANNED = {
  '\u2013': 'en dash, use -',
  '\u2014': 'em dash, use -',
  '\u2026': 'ellipsis, use ...',
  '\u2018': "curly quote, use '",
  '\u2019': "curly quote, use '",
  '\u201c': 'curly quote, use "',
  '\u201d': 'curly quote, use "',
};
const RE = new RegExp(`[${Object.keys(BANNED).join('')}]`, 'g');
const EXT = /\.(md|astro|ts|mjs|css|yml|html|xml)$/;

const hits = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (EXT.test(e.name)) {
      fs.readFileSync(p, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          for (const m of line.matchAll(RE)) hits.push(`${path.relative(ROOT, p)}:${i + 1}  ${BANNED[m[0]]}`);
        });
    }
  }
}
['src', 'scripts', '.github', 'dist'].forEach((d) => walk(path.join(ROOT, d)));
['DEPLOY.md', 'README.md', 'astro.config.mjs'].forEach((f) => {
  const p = path.join(ROOT, f);
  fs.readFileSync(p, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      for (const m of line.matchAll(RE)) hits.push(`${f}:${i + 1}  ${BANNED[m[0]]}`);
    });
});

if (hits.length) {
  console.error(`${hits.length} non-ASCII punctuation character(s):\n`);
  console.error(hits.map((h) => `  ${h}`).join('\n'));
  process.exit(1);
}
console.log('✓ Plain punctuation only.');
