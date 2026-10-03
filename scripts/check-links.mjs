#!/usr/bin/env node
// Checks every internal link and asset in dist/ points at something that exists,
// and that pages link to this site with relative paths (an absolute
// https://www.geewax.org/... link would jump to production from a local preview).
// Mark a link `data-absolute` when it must stay absolute (e.g. in the résumé PDF).
//
//   npm run build && npm run check:links

import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve(import.meta.dirname, '..', 'dist');
if (!fs.existsSync(DIST)) {
  console.error('dist/ not found. Run `npm run build` first.');
  process.exit(1);
}

const pages = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) pages.push(p);
  }
})(DIST);

// Generated after the build (see .github/workflows/deploy.yml).
const GENERATED = new Set(['/jj-geewax-resume.pdf']);

function exists(urlPath) {
  const clean = decodeURIComponent(urlPath.split(/[?#]/)[0]);
  if (GENERATED.has(clean)) return true;
  const f = path.join(DIST, clean);
  return (
    (fs.existsSync(f) && fs.statSync(f).isFile()) || fs.existsSync(path.join(f, 'index.html'))
  );
}

const problems = [];
for (const page of pages) {
  const html = fs.readFileSync(page, 'utf8');
  const rel = '/' + path.relative(DIST, page);
  // Skip <link rel=canonical> and <meta property=og:*>: those must be absolute.
  const body = html.replace(/<link[^>]*rel="canonical"[^>]*>|<meta[^>]*>/g, '');
  for (const [tag] of body.matchAll(/<[a-z]+\s[^>]*>/g)) {
    if (/\sdata-absolute[\s>=]/.test(tag)) continue;
    const m = tag.match(/\s(href|src)="([^"]+)"/);
    if (!m) continue;
    const [, attr, url] = m;
    if (/^https?:\/\/(www\.)?geewax\.org(\/|$)/.test(url)) {
      problems.push(`${rel}: absolute link to this site, use a relative path: ${url}`);
    } else if (url.startsWith('/') && !url.startsWith('//') && !exists(url)) {
      problems.push(`${rel}: broken ${attr}: ${url}`);
    }
  }
}

if (problems.length) {
  console.error(`${problems.length} link problem(s):\n`);
  console.error([...new Set(problems)].map((p) => `  ${p}`).join('\n'));
  process.exit(1);
}
console.log(`✓ All internal links resolve across ${pages.length} pages.`);
