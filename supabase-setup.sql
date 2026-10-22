-- Gemi Bileşen Kaydı — Supabase kurulumu
-- Supabase panelinde: SQL Editor > New query > bu dosyanın tamamını yapıştır > Run

create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  ship text default '',
  client text default '',
  port text default '',
  start date,
  note text default '',
  done boolean default false,
  created_at timestamptz default now(),
  created_by uuid default auth.uid(),
  created_by_email text default (auth.jwt() ->> 'email'),
  updated_at timestamptz default now()
);

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  category text not null,
  status text default '',
  data jsonb not null default '{}'::jsonb,
  photos jsonb not null default '[]'::jsonb,
  created_at timestamptz default now(),
  created_by uuid default auth.uid(),
  created_by_email text default (auth.jwt() ->> 'email'),
  updated_at timestamptz default now(),
  updated_by_email text default (auth.jwt() ->> 'email')
);
create index if not exists items_project_idx on public.items(project_id);

-- Erişim: giriş yapmış (hesabı olan) herkes okur ve yazar
alter table public.projects enable row level security;
alter table public.items enable row level security;

drop policy if exists "projects_auth_all" on public.projects;
create policy "projects_auth_all" on public.projects for all to authenticated using (true) with check (true);
drop policy if exists "items_auth_all" on public.items;
create policy "items_auth_all" on public.items for all to authenticated using (true) with check (true);

-- Fotoğraf deposu
insert into storage.buckets (id, name, public) values ('photos', 'photos', true)
on conflict (id) do nothing;

drop policy if exists "photos_auth_insert" on storage.objects;
create policy "photos_auth_insert" on storage.objects for insert to authenticated with check (bucket_id = 'photos');
drop policy if exists "photos_auth_delete" on storage.objects;
create policy "photos_auth_delete" on storage.objects for delete to authenticated using (bucket_id = 'photos');
drop policy if exists "photos_auth_select" on storage.objects;
create policy "photos_auth_select" on storage.objects for select to authenticated using (bucket_id = 'photos');

-- Canlı güncelleme (başka biri kayıt ekleyince ekranlar yenilenir)
do $$ begin
  begin alter publication supabase_realtime add table public.projects; exception when others then null; end;
  begin alter publication supabase_realtime add table public.items; exception when others then null; end;
end $$;
