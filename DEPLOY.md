# Moving geewax.org from Ghost to GitHub Pages

The new site is in this folder and builds cleanly. What's left is content only you can supply, getting data out of Ghost **before** you cancel, and a DNS switch.

**Order matters.** Ghost hosts every post image and the only copy of the paywalled exercise solutions. Cancel it last.

```
1. Get everything out of Ghost        (content ✅; members + Stripe left)
2. Fill in the TODO(jj) list          (1 hour, needs you)
3. Push to GitHub                     ✅ done
4. Point DNS at GitHub Pages          (10 min + up to an hour for HTTPS)
5. Check the live site                (10 min)
6. Cancel Ghost and tidy up           (15 min)
```

Cost afterwards: $0/month. You only pay for the domain.

---

## 1. Get everything out of Ghost

Ghost stays live for this whole step.

### 1a. Export content ✅ done

The export (`jj-geewax-blog.ghost.2026-10-03-....json`) is in this folder and has been imported:

- The four API Design Patterns solutions are now Markdown in `src/content/exercises/` (`3-1.md` ... `4-2.md`). The Mermaid diagram from 4.2 was downloaded to `public/images/exercises/`.
- The five public posts were already imported.

Still to do:

- **Move the export out of this folder** to somewhere private once you're happy with the site. It's gitignored, but it contains your Ghost login (email and password hash) and is the only copy of your drafts.
- **Drafts you never published are still in the export**, including a half-written Exercise 5.1 (UTF-16 vs UTF-8) and around 20 older drafts (App Engine routing, code review, heroism in the workplace, ...). Nothing was imported. To bring one back later, finish it and add it as a Markdown file.

To re-import anything, run `npm run import:ghost -- <export.json> --only <ghost-slug>`.

### 1b. Export subscribers (recommended)

Ghost Admin → **Members → ⋯ → Export all members**. Keep the CSV somewhere private. It's gitignored, so never commit it. It's a list of people who asked to hear from you, and it's worth keeping even if you never email them.

Optionally, send a last newsletter from Ghost before cancelling: "The site's moving, solutions are now free, and here's the RSS feed: https://www.geewax.org/rss.xml".

### 1c. Shut down paid subscriptions (required if anyone is paying)

1. Ghost Admin → **Members**, filter by _Status: Paid_. If anyone is on the Premium API Content tier, cancel them in Stripe (or tell them first). Otherwise Stripe could keep charging after Ghost is gone.
2. Ghost Admin → **Settings → Membership → Tiers**: archive the paid tier.
3. Ghost Admin → **Settings → Membership → Stripe**: disconnect.

---

## 2. Fill in the TODO(jj) list

```sh
npm run check:todos
```

This lists every placeholder. **The deploy workflow refuses to publish until the list is empty**, so a résumé with blank dates can't go live by accident. Right now there are 9:

