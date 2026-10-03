import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

// Friendly names for tags. Anything not listed falls back to the slug.
export const TAG_LABELS: Record<string, string> = {
  typescript: 'TypeScript',
  flutter: 'Flutter',
  ip: 'Intellectual property',
};
export const tagLabel = (t: string) => TAG_LABELS[t] ?? t;

export async function getPosts() {
  const posts = await getCollection('posts', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function allTags(posts: Post[]) {
  const counts = new Map<string, number>();
  for (const p of posts) for (const t of p.data.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([tag, count]) => ({ tag, count }));
}

export function readingMinutes(body = '') {
  const words = body.replace(/```[\s\S]*?```/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

export const formatDate = (d: Date, style: 'long' | 'short' = 'long') =>
  d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: style === 'long' ? 'long' : 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });

// "*Italic*" → <em>Italic</em> for display, and plain text for copying.
const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const inlineMd = (s: string) => escape(s).replace(/\*(.+?)\*/g, '<em>$1</em>');
export const plainMd = (s: string) => s.replace(/\*(.+?)\*/g, '$1');
// Exercise questions are written by JJ, so allow their inline HTML (<sup>) through.
export const questionMd = (s: string) =>
  s.replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*(.+?)\*/g, '<em>$1</em>');
