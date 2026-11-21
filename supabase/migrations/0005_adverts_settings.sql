-- ============================================================================
-- De Accolade Magazine Hub — adverts and site settings
-- Adverts: editors upload a banner, choose where it shows and for how long.
-- Site settings: small key/value store for things editors change themselves
-- (social media links), so they don't need a developer or a redeploy.
-- ============================================================================

-- ---------- Adverts ----------------------------------------------------------
create table if not exists public.adverts (
  id          uuid primary key default gen_random_uuid(),
  advertiser  text not null check (char_length(advertiser) between 2 and 120),
  image_url   text not null check (image_url like 'https://%'),
  link        text check (link is null or link like 'https://%' or link like 'http://%' or link like '/%'),
  alt_text    text check (alt_text is null or char_length(alt_text) <= 200),
  placement   text not null check (placement in ('leaderboard', 'rectangle', 'inline')),
  start_date  date,
  end_date    date,
  active      boolean not null default true,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date)
);
create index if not exists adverts_live_idx on public.adverts (placement, active);

-- Dates are calendar days in Nigeria, so an advert booked "until 30 November" runs all of that day in Lagos.
create or replace function public.lagos_today()
returns date language sql stable as $$ select (now() at time zone 'Africa/Lagos')::date $$;

alter table public.adverts enable row level security;
drop policy if exists "adverts public read live" on public.adverts;
create policy "adverts public read live" on public.adverts for select using (
  (active
   and (start_date is null or start_date <= public.lagos_today())
   and (end_date is null or end_date >= public.lagos_today()))
  or public.is_editor()
);
drop policy if exists "adverts editor insert" on public.adverts;
create policy "adverts editor insert" on public.adverts for insert with check (public.is_editor());
drop policy if exists "adverts editor update" on public.adverts;
create policy "adverts editor update" on public.adverts for update using (public.is_editor()) with check (public.is_editor());
drop policy if exists "adverts editor delete" on public.adverts;
create policy "adverts editor delete" on public.adverts for delete using (public.is_editor());

revoke all on public.adverts from anon;
grant select (id, image_url, link, alt_text, placement, advertiser) on public.adverts to anon;
grant select, insert, update, delete on public.adverts to authenticated;

-- ---------- Site settings ----------------------------------------------------
create table if not exists public.site_settings (
  key        text primary key check (key in ('facebook', 'instagram', 'x', 'tiktok', 'youtube', 'whatsapp')),
  value      text not null default '' check (char_length(value) <= 300),
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;
drop policy if exists "settings public read" on public.site_settings;
create policy "settings public read" on public.site_settings for select using (true);
drop policy if exists "settings editor write" on public.site_settings;
create policy "settings editor write" on public.site_settings for insert with check (public.is_editor());
drop policy if exists "settings editor update" on public.site_settings;
create policy "settings editor update" on public.site_settings for update using (public.is_editor()) with check (public.is_editor());

revoke all on public.site_settings from anon;
grant select (key, value) on public.site_settings to anon;
grant select, insert, update on public.site_settings to authenticated;
