#!/usr/bin/env node
// Renders /resume/ to dist/jj-geewax-resume.pdf with headless Chrome, using
// the page's print stylesheet. Run after `npm run build`:
//
//   npm run build && npm run pdf
//
// Finds Chrome via $CHROME_PATH, the usual macOS location, or google-chrome /
// chromium on PATH (GitHub's ubuntu-latest runners have google-chrome).

import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'dist', 'jj-geewax-resume.pdf');
const PORT = 4399;

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
  ];
  for (const c of candidates) if (c && fs.existsSync(c)) return c;
  for (const bin of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser']) {
    const r = spawnSync('which', [bin], { encoding: 'utf8' });
    if (r.status === 0) return r.stdout.trim();
  }
  throw new Error('Chrome not found. Set CHROME_PATH.');
}

if (!fs.existsSync(path.join(ROOT, 'dist', 'resume', 'index.html'))) {
  console.error('dist/resume/ not found. Run `npm run build` first.');
  process.exit(1);
}

// Tiny static server for dist/ (fonts and CSS need http://, not file://).
const DIST = path.join(ROOT, 'dist');
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  let file = path.join(DIST, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!file.startsWith(DIST)) return res.writeHead(403).end();
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) return res.writeHead(404).end();
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(PORT, '127.0.0.1', r));
const url = `http://127.0.0.1:${PORT}/resume/`;
try {
  const chrome = findChrome();
  // Async spawn: a sync one would block this process's static server.
  const r = await new Promise((resolve) => {
    const child = spawn(
    chrome,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--no-pdf-header-footer',
      '--run-all-compositor-stages-before-draw',
      '--virtual-time-budget=5000',
      `--print-to-pdf=${OUT}`,
      url,
    ],
    { stdio: ['ignore', 'ignore', 'pipe'] },
    );
    let stderr = '';
    child.stderr.on('data', (d) => (stderr += d));
    child.on('close', (status) => resolve({ status, stderr }));
  });
  if (r.status !== 0 || !fs.existsSync(OUT)) throw new Error(`Chrome failed:\n${r.stderr}`);
  console.log(`✓ ${path.relative(ROOT, OUT)} (${Math.round(fs.statSync(OUT).size / 1024)} KB)`);
} finally {
  server.close();
}
