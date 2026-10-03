import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Blog posts. The filename is the URL: src/content/posts/foo.md → /foo/
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    // Used for social previews (og:image), not shown on the page.
    image: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

// API Design Patterns exercise solutions, all shown on one page
// (/api-design-patterns-exercise-solutions/). File name = exercise, e.g. 3-1.md.
const exercises = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/exercises' }),
  schema: z.object({
    exercise: z.string(), // "3.1"
    chapter: z.number(),
    question: z.string(), // Markdown-ish: `code`, *italics* and <sup> are fine
    date: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

// url: a full URL for other sites, or a path like /writing/ for pages on this one.
const link = z.object({ label: z.string(), url: z.union([z.url(), z.string().regex(/^\//)]) });

// One-off pages (home, about, speaking, résumé, ...). Most of the page is the
// Markdown body; the optional fields below feed the structured bits.
const pages = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // home.md
    books: z
      .array(
        z.object({
          title: z.string(),
          publisher: z.string(),
          year: z.number(),
          cover: z.string(),
          blurb: z.string(),
          links: z.array(link),
        }),
      )
      .optional(),
    work: z
      .array(
        z.object({
          year: z.string(),
          venue: z.string(),
          title: z.string(),
          note: z.string().optional(),
          url: z.url(),
        }),
      )
      .optional(),
    // exercise-solutions.md: chapter number → title
    chapters: z.record(z.string(), z.string()).optional(),
    // speaking.md
    bios: z.object({ short: z.string(), medium: z.string(), long: z.string() }).optional(),
    headshot: z.string().optional(),
    topics: z.array(z.object({ title: z.string(), blurb: z.string() })).optional(),
    talks: z
      .array(
        z.object({
          year: z.number(),
          event: z.string(),
          title: z.string(),
          location: z.string().optional(),
          url: z.url().optional(),
          video: z.url().optional(),
        }),
      )
      .optional(),
  }),
});

export const collections = { posts, exercises, pages };