| Where                           | What                                                                                                                                                                                                                                                                |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/content/pages/resume.md`   | DeepMind start date, plus 2-3 bullets you're comfortable making public                                                                                                                                                                                              |
| `src/content/pages/resume.md`   | Meta dates, and one line each for WhatsApp and Ad Signal                                                                                                                                                                                                            |
| `src/content/pages/resume.md`   | Google Payments end date                                                                                                                                                                                                                                            |
| `src/content/pages/resume.md`   | Boards and advisory: which are still current? Add end dates to the rest                                                                                                                                                                                             |
| `src/content/pages/speaking.md` | **Headshot.** A professional photo, at least 2000px on the short side. Save it as `public/images/jj-geewax-headshot.jpg` and uncomment the `headshot:` line. The only photo online now (GitHub avatar) is a Google Glass selfie from around 2013. Replace that too. |
| `src/content/pages/speaking.md` | Past talks, podcasts and panels. Only ASC 2019 is listed. Organizers look for this list first.                                                                                                                                                                      |

Also worth a read-through before launch:

- **Bios** (`speaking.md`), **home** (`home.md`) and **about** (`about.md`). I wrote these from your LinkedIn, GitHub README, old bio and 2022 résumé, so check every sentence. In particular, check the wording of your DeepMind role against whatever Google's comms and external-profile guidance says. "Views are my own" is already in the footer.
- **Flutter post.** It was marked "not 100% complete". I removed that warning and the `<TODO>` placeholders, replaced a `<URL>` placeholder with Apple's enrollment link, and wrote the missing Xcode "Sign in with Apple" capability step. I also unlinked a URL that pointed at your real Firebase project. Skim the diff.

Preview everything locally:

```sh
npm run dev                          # http://localhost:4321, live reload
npm run build && npm run pdf         # production build + dist/jj-geewax-resume.pdf
npm run preview                      # serve the production build
```

---

## 3. Push to GitHub ✅ done

- Repo: https://github.com/jgeewax/geewax.org (public). Your old `jgeewax/jgeewax.github.io` dotfiles repo is untouched.
- **Settings → Pages:** source is GitHub Actions, custom domain is `www.geewax.org` (also in `public/CNAME`).
- The **Deploy** workflow (`.github/workflows/deploy.yml`) runs on every push to `main`: TODO, link and punctuation checks, then build, then résumé PDF, then publish. Pull requests run the same checks without publishing. The first run passed.

Until DNS points at GitHub (step 4), the new site isn't visible at geewax.org, and the github.io address redirects to the domain. To check what GitHub is serving before switching:

```sh
curl --resolve www.geewax.org:80:185.199.108.153 http://www.geewax.org/speaking/
```

**Verify the domain** so nobody else can claim it on GitHub: **your account Settings → Pages → Add a domain → `geewax.org`**. GitHub gives you a TXT record to add in Cloudflare. It's one extra record and prevents domain takeover.

---

## 4. Point DNS at GitHub Pages (Cloudflare)

Cloudflare dashboard → **geewax.org → DNS → Records**.

> ⚠️ **Don't touch the MX records** (`aspmx.l.google.com` and friends). They carry your jj@geewax.org email.

1. **Delete** the current `geewax.org` and `www` records that point at Ghost.
2. **Add** these, all with **Proxy status: DNS only** (grey cloud):

   | Type  | Name  | Content               |
   | ----- | ----- | --------------------- |
   | CNAME | `www` | `jgeewax.github.io`   |
   | A     | `@`   | `185.199.108.153`     |
   | A     | `@`   | `185.199.109.153`     |
   | A     | `@`   | `185.199.110.153`     |
   | A     | `@`   | `185.199.111.153`     |
   | AAAA  | `@`   | `2606:50c0:8000::153` |
   | AAAA  | `@`   | `2606:50c0:8001::153` |
   | AAAA  | `@`   | `2606:50c0:8002::153` |
   | AAAA  | `@`   | `2606:50c0:8003::153` |

   GitHub redirects `geewax.org` → `www.geewax.org`, which is how Ghost worked too, so search engines see no change.

3. Back in **GitHub → Settings → Pages**, wait for the DNS check to pass and the certificate to be issued (a few minutes, sometimes up to an hour). Then tick **Enforce HTTPS**.

**Why grey cloud and not Cloudflare's proxy?** GitHub issues and renews the HTTPS certificate itself, and the proxy gets in the way of that. The old Ghost URLs are already handled without Cloudflare:

| Old URL                                                  | Now                                                                                     |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `/<post-slug>/`                                          | Same URL, same post                                                                     |
| `/api-design-patterns-exercise-3-1/` (and 3-2, 4-1, 4-2) | Redirects to that exercise on `/api-design-patterns-exercise-solutions/`, solution open |
| `/tag/exercise-solutions/`                               | Redirects to `/api-design-patterns-exercise-solutions/`                                 |
| `/tag/.../` (other tags)                                 | Real tag pages                                                                          |
| `/speaker-bio/`                                          | Redirects to `/speaking/`                                                               |
| `/author/jj-geewax/`                                     | Redirects to `/about/`                                                                  |
| `/rss/`                                                  | Redirects to `/rss.xml`                                                                 |
| `/page/2/`                                               | Redirects to `/writing/`                                                                |
| `/content/files/2022/10/Resume---JJ-Geewax---2022-1.pdf` | Serves the current résumé PDF                                                           |

---

## 5. Check the live site

- [ ] https://www.geewax.org loads over HTTPS, and https://geewax.org redirects to it
- [ ] https://www.geewax.org/speaker-bio/ lands on the speaker kit
- [ ] https://www.geewax.org/jj-geewax-resume.pdf downloads
- [ ] https://www.geewax.org/api-design-patterns-exercise-3-1/ jumps to Exercise 3.1 on the solutions page, with the solution open
- [ ] Images on https://www.geewax.org/flutter-sign-in-with-apple/ load (they're served from `/images/...`, not Ghost)
- [ ] https://www.geewax.org/rss.xml is valid
- [ ] Paste https://www.geewax.org into [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) and check that the preview card appears
- [ ] Send yourself a test email at jj@geewax.org

---

## 6. Cancel Ghost and tidy up

Once step 5 passes:

1. **Ghost Admin → Settings → Billing → Cancel subscription.**
2. **Cloudflare DNS:**
   - Change the SPF TXT record from
     `v=spf1 include:_spf.google.com include:mailgun.org ~all` to
     `v=spf1 include:_spf.google.com ~all`
     (Mailgun was only for Ghost newsletters.)
   - Delete any leftover Mailgun records (look for `mailgun`, `email.`, `mg.` or `*._domainkey` entries that aren't Google's).
   - The `keybase-site-verification` TXT can go too if you're not using Keybase.
3. **Google Search Console:** add `https://www.geewax.org` (DNS verification is easiest) and submit `https://www.geewax.org/sitemap-index.xml`.
4. **Update your profiles:**
   - GitHub profile README: the hit counter (`profile-counter.glitch.me`) is dead (Glitch returns 410). Remove it. Also change your GitHub **company** field from "WhatsApp".
   - LinkedIn, X, and your Manning author page: link to https://www.geewax.org/speaking/ for bios.

