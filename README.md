# De Accolade

**De Accolade Magazine** is a digital newspaper and newsroom CMS. It is an Agunjiegbe Online Television publication.
*Your Voice. Our Community. Our Story.*

Built with Next.js 16, React 19, TypeScript and Tailwind CSS 4. Supabase provides the database, authentication and media storage, and the site deploys to Vercel.

---

## What's included

**Public site**
- Front page with lead story, trending list, latest news, video desk, community spotlight, cultural heritage (Igbo, Yoruba, Hausa) and event-coverage call-to-action
- Breaking-news ticker (edited from the admin, pauses on hover, respects reduced motion)
- Section and category pages (News, Culture, Entertainment, Sports, Interviews, Event Coverage) with pagination
- Article pages with drop cap, in-article and sidebar ad slots, YouTube/MP4 video, photo gallery, document downloads, tags, share buttons (WhatsApp, Facebook, X, copy link), related stories, moderated comments and view counting
- Live coverage: timeline updates that refresh automatically for readers
- Video page fed automatically from the Agunjiegbe Online Television YouTube channel (no API key needed)
- Search with filters for category, language, media type and date range, plus author matches
- Event Coverage booking page, Advertise page, About, Contact, author pages, Privacy and Terms
- Language selector (English, Igbo, Yoruba, Hausa): translates the interface and swaps in translated versions of stories where editors have published them
- Dark/light mode that remembers the reader's choice
- Newsletter sign-up

**Newsroom (`/admin`)**
- Email/password sign-in, accounts created by super admins (no email service needed), password resets by super admins, enforced two-factor authentication (TOTP)
- Roles: **Super admin** (everything, plus team and activity log), **Editor** (publish, edit, media, moderation, inbox) and **Reporter** (drafts and submitting for review). The database enforces these rules itself, not just the UI.
- Story editor: Markdown with toolbar and live preview, image uploads, gallery with captions and credits, documents, YouTube or MP4 video, SEO title and description with Google preview, tags, byline, language and translation linking, scheduling, front-page lead and breaking flags
- Live timeline posting for live coverage
- Comment moderation queue, breaking ticker manager
- Inbox for contact messages, coverage bookings and newsletter subscribers (CSV export)
- Dashboard: published counts, review queue, most-read stories, views by category, stories by language
- Activity log of staff actions

**SEO, performance and security**
- Per-page metadata, Open Graph and Twitter cards, auto-generated share images for stories without a photo
- `NewsArticle`/`LiveBlogPosting`, `BreadcrumbList` and `NewsMediaOrganization` structured data
- `sitemap.xml`, a Google News sitemap (`news-sitemap.xml`, last 48 hours), `robots.txt` and an RSS feed (`feed.xml`)
- Installable PWA manifest and icons
- Security headers (CSP, HSTS, frame, content-type, referrer and permissions policies)
- Row-level security on every table, server-side validation, rate limiting, honeypot spam traps, sanitised article HTML, and upload type and size limits
- Self-hosted fonts (Newsreader and Libre Franklin) and cached data queries

---

## Current setup (already done)

| Piece | Where |
| --- | --- |
| Code | GitHub `Ebussraph25/de-accolade`. Every push to `main` deploys automatically |
| Hosting | Vercel project `de-accolade`, served from Paris (`cdg1`) |
| Temporary address | https://de-accolade.vercel.app (hidden from Google until the real domain is connected) |
| Database, sign-in and media | Supabase project `de-accolade` (`cuhgaezwszmwgbdlzlcy`), Paris (`eu-west-3`) |
| Migrations applied | `supabase/migrations/0001_init.sql` to `0004_reset_2fa.sql` |
| Vercel settings | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `RATE_LIMIT_SALT`, `REQUIRE_ADMIN_2FA=true`, `CRON_SECRET` |

Until the newsroom publishes its first real story, the public site shows clearly labelled **sample stories**. They are not stored in the database, are marked `noindex`, never appear in sitemaps, and vanish automatically once one real story is published.

## Going live on your domain

1. **Buy the domain** from any registrar.
2. In Vercel, open **de-accolade → Settings → Domains → Add**. Enter `yourdomain.com` and choose to also add `www.yourdomain.com`.
3. At your registrar, add the DNS records Vercel shows. Usually that's an `A` record for `@` and a `CNAME` for `www` pointing to Vercel. SSL is issued automatically within minutes.
4. In Vercel, open **Deployments → ⋯ on the latest → Redeploy**. The site now uses the new domain for canonical links, sitemaps and share images, and allows Google to index it. No settings need changing.
5. **Google Search Console**: add the domain property (DNS verification through your registrar is simplest), then submit `https://yourdomain.com/sitemap.xml` and `https://yourdomain.com/news-sitemap.xml`. For Google News, add the publication in the Google News Publisher Center.
6. Publish real stories. The sample stories disappear on their own.

## Running on free plans

The site is set up to run at no cost apart from the domain:

| Service | Plan | What keeps it within the free limits |
| --- | --- | --- |
| Vercel (hosting) | Hobby, free | Pages and data are cached. Images use one format (WebP), four sizes and a 31-day cache, to stay under the monthly image-optimisation allowance. |
| Supabase (database, sign-in, media) | Free | A daily job (`vercel.json` → `/api/keepalive`) stops the project being paused for inactivity. Photos are resized to 1920px and compressed to WebP in the browser before upload (typically 200–400 KB each), so the 1 GB storage holds thousands of photos. |
| GitHub | Free | Code and automatic deploys |
| YouTube | Free | Video hosting (embed YouTube links rather than uploading video files) |

