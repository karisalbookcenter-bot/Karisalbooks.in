create table if not exists public.site_settings (
  id text primary key,
  social_links jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "Public can read site social links" on public.site_settings;
create policy "Public can read site social links"
  on public.site_settings
  for select
  using (id = 'public');

drop policy if exists "Admins can manage site settings" on public.site_settings;
create policy "Admins can manage site settings"
  on public.site_settings
  for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'super_admin'))
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'super_admin'));

insert into public.site_settings (id, social_links)
values ('public', '{"facebook":"","instagram":"","youtube":"","x":"","whatsapp":""}'::jsonb)
on conflict (id) do nothing;