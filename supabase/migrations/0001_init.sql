-- ============================================================================
-- De Accolade Magazine — initial schema
-- Run in Supabase: SQL Editor → paste → Run  (or `supabase db push`)
-- Safe defaults: row-level security on every table; the public (anon) role can
-- only read published content and insert into the inbox tables.
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------- Enums ----------------------------------------------------------
do $$ begin
  create type public.staff_role as enum ('super_admin', 'editor', 'reporter');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.article_status as enum ('draft', 'pending', 'published', 'archived');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.article_type as enum ('article', 'video', 'gallery', 'live');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.comment_status as enum ('pending', 'approved', 'rejected', 'spam');
exception when duplicate_object then null; end $$;

-- ---------- Profiles (staff) -------------------------------------------------
-- role is NULL for anyone who has not been granted newsroom access.
-- Only a super admin (through the server, using the service-role key) can set it.
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null default '',
  slug        text unique,
  role        public.staff_role,
  bio         text,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Role helpers (security definer so policies can call them without recursion)
create or replace function public.my_role()
returns public.staff_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;
create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role is not null from public.profiles where id = auth.uid()), false)
$$;
create or replace function public.is_editor()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role in ('super_admin', 'editor') from public.profiles where id = auth.uid()), false)
$$;
create or replace function public.is_super_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'super_admin' from public.profiles where id = auth.uid()), false)
$$;

-- ---------- Articles ----------------------------------------------------------
create table if not exists public.articles (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title            text not null check (char_length(title) between 3 and 200),
  subtitle         text,
  excerpt          text,
  body             text not null default '',
  category         text not null,
  tags             text[] not null default '{}',
  type             public.article_type not null default 'article',
  language         text not null default 'en' check (language in ('en', 'ig', 'yo', 'ha')),
  translation_of   uuid references public.articles (id) on delete set null,
  status           public.article_status not null default 'draft',
  featured         boolean not null default false,
  breaking         boolean not null default false,
  featured_image   text,
  featured_image_alt text,
  image_credit     text,
  youtube_url      text,
  video_url        text,
  gallery          jsonb not null default '[]'::jsonb,
  attachments      jsonb not null default '[]'::jsonb,
  author_id        uuid references public.profiles (id) on delete set null,
  byline           text,
  seo_title        text,
  seo_description  text,
  keywords         text,
  views            integer not null default 0,
  reading_minutes  integer not null default 1,
  published_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  search           tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(subtitle, '') || ' ' || coalesce(excerpt, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(body, '')), 'C')
  ) stored
);

create index if not exists articles_published_idx on public.articles (status, published_at desc);
create index if not exists articles_category_idx on public.articles (category, published_at desc);
create index if not exists articles_language_idx on public.articles (language);
create index if not exists articles_translation_idx on public.articles (translation_of);
create index if not exists articles_author_idx on public.articles (author_id);
create index if not exists articles_views_idx on public.articles (views desc);
create index if not exists articles_search_idx on public.articles using gin (search);
create index if not exists articles_tags_idx on public.articles using gin (tags);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists articles_touch on public.articles;
create trigger articles_touch before update on public.articles
  for each row execute function public.touch_updated_at();

-- Reporters may only draft or submit; editors publish.
-- SECURITY INVOKER on purpose: current_user must reflect the caller's role (anon/authenticated).
create or replace function public.guard_article_status()
returns trigger language plpgsql security invoker set search_path = public as $$
begin
  -- Trusted contexts: the service-role key, the database owner (SQL editor, seeds) and editors.
  if current_user not in ('anon', 'authenticated') or auth.role() = 'service_role' or public.is_editor() then
    if new.status = 'published' and new.published_at is null then
      new.published_at = now();
    end if;
    return new;
  end if;
  if new.status not in ('draft', 'pending') then
    raise exception 'Only editors can publish or archive articles';
  end if;
  if tg_op = 'INSERT' then
    new.featured = false;
    new.breaking = false;
  else
    new.featured = old.featured;
    new.breaking = old.breaking;
  end if;
  return new;
end $$;
drop trigger if exists articles_guard on public.articles;
create trigger articles_guard before insert or update on public.articles
  for each row execute function public.guard_article_status();

