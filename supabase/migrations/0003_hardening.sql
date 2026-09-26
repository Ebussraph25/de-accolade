-- Tightening suggested by the Supabase security advisor.
alter function public.touch_updated_at() set search_path = public;
alter function public.slug_for(text, uuid) set search_path = public;
alter function public.via_api() set search_path = public;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.require_super_admin() from authenticated;
revoke execute on function public.my_role() from anon;
-- Note: is_staff()/is_editor()/is_super_admin() must stay executable by anon and authenticated,
-- because the row-level security policies call them on every query.
