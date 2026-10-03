#!/usr/bin/env node
// Import content from Ghost into Markdown.
//
//   - Regular posts             → src/content/posts/<slug>.md
//   - API Design Patterns
//     exercise solutions        → src/content/exercises/<chapter>-<n>.md
//     (shown together on /api-design-patterns-exercise-solutions/, not as posts)
//
// Accepts either:
//   - a Ghost Admin export (Settings → Advanced → Import/Export → Export), or
//   - a Content API response (GET /ghost/api/content/posts/?include=tags).
//
// Usage:
//   npm run import:ghost -- <export.json>                 # anything not imported yet
//   npm run import:ghost -- <export.json> --all           # every published post (overwrites!)
//   npm run import:ghost -- <export.json> --only a,b,c    # specific Ghost slugs (overwrites!)
//
// Only published posts are imported; drafts stay in the export.
// Images are downloaded into public/images/<posts|exercises>/<id>/ and links
// rewritten, so run this BEFORE cancelling Ghost.

import fs from 'node:fs';
import path from 'node:path';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const ROOT = path.resolve(import.meta.dirname, '..');
const POSTS_DIR = path.join(ROOT, 'src/content/posts');
const EXERCISES_DIR = path.join(ROOT, 'src/content/exercises');
const GHOST_ORIGIN = 'https://www.geewax.org';
const PENDING_MARKER = 'TODO(jj): import';
const EXERCISE_SLUG = /^api-design-patterns-exercise-(\d+)-(\d+)$/;

const args = process.argv.slice(2);
const all = args.includes('--all');
const onlyIdx = args.indexOf('--only');
const only = onlyIdx >= 0 ? new Set(args[onlyIdx + 1].split(',')) : null;
const file = args.find((a, i) => !a.startsWith('--') && (onlyIdx < 0 || i !== onlyIdx + 1));
if (!file) {
  console.error('Usage: npm run import:ghost -- <export.json> [--all | --only slug1,slug2]');
  process.exit(1);
}

// --- Load posts + tags from either JSON shape -------------------------------

const json = JSON.parse(fs.readFileSync(file, 'utf8'));
let posts;
if (json.db) {
  const data = json.db[0].data;
  const tagsById = Object.fromEntries((data.tags ?? []).map((t) => [t.id, t]));
  const tagsByPost = {};
  for (const pt of data.posts_tags ?? []) {
    (tagsByPost[pt.post_id] ??= []).push({ ...tagsById[pt.tag_id], sort_order: pt.sort_order });
  }
  const metaByPost = Object.fromEntries((data.posts_meta ?? []).map((m) => [m.post_id, m]));
  posts = data.posts
    .filter((p) => p.type === 'post' && p.status === 'published')
    .map((p) => ({
      ...p,
      tags: (tagsByPost[p.id] ?? []).sort((a, b) => a.sort_order - b.sort_order),
      meta_description: metaByPost[p.id]?.meta_description ?? null,
    }));
} else if (json.posts) {
  posts = json.posts;
} else {
  console.error('Unrecognised JSON: expected a Ghost export ({db: [...]}) or Content API response ({posts: [...]}).');
  process.exit(1);
}

// --- Where each post goes, and whether it still needs importing --------------

function target(p) {
  const m = p.slug.match(EXERCISE_SLUG);
  if (m) {
    const id = `${m[1]}-${m[2]}`;
    return { kind: 'exercise', id, file: path.join(EXERCISES_DIR, `${id}.md`), chapter: +m[1], number: `${m[1]}.${m[2]}` };
  }
  return { kind: 'post', id: p.slug, file: path.join(POSTS_DIR, `${p.slug}.md`) };
}
function needsImport(t) {
  return !fs.existsSync(t.file) || fs.readFileSync(t.file, 'utf8').includes(PENDING_MARKER);
}
const selected = posts.filter((p) => (all ? true : only ? only.has(p.slug) : needsImport(target(p))));
if (!selected.length) {
  console.log('Nothing to import: everything is already here. (Use --all or --only to force.)');
  process.exit(0);
}

// --- HTML → Markdown ---------------------------------------------------------

const td = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  bulletListMarker: '-',
  emDelimiter: '*',
});
td.use(gfm);
td.keep(['sup', 'sub']);
// Ghost callout cards → one-line blockquote, emoji first.
td.addRule('ghostCallout', {
  filter: (n) => n.nodeName === 'DIV' && /kg-callout-card/.test(n.getAttribute('class') ?? ''),
  replacement: (content) => {
    const text = content.trim().replace(/^(\S+)\s*\n+/, '$1 ');
    return '\n\n' + text.split('\n').map((l) => (l ? `> ${l}` : '>')).join('\n') + '\n\n';
  },
});
// Keep the language hint from Ghost code cards.
td.addRule('fencedWithLang', {
  filter: (n) => n.nodeName === 'PRE' && n.firstChild?.nodeName === 'CODE',
  replacement: (_c, n) => {
    const lang = (n.firstChild.getAttribute('class') ?? '').match(/language-(\S+)/)?.[1] ?? '';
    return `\n\n\`\`\`${lang}\n${n.firstChild.textContent.replace(/\n$/, '')}\n\`\`\`\n\n`;
  },
});
// Captions (code and image cards) become an italic line under the figure.
td.addRule('figcaption', {
  filter: 'figcaption',
  replacement: (content) => `\n\n*${content.trim()}*\n\n`,
});
td.addRule('figure', {
  filter: 'figure',
  replacement: (content, n) => {
    const img = n.querySelector?.('img');
    if (!img) return content;
    const cap = n.querySelector?.('figcaption')?.textContent?.trim();
    const alt = img.getAttribute('alt') || cap || '';
    return `\n\n![${alt}](${img.getAttribute('src')})${cap ? `\n*${cap}*` : ''}\n\n`;
  },
});