Things to know about the free plans:
- **Vercel Hobby is intended for non-commercial use.** It's fine while the site is growing. Once it earns money (paid ads, sponsored stories, paid event coverage), Vercel's terms expect the Pro plan ($20/month). The free alternative is moving to Netlify's free plan, which allows commercial sites and runs this Next.js code.
- **No automatic database backups** on Supabase Free. Export subscribers from **Inbox → Download CSV** now and then. Every story's text is also visible on the site itself.
- **Limits to watch** (Vercel and Supabase dashboards → Usage): Supabase 500 MB database, 1 GB storage and 5 GB bandwidth a month; Vercel 100 GB bandwidth a month. A small, growing news site sits well inside these.
- If a free Supabase project ever does get paused, open it in the Supabase dashboard and click **Restore**. Nothing is lost.

## Newsroom accounts

- The first **super admin** has been created. Sign in at `/admin/login`. Two-factor authentication is required: on first sign-in you're taken to **My account** to scan a QR code with Google Authenticator or a similar app.
- Add colleagues from **Team & activity → Add a team member**. You get a temporary password to share privately; they change it under **My account**.
- Forgotten password: a super admin clicks **Reset password** next to the person in **Team & activity**.
- Lost phone / authenticator app: a super admin clicks **Reset 2FA** next to the person; they set it up again at their next sign-in.
- A second super admin is optional; it just means either can recover the other from the website.
- Everyone can change their own password and name/bio under **My account**.
- If the only super admin forgets their password or loses their phone, whoever owns the Supabase account can fix it in **Supabase → SQL Editor**:
  ```sql
  -- new temporary password
  select public.reset_staff_password((select id from auth.users where email = 'admin@example.com'), 'a-long-temporary-password');
  -- clear two-factor authentication (lost phone)
  select public.reset_staff_2fa((select id from auth.users where email = 'admin@example.com'));
  ```
- If every super admin is ever locked out, create a new one in the Supabase SQL editor:
  ```sql
  select public.create_staff_account('you@example.com', 'Your Name', 'super_admin', 'a-long-temporary-password');
  ```

## Recommended before or soon after launch

- [ ] Replace the contact email, phone, WhatsApp and social links. In Vercel, go to **Settings → Environment Variables** and add `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_CONTACT_PHONE`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_FACEBOOK_URL`, and so on (see `.env.example`), then redeploy.
- [ ] Have a native speaker review the Igbo, Yoruba and Hausa interface wording in `lib/i18n.ts`.
- [ ] Have a legal adviser review `/privacy` and `/terms` (Nigeria Data Protection Act 2023).
- [ ] Supabase → **Authentication → Sign In / Providers**: turn off "Allow new users to sign up" (accounts are created by super admins; self-sign-ups get no access anyway). Also turn on **leaked password protection**.
- [ ] Optional email: add a custom SMTP sender under Supabase **Authentication → Emails**, and set **URL Configuration → Site URL** to your domain with `https://yourdomain.com/auth/callback` as a redirect URL. This makes "Forgot password?" emails work.
- [ ] Optional: `NEXT_PUBLIC_GA_ID` (Google Analytics 4), Vercel Analytics (one click in the Vercel dashboard), `RESEND_API_KEY` for email alerts on new messages and bookings.

---

## Local development

```bash
npm install
cp .env.example .env.local    # fill in values, or leave Supabase blank for preview mode
npm run dev                   # http://localhost:3000
```

Without Supabase variables the public site runs in **preview mode** on sample stories (marked with a notice bar), and `/admin` shows setup instructions.

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |

GitHub Actions (`.github/workflows/ci.yml`) runs lint, typecheck and build on every push and pull request.

---

## Project map

```
app/
  (site)/              public pages: home, [section], [section]/[category], article/[slug], video,
                       search, event-coverage, advertise, about, contact, author/[slug], privacy, terms
  admin/               newsroom: login (+ MFA, reset), dashboard, articles, comments, breaking,
                       inbox, team, account; actions.ts holds every server action
  api/                 newsletter, contact, booking, comments, views (validated, rate limited)
  auth/callback/       email-link handler (password-reset emails, when an email sender is configured)
  og/[slug]/           generated share images
  sitemap.ts, robots.ts, news-sitemap.xml/, feed.xml/, manifest.ts
components/            site/, news/, forms/, admin/
lib/
  site.ts              brand name, tagline, contact and social settings
  taxonomy.ts          sections, categories, languages, story types
  i18n.ts              interface translations
  data.ts              all public queries (cached), YouTube feed, preview-mode fallback
  auth.ts              roles and permission checks
supabase/migrations/   database schema and security rules
proxy.ts               protects /admin and enforces two-factor sign-in
```

**Changing sections or categories:** edit `lib/taxonomy.ts`. Navigation, section pages, the sitemap and the editor's category list update automatically.

**Changing colours or fonts:** the design tokens are at the top of `app/globals.css`.

---

## Roadmap items from the PRD not in this release

These are deliberately left for later phases:
- **Push notifications and WhatsApp alerts** (Phase 2). Newsletter subscribers are collected now; export the CSV to Mailchimp, Brevo or Resend to send editions.
- **Podcasts** (Phase 2). Embed audio in stories today, or add a Podcast section in `lib/taxonomy.ts`.
- **AI translation, AI news assistant and AI headline/SEO suggestions** (Phase 3). The translation-linking model is already in place, so an AI step can create draft translations for editor approval.
- **Mobile apps** (Phase 3). The site is installable as a PWA in the meantime.
- **Facebook comments and auto-posting to social platforms.** Native moderated comments are included instead.
- **Ad network integration.** Ad slots show a house ad linking to `/advertise` until you plug in AdSense or direct campaigns in `components/site/AdSlot.tsx`.