---

## Day to day

**Write a post:** add `src/content/posts/my-post-slug.md`. The filename becomes the URL (`/my-post-slug/`).

```md
---
title: My post
description: One or two sentences. Used in lists, search results and link previews.
date: 2026-10-01
tags: [api-design] # optional
image: /images/posts/my-post-slug/cover.png # optional, link-preview image only
draft: true # optional; drafts show in `npm run dev` only
---

Write Markdown here. Put images in public/images/posts/my-post-slug/.
```

Push to `main` and it's live in about a minute.

**Add an exercise solution:** add `src/content/exercises/5-1.md`. It appears on `/api-design-patterns-exercise-solutions/` under its chapter. Solutions aren't blog posts, so they stay out of Writing and RSS.

```md
---
exercise: "5.1"
chapter: 5
question: "A company in Japan targeting Japanese speakers only wants to use UTF-16 ..."
---

The solution, in Markdown. Use #### for headings (the page already uses h2 for
chapters and h3 for exercises).
```

If it's a new chapter, add its title under `chapters:` in `src/content/pages/exercise-solutions.md`.

**Everything else:**

| To change...                                     | Edit                                      |
| ------------------------------------------------ | ----------------------------------------- |
| Home page intro, books, research list            | `src/content/pages/home.md`               |
| Exercise solutions intro, chapter titles         | `src/content/pages/exercise-solutions.md` |
| About                                            | `src/content/pages/about.md`              |
| Speaker bios, topics, talks, headshot            | `src/content/pages/speaking.md`           |
| Résumé (HTML and PDF)                            | `src/content/pages/resume.md`             |
| Name, title (`role`, `org`), email, social links | `src/site.ts`                             |
| Tag display names                                | `src/lib/posts.ts` (`TAG_LABELS`)         |
| Colors, fonts                                    | `src/styles/global.css` (top of file)     |
| Link-preview image                               | `public/og.png` (1200×630)                |

When your title changes, update `src/site.ts` plus the bios in `speaking.md`. The résumé header, footer, link previews and search-engine metadata all follow automatically.