const tidy = (md) =>
  md
    .replace(/^(\s*)(\d+\.|-)\s{2,}/gm, '$1$2 ')
    .replace(/^[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[?&]ref=geewax\.org/g, '')
    .replace(/https?:\/\/(?:www\.)?geewax\.org\/([a-z0-9-]+\/)/g, '/$1')
    .replace(/__GHOST_URL__(?!\/content\/images)\//g, '/')
    .replace(/\u00a0/g, ' ')
    // Plain ASCII punctuation only: no en/em dashes, ellipses or curly quotes.
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .trim();

// --- Images ------------------------------------------------------------------

function originalUrl(u) {
  return u
    .replace('__GHOST_URL__', GHOST_ORIGIN)
    .replace(/\/content\/images\/size\/w\d+(?:h\d+)?\//, '/content/images/');
}
async function download(url, dir) {
  const src = originalUrl(url);
  const name = decodeURIComponent(path.basename(new URL(src).pathname));
  const abs = path.join(ROOT, 'public', dir);
  fs.mkdirSync(abs, { recursive: true });
  const dest = path.join(abs, name);
  if (!fs.existsSync(dest)) {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`${res.status} fetching ${src}`);
    fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  }
  return `/${dir}/${name}`;
}
const IMG_RE =
  /(?:https:\/\/storage\.ghost\.io\/[^\s")']+|__GHOST_URL__\/content\/images\/[^\s")']+|https?:\/\/(?:www\.)?geewax\.org\/content\/images\/[^\s")']+)/g;
async function localizeImages(md, dir) {
  for (const u of new Set(md.match(IMG_RE) ?? [])) md = md.replaceAll(u, await download(u, dir));
  return md;
}

// --- Write -------------------------------------------------------------------

const yaml = (s) => JSON.stringify(s); // JSON strings are valid YAML scalars.

for (const p of selected) {
  const t = target(p);

  if (!p.html) {
    if (!fs.existsSync(t.file) && t.kind === 'post') {
      // Paywalled posts come back from the Content API without a body.
      fs.mkdirSync(path.dirname(t.file), { recursive: true });
      fs.writeFileSync(
        t.file,
        `---\ntitle: ${yaml(p.title)}\ndescription: ${yaml(p.custom_excerpt ?? '')}\ndate: ${p.published_at.slice(0, 10)}\ndraft: true\n---\n\n<!-- ${PENDING_MARKER}: paywalled on Ghost; run npm run import:ghost -- <ghost-export.json> -->\n`,
      );
    }
    console.warn(`✗ ${p.slug}: no HTML in this JSON (paywalled posts need the Admin export, not the Content API).`);
    continue;
  }

  fs.mkdirSync(path.dirname(t.file), { recursive: true });

  if (t.kind === 'exercise') {
    // The exercise text is the opening blockquote; everything after it is the solution.
    const m = p.html.match(/^\s*<blockquote[^>]*>([\s\S]*?)<\/blockquote>/);
    const question = tidy(td.turndown(m ? m[1] : p.custom_excerpt ?? '')).replace(/\n+/g, ' ');
    let body = tidy(td.turndown(m ? p.html.slice(m[0].length) : p.html))
      // Drop the "more solutions in the solutions directory" footer; they're all on one page now.
      .replace(/^> .*solutions directory.*$/gm, '')
      // Solutions sit under "Chapter" (h2) and "Exercise" (h3) headings on the page.
      .replace(/^(#{1,4}) /gm, '$1## ')
      .trim();
    body = await localizeImages(body, `images/exercises/${t.id}`);
    const fm = [
      '---',
      `exercise: "${t.number}"`,
      `chapter: ${t.chapter}`,
      `question: ${yaml(question)}`,
      `date: ${p.published_at.slice(0, 10)}`,
      '---',
    ].join('\n');
    fs.writeFileSync(t.file, `${fm}\n\n${body}\n`);
    console.log(`✓ ${p.slug} → ${path.relative(ROOT, t.file)}`);
    continue;
  }

  const md = await localizeImages(tidy(td.turndown(p.html)), `images/posts/${t.id}`);
  const image = p.feature_image ? await download(p.feature_image, `images/posts/${t.id}`) : null;
  const tags = (p.tags ?? []).map((tag) => tag.slug).filter((s) => !s.startsWith('hash-'));
  const fm = [
    '---',
    `title: ${yaml(p.title)}`,
    `description: ${yaml(p.custom_excerpt ?? p.meta_description ?? p.excerpt?.slice(0, 200) ?? '')}`,
    `date: ${p.published_at.slice(0, 10)}`,
    tags.length ? `tags: [${tags.join(', ')}]` : null,
    image ? `image: ${image}` : null,
    '---',
  ]
    .filter(Boolean)
    .join('\n');
  fs.writeFileSync(t.file, `${fm}\n\n${md}\n`);
  console.log(`✓ ${p.slug} → ${path.relative(ROOT, t.file)}`);
}
