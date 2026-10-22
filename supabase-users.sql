-- Gemi Bileşen Kaydı — kullanıcı sistemi (hesapları yalnızca yönetici açar)
-- supabase-setup.sql'den sonra çalıştırın.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text default '',
  role text not null default 'user' check (role in ('admin','user')),
  active boolean not null default true,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;

-- Yeni kullanıcı oluşunca profil açılır; sistemdeki ilk kullanıcı yönetici olur
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name',''),
          case when not exists (select 1 from public.profiles) then 'admin' else 'user' end)
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Daha önce açılmış hesaplar için profil
insert into public.profiles (id, email, role)
select u.id, u.email, 'user' from auth.users u on conflict (id) do nothing;
update public.profiles set role = 'admin'
where id = (select id from public.profiles order by created_at limit 1)
  and not exists (select 1 from public.profiles where role = 'admin');

create or replace function public.is_member() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and active)
$$;
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and active and role = 'admin')
$$;

drop policy if exists "profiles_read" on public.profiles;
create policy "profiles_read" on public.profiles for select to authenticated using (public.is_member());
drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update" on public.profiles for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Projeler: aktif kullanıcılar okur/ekler/düzenler, yalnızca yönetici siler
drop policy if exists "projects_auth_all" on public.projects;
drop policy if exists "projects_select" on public.projects;
drop policy if exists "projects_insert" on public.projects;
drop policy if exists "projects_update" on public.projects;
drop policy if exists "projects_delete" on public.projects;
create policy "projects_select" on public.projects for select to authenticated using (public.is_member());
create policy "projects_insert" on public.projects for insert to authenticated with check (public.is_member());
create policy "projects_update" on public.projects for update to authenticated using (public.is_member()) with check (public.is_member());
create policy "projects_delete" on public.projects for delete to authenticated using (public.is_admin());

-- Bileşenler: aktif kullanıcılar her şeyi yapar
drop policy if exists "items_auth_all" on public.items;
drop policy if exists "items_member_all" on public.items;
create policy "items_member_all" on public.items for all to authenticated using (public.is_member()) with check (public.is_member());

-- Fotoğraflar: aktif kullanıcılar
drop policy if exists "photos_auth_insert" on storage.objects;
drop policy if exists "photos_auth_delete" on storage.objects;
drop policy if exists "photos_auth_select" on storage.objects;
create policy "photos_auth_insert" on storage.objects for insert to authenticated with check (bucket_id = 'photos' and public.is_member());
create policy "photos_auth_delete" on storage.objects for delete to authenticated using (bucket_id = 'photos' and public.is_member());
create policy "photos_auth_select" on storage.objects for select to authenticated using (bucket_id = 'photos' and public.is_member());