-- ---------- Live coverage timeline -----------------------------------------
create table if not exists public.live_updates (
  id          uuid primary key default gen_random_uuid(),
  article_id  uuid not null references public.articles (id) on delete cascade,
  body        text not null check (char_length(body) between 1 and 5000),
  image_url   text,
  created_by  uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now()
);
create index if not exists live_updates_article_idx on public.live_updates (article_id, created_at desc);

-- ---------- Comments ----------------------------------------------------------
create table if not exists public.comments (
  id          uuid primary key default gen_random_uuid(),
  article_id  uuid not null references public.articles (id) on delete cascade,
  name        text not null check (char_length(name) between 2 and 80),
  email       text not null,
  body        text not null check (char_length(body) between 2 and 2000),
  status      public.comment_status not null default 'pending',
  created_at  timestamptz not null default now()
);
create index if not exists comments_article_idx on public.comments (article_id, status, created_at);

-- ---------- Inbox tables ------------------------------------------------------
create table if not exists public.subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  language    text not null default 'en',
  created_at  timestamptz not null default now()
);
create unique index if not exists subscribers_email_uidx on public.subscribers (lower(email));

create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text,
  subject     text not null,
  message     text not null,
  handled     boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists public.bookings (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text not null,
  package     text not null,
  event_date  date,
  location    text,
  details     text,
  status      text not null default 'new' check (status in ('new', 'contacted', 'confirmed', 'closed')),
  created_at  timestamptz not null default now()
);

