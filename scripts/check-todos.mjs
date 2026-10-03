#!/usr/bin/env node
// Lists every "TODO(jj)" left in the site's content and source.
// Exits non-zero if any remain, so the deploy workflow refuses to publish
// a résumé with missing dates or an exercise post with no body.
//
//   npm run check:todos

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DIRS = ['src'];
const hits = [];

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(md|mdx|astro|ts|mjs|yaml|yml)$/.test(e.name)) {
      fs.readFileSync(p, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          if (line.includes('TODO(jj)')) hits.push(`${path.relative(ROOT, p)}:${i + 1}  ${line.trim()}`);
        });
    }
  }
}
DIRS.forEach((d) => walk(path.join(ROOT, d)));

if (hits.length) {
  console.error(`${hits.length} TODO(jj) left before this is ready to publish:\n`);
  console.error(hits.map((h) => `  ${h}`).join('\n'));
  process.exit(1);
}
console.log('No TODO(jj) markers left. Ready to publish.');
