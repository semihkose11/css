-- Gemi Bileşen Kaydı — kullanıcı adı ile giriş
-- supabase-users.sql'den sonra çalıştırın.

alter table public.profiles add column if not exists username text;
update public.profiles set username = lower(split_part(email, '@', 1)) where username is null or username = '';
create unique index if not exists profiles_username_key on public.profiles (lower(username));

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, username, full_name, role)
  values (new.id, new.email,
          lower(coalesce(nullif(new.raw_user_meta_data->>'username',''), split_part(new.email, '@', 1))),
          coalesce(new.raw_user_meta_data->>'full_name',''),
          case when not exists (select 1 from public.profiles) then 'admin' else 'user' end)
  on conflict (id) do nothing;
  return new;
end $$;

-- Giriş ekranı kullanıcı adından hesabın e-postasını bulur
create or replace function public.login_email(p_username text) returns text
language sql stable security definer set search_path = public as $$
  select email from public.profiles where lower(username) = lower(trim(p_username)) and active limit 1
$$;
revoke all on function public.login_email(text) from public;
grant execute on function public.login_email(text) to anon, authenticated;
