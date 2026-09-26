-- Lets a super admin clear a colleague's authenticator (e.g. lost phone) so they can set it up again.
create or replace function public.reset_staff_2fa(p_user uuid)
returns void language plpgsql security definer set search_path = public, auth as $$
begin
  perform public.require_super_admin();
  if not exists (select 1 from auth.users where id = p_user) then
    raise exception 'Team member not found' using errcode = 'P0002';
  end if;
  delete from auth.mfa_factors where user_id = p_user;
end $$;
revoke execute on function public.reset_staff_2fa(uuid) from public, anon;
grant execute on function public.reset_staff_2fa(uuid) to authenticated;
