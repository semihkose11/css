-- Gemi Bileşen Kaydı — yetkiler
-- Projeleri yalnızca yönetici açar/düzenler/siler; kullanıcılar projeleri görür.
-- Kullanıcılar yalnızca kendi eklediği kayıtları görür ve düzenler; yönetici hepsini görür.

drop policy if exists "projects_insert" on public.projects;
drop policy if exists "projects_update" on public.projects;
create policy "projects_insert" on public.projects for insert to authenticated with check (public.is_admin());
create policy "projects_update" on public.projects for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "items_member_all" on public.items;
drop policy if exists "items_select" on public.items;
drop policy if exists "items_insert" on public.items;
drop policy if exists "items_update" on public.items;
drop policy if exists "items_delete" on public.items;
create policy "items_select" on public.items for select to authenticated
  using (public.is_admin() or (public.is_member() and created_by = auth.uid()));
create policy "items_insert" on public.items for insert to authenticated
  with check (public.is_member() and created_by = auth.uid());
create policy "items_update" on public.items for update to authenticated
  using (public.is_admin() or (public.is_member() and created_by = auth.uid()))
  with check (public.is_admin() or (public.is_member() and created_by = auth.uid()));
create policy "items_delete" on public.items for delete to authenticated
  using (public.is_admin() or (public.is_member() and created_by = auth.uid()));
