-- ============================================================================
-- De Accolade Magazine — newsroom team management
-- Lets a super admin add colleagues, change roles and reset passwords from
-- /admin/team without email delivery or the service-role key.
-- Every function checks the caller is a super admin. Calls made directly by a
-- database administrator (SQL editor) are trusted, so the first super admin can
-- be created with: select public.create_staff_account('you@example.com','Your Name','super_admin','a-strong-password');
-- ============================================================================

-- True when the call comes from the website (PostgREST) rather than a database administrator.
create or replace function public.via_api()
returns boolean language sql stable as $$
  select session_user = 'authenticator'
$$;

create or replace function public.require_super_admin()
returns void language plpgsql stable security definer set search_path = public as $$
begin
  if public.via_api() and not public.is_super_admin() then
    raise exception 'Only super admins can manage the team' using errcode = '42501';
  end if;
end $$;

create or replace function public.slug_for(p_name text, p_id uuid)
returns text language sql immutable as $$
  select trim(both '-' from left(regexp_replace(lower(coalesce(p_name, 'staff')), '[^a-z0-9]+', '-', 'g'), 60))
         || '-' || left(p_id::text, 4)
$$;

-- Team list with email and last sign-in (auth.users is not exposed to the website otherwise).
create or replace function public.staff_directory()
returns table (id uuid, full_name text, role public.staff_role, email text, last_sign_in_at timestamptz, created_at timestamptz)
language plpgsql stable security definer set search_path = public, auth as $$
begin
  perform public.require_super_admin();
  return query
    select p.id, p.full_name, p.role, u.email::text, u.last_sign_in_at, p.created_at
    from public.profiles p join auth.users u on u.id = p.id
    order by (p.role is null), p.created_at;
end $$;

-- Create a confirmed email/password account with a newsroom role.
create or replace function public.create_staff_account(p_email text, p_full_name text, p_role public.staff_role, p_password text)
returns uuid language plpgsql security definer set search_path = public, auth, extensions as $$
declare
  v_id uuid := gen_random_uuid();
  v_email text := lower(trim(p_email));
  v_name text := trim(p_full_name);
begin
  perform public.require_super_admin();
  if v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'Enter a valid email address' using errcode = '22023';
  end if;
  if char_length(v_name) < 2 then
    raise exception 'Enter the person''s name' using errcode = '22023';
  end if;
  if char_length(p_password) < 10 then
    raise exception 'Passwords must be at least 10 characters' using errcode = '22023';
  end if;
  if exists (select 1 from auth.users where lower(email) = v_email) then
    raise exception 'An account with that email already exists' using errcode = '23505';
  end if;

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change,
    email_change_token_current, phone_change, phone_change_token, reauthentication_token
  ) values (
    '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', v_email,
    crypt(p_password, gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', v_name), now(), now(),
    '', '', '', '', '', '', '', ''
  );
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (gen_random_uuid(), v_id, v_id::text,
          jsonb_build_object('sub', v_id::text, 'email', v_email, 'email_verified', true, 'phone_verified', false),
          'email', null, now(), now());

  -- handle_new_user() has created the profile; give it a name, role and author-page slug.
  update public.profiles set full_name = v_name, role = p_role, slug = public.slug_for(v_name, v_id) where id = v_id;
  return v_id;
end $$;

create or replace function public.set_staff_role(p_user uuid, p_role public.staff_role)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.require_super_admin();
  if public.via_api() and p_user = auth.uid() then
    raise exception 'You can''t change your own role. Ask another super admin.' using errcode = '42501';
  end if;
  update public.profiles set role = p_role where id = p_user;
  if not found then raise exception 'Team member not found' using errcode = 'P0002'; end if;
end $$;

create or replace function public.reset_staff_password(p_user uuid, p_password text)
returns void language plpgsql security definer set search_path = public, auth, extensions as $$
begin
  perform public.require_super_admin();
  if char_length(p_password) < 10 then
    raise exception 'Passwords must be at least 10 characters' using errcode = '22023';
  end if;
  update auth.users set encrypted_password = crypt(p_password, gen_salt('bf')), updated_at = now() where id = p_user;
  if not found then raise exception 'Team member not found' using errcode = 'P0002'; end if;
end $$;

-- Give the caller an author-page slug if they don't have one (slug isn't user-writable directly).
create or replace function public.ensure_my_slug()
returns text language plpgsql security definer set search_path = public as $$
declare v_slug text;
begin
  update public.profiles set slug = public.slug_for(full_name, id)
  where id = auth.uid() and slug is null and role is not null;
  select slug into v_slug from public.profiles where id = auth.uid();
  return v_slug;
end $$;

revoke execute on function public.staff_directory() from public, anon;
revoke execute on function public.create_staff_account(text, text, public.staff_role, text) from public, anon;
revoke execute on function public.set_staff_role(uuid, public.staff_role) from public, anon;
revoke execute on function public.reset_staff_password(uuid, text) from public, anon;
revoke execute on function public.ensure_my_slug() from public, anon;
revoke execute on function public.require_super_admin() from public, anon;
grant execute on function public.staff_directory() to authenticated;
grant execute on function public.create_staff_account(text, text, public.staff_role, text) to authenticated;
grant execute on function public.set_staff_role(uuid, public.staff_role) to authenticated;
grant execute on function public.reset_staff_password(uuid, text) to authenticated;
grant execute on function public.ensure_my_slug() to authenticated;
