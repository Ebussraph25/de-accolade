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
- Email/password sign-in, password reset, invite-only accounts, optional or enforced two-factor authentication (TOTP)
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

## Deploying to Vercel with your domain

### 1. Create the database (Supabase, about 10 minutes)
1. Create a project at [supabase.com](https://supabase.com). Choose the region closest to your readers (for Nigeria, **West EU (London)** or **Central EU (Frankfurt)**).
2. Open **SQL Editor → New query**, paste the contents of `supabase/migrations/0001_init.sql`, then click **Run**. This creates the tables, security rules and the `media` storage bucket. The script is safe to run again.
3. Go to **Authentication → Sign In / Providers → Email**:
   - Turn **off** "Allow new users to sign up". Accounts are invite-only. Even if sign-ups stay on, a new account has no newsroom access until a super admin grants a role.
4. Go to **Authentication → URL Configuration**:
   - **Site URL**: `https://www.yourdomain.com`
   - **Redirect URLs**: add `https://www.yourdomain.com/auth/callback` (and your `*.vercel.app` preview URL if you want to test there).
5. Copy the **Project URL**, **anon public key** and **service_role key** from **Project Settings → API**.

### 2. Deploy
1. Push this folder to a GitHub repository.
2. In Vercel: **Add New → Project → Import** the repository. Vercel detects Next.js automatically.
3. Add the environment variables from `.env.example` (at minimum `NEXT_PUBLIC_SITE_URL`, the three Supabase values and `RATE_LIMIT_SALT`).
4. Click **Deploy**.
5. Optional: under **Settings → Functions**, set the region to match your Supabase region (e.g. `lhr1` London or `fra1` Frankfurt) for faster page loads.

### 3. Connect your paid domain
1. In Vercel: **Project → Settings → Domains → Add** `yourdomain.com` and `www.yourdomain.com`.
2. At your domain registrar, add the DNS records Vercel shows. Usually that is an `A` record for the apex pointing to Vercel's IP and a `CNAME` for `www` to `cname.vercel-dns.com`. Alternatively, switch the domain's nameservers to Vercel.
3. SSL certificates are issued automatically.
4. Make sure `NEXT_PUBLIC_SITE_URL` matches the primary domain, then redeploy.

### 4. First admin
1. In Supabase: **Authentication → Users → Add user**. Enter your email and a strong password, and tick "Auto confirm".
2. In **SQL Editor**, run:
   ```sql
   update public.profiles
   set role = 'super_admin', full_name = 'Your Name', slug = 'your-name'
   where id = (select id from auth.users where email = 'you@example.com');
   ```
3. Sign in at `https://yourdomain.com/admin/login`, open **My account** and turn on two-factor authentication.
4. Invite the rest of the team from **Team & activity**. They receive an email to set their password.

### 5. Go-live checklist
- [ ] Publish at least one story and mark one as **Front-page lead**
- [ ] Add headlines to the **Breaking ticker** (or leave it empty to hide it)
- [ ] Fill in contact email, phone, WhatsApp and social links in the environment variables
- [ ] Have a native speaker review the Igbo, Yoruba and Hausa interface wording in `lib/i18n.ts`
- [ ] Have your legal adviser review `/privacy` and `/terms` (including the Nigeria Data Protection Act 2023)
- [ ] Submit `https://yourdomain.com/sitemap.xml` and `news-sitemap.xml` in Google Search Console; apply to Google News via the Publisher Center
- [ ] Optional: add `NEXT_PUBLIC_GA_ID` (Google Analytics 4) and enable **Vercel Analytics** in the Vercel dashboard
- [ ] Optional: add `RESEND_API_KEY` for email alerts on new messages and bookings
- [ ] Supabase: enable **Point-in-Time Recovery** or daily backups (Pro plan) for the backup requirement
- [ ] Supabase: configure a custom SMTP sender under Authentication → Emails so invitations come from your domain

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
  auth/callback/       email-link handler (invites, password reset)
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