-- ---------- Breaking-news ticker ---------------------------------------------
create table if not exists public.breaking_news (
  id          uuid primary key default gen_random_uuid(),
  headline    text not null check (char_length(headline) between 5 and 200),
  link        text,
  active      boolean not null default true,
  created_by  uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ---------- Admin activity log -----------------------------------------------
create table if not exists public.activity_log (
  id          bigint generated always as identity primary key,
  actor_id    uuid references public.profiles (id) on delete set null,
  action      text not null,
  entity      text,
  entity_id   text,
  meta        jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists activity_log_created_idx on public.activity_log (created_at desc);

-- ---------- Rate limiting (for public forms) --------------------------------
create table if not exists public.rate_limits (
  key           text primary key,
  window_start  timestamptz not null default now(),
  hits          integer not null default 0
);

create or replace function public.check_rate_limit(p_key text, p_max integer, p_window_seconds integer)
returns boolean language plpgsql security definer set search_path = public as $$
declare v_hits integer;
begin
  insert into public.rate_limits as r (key, window_start, hits)
  values (p_key, now(), 1)
  on conflict (key) do update
    set hits = case when r.window_start < now() - make_interval(secs => p_window_seconds) then 1 else r.hits + 1 end,
        window_start = case when r.window_start < now() - make_interval(secs => p_window_seconds) then now() else r.window_start end
  returning hits into v_hits;
  return v_hits <= p_max;
end $$;

-- View counter (called from the article page; no direct write access needed)
create or replace function public.increment_article_view(p_slug text)
returns void language sql security definer set search_path = public as $$
  update public.articles set views = views + 1
  where slug = p_slug and status = 'published';
$$;

-- ============================================================================
-- Row-level security
-- ============================================================================
alter table public.profiles         enable row level security;
alter table public.articles         enable row level security;
alter table public.live_updates     enable row level security;
alter table public.comments         enable row level security;
alter table public.subscribers      enable row level security;
alter table public.contact_messages enable row level security;
alter table public.bookings         enable row level security;
alter table public.breaking_news    enable row level security;
alter table public.activity_log     enable row level security;
alter table public.rate_limits      enable row level security;  -- no policies: function access only

-- Profiles: author name/bio are public; only name/bio/avatar are self-editable.
drop policy if exists "profiles readable" on public.profiles;
create policy "profiles readable" on public.profiles for select using (true);
drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
revoke update on public.profiles from anon, authenticated;
grant update (full_name, bio, avatar_url) on public.profiles to authenticated;

-- Articles
drop policy if exists "articles public read" on public.articles;
create policy "articles public read" on public.articles for select
  using ((status = 'published' and published_at <= now()) or public.is_staff());
drop policy if exists "articles staff insert" on public.articles;
create policy "articles staff insert" on public.articles for insert
  with check (public.is_editor() or (public.is_staff() and author_id = auth.uid()));
drop policy if exists "articles staff update" on public.articles;
create policy "articles staff update" on public.articles for update
  using (public.is_editor() or (public.is_staff() and author_id = auth.uid() and status in ('draft', 'pending')))
  with check (public.is_editor() or (public.is_staff() and author_id = auth.uid()));
drop policy if exists "articles editor delete" on public.articles;
create policy "articles editor delete" on public.articles for delete using (public.is_editor());

-- Live updates
drop policy if exists "live public read" on public.live_updates;
create policy "live public read" on public.live_updates for select using (
  public.is_staff() or exists (
    select 1 from public.articles a where a.id = article_id and a.status = 'published'
  )
);
drop policy if exists "live editor write" on public.live_updates;
create policy "live editor write" on public.live_updates for all
  using (public.is_editor()) with check (public.is_editor());

-- Comments: anyone may submit (lands as pending). Emails are never exposed publicly.
drop policy if exists "comments public read" on public.comments;
create policy "comments public read" on public.comments for select
  using (status = 'approved' or public.is_staff());
drop policy if exists "comments public insert" on public.comments;
create policy "comments public insert" on public.comments for insert
  with check (status = 'pending');
drop policy if exists "comments editor moderate" on public.comments;
create policy "comments editor moderate" on public.comments for update
  using (public.is_editor()) with check (public.is_editor());
drop policy if exists "comments editor delete" on public.comments;
create policy "comments editor delete" on public.comments for delete using (public.is_editor());
revoke select on public.comments from anon;
grant select (id, article_id, name, body, status, created_at) on public.comments to anon;

-- Inbox tables: public insert only; editors read and manage.
drop policy if exists "subscribers insert" on public.subscribers;
create policy "subscribers insert" on public.subscribers for insert with check (true);
drop policy if exists "subscribers editor" on public.subscribers;
create policy "subscribers editor" on public.subscribers for select using (public.is_editor());
drop policy if exists "subscribers editor delete" on public.subscribers;
create policy "subscribers editor delete" on public.subscribers for delete using (public.is_editor());

drop policy if exists "contact insert" on public.contact_messages;
create policy "contact insert" on public.contact_messages for insert with check (handled = false);
drop policy if exists "contact editor" on public.contact_messages;
create policy "contact editor" on public.contact_messages for select using (public.is_editor());
drop policy if exists "contact editor update" on public.contact_messages;
create policy "contact editor update" on public.contact_messages for update
  using (public.is_editor()) with check (public.is_editor());
drop policy if exists "contact editor delete" on public.contact_messages;
create policy "contact editor delete" on public.contact_messages for delete using (public.is_editor());

drop policy if exists "bookings insert" on public.bookings;
create policy "bookings insert" on public.bookings for insert with check (status = 'new');
drop policy if exists "bookings editor" on public.bookings;
create policy "bookings editor" on public.bookings for select using (public.is_editor());
drop policy if exists "bookings editor update" on public.bookings;
create policy "bookings editor update" on public.bookings for update
  using (public.is_editor()) with check (public.is_editor());
drop policy if exists "bookings editor delete" on public.bookings;
create policy "bookings editor delete" on public.bookings for delete using (public.is_editor());

-- Breaking news
drop policy if exists "breaking public read" on public.breaking_news;
create policy "breaking public read" on public.breaking_news for select using (active or public.is_staff());
drop policy if exists "breaking editor write" on public.breaking_news;
create policy "breaking editor write" on public.breaking_news for all
  using (public.is_editor()) with check (public.is_editor());

-- Activity log: staff write their own entries; super admins read.
drop policy if exists "activity insert" on public.activity_log;
create policy "activity insert" on public.activity_log for insert
  with check (public.is_staff() and actor_id = auth.uid());
drop policy if exists "activity read" on public.activity_log;
create policy "activity read" on public.activity_log for select using (public.is_super_admin());

-- Function execution
revoke execute on function public.check_rate_limit(text, integer, integer) from public;
grant execute on function public.check_rate_limit(text, integer, integer) to anon, authenticated;
grant execute on function public.increment_article_view(text) to anon, authenticated;

-- ============================================================================
-- Storage: public "media" bucket; only newsroom staff can upload or delete.
-- ============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 10485760,
  array['image/jpeg','image/png','image/webp','image/gif','application/pdf',
        'application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'video/mp4'])
on conflict (id) do update set public = excluded.public,
  file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media staff insert" on storage.objects;
create policy "media staff insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_staff());
drop policy if exists "media staff update" on storage.objects;
create policy "media staff update" on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_staff());
drop policy if exists "media editor delete" on storage.objects;
create policy "media editor delete" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_editor());
