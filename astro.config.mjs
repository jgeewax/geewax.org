import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // www is the canonical host (it was on Ghost too, so search engines already know it).
  site: 'https://www.geewax.org',
  trailingSlash: 'always',
  build: { format: 'directory' },
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  integrations: [sitemap({ filter: (page) => !/\/(speaker-bio|author|rss|page|api-design-patterns-exercise-\d+-\d+)\//.test(page) })],
  markdown: {
    // Keep characters exactly as written: no curly quotes, en/em dashes or ellipses.
    smartypants: false,
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark-dimmed' },
    },
  },
  // Old Ghost URLs. GitHub Pages can't send real 301s, so Astro writes small
  // meta-refresh pages here, and Cloudflare Redirect Rules (see DEPLOY.md) do
  // the proper 301s in front of them. (/rss/ → /rss.xml lives in
  // src/pages/rss/index.astro, because this option would add a trailing slash.
  // Old per-exercise URLs are handled by src/pages/api-design-patterns-exercise-[n].astro.)
  redirects: {
    '/speaker-bio': '/speaking/',
    '/author/jj-geewax': '/about/',
    '/page/2': '/writing/',
    '/tag/exercise-solutions': '/api-design-patterns-exercise-solutions/',
  },
});
