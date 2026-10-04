alter table public.categories enable row level security;
alter table public.subcategories enable row level security;

drop policy if exists "Public can read active categories" on public.categories;
create policy "Public can read active categories"
  on public.categories
  for select
  using (status = 'active');

drop policy if exists "Admins can manage categories" on public.categories;
create policy "Admins can manage categories"
  on public.categories
  for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'super_admin'))
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'super_admin'));

drop policy if exists "Public can read active subcategories" on public.subcategories;
create policy "Public can read active subcategories"
  on public.subcategories
  for select
  using (status = 'active');

drop policy if exists "Admins can manage subcategories" on public.subcategories;
create policy "Admins can manage subcategories"
  on public.subcategories
  for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'super_admin'))
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'super_admin'));
