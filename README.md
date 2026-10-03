# geewax.org

Personal site of JJ Geewax. [Astro](https://astro.build), Markdown content, deployed to GitHub Pages.

```sh
npm install
npm run dev              # http://localhost:4321
npm run build            # → dist/
npm run pdf              # dist/resume → dist/jj-geewax-resume.pdf (needs Chrome)
npm run check:todos      # anything still marked TODO(jj)
```

- **Content:** `src/content/posts/*.md` (blog), `src/content/exercises/*.md` (API Design Patterns solutions, one page) and `src/content/pages/*.md` (home, about, speaking, résumé)
- **Site facts:** `src/site.ts`
- **Styles:** `src/styles/global.css`
- **Deploy:** push to `main`. See [DEPLOY.md](DEPLOY.md) for the one-time migration off Ghost.
