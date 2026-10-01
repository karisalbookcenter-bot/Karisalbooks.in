alter table public.customers
  add column if not exists marketing_consent boolean not null default false,
  add column if not exists marketing_consent_at timestamptz;

create index if not exists customers_marketing_consent_email_idx
  on public.customers (marketing_consent, email)
  where marketing_consent = true;

alter table public.offers
  add column if not exists campaign_poster_url text,
  add column if not exists campaign_price_details text,
  add column if not exists campaign_email_subject text,
  add column if not exists campaign_email_body text,
  add column if not exists campaign_sent_at timestamptz,
  add column if not exists campaign_sent_count integer not null default 0;

alter table public.site_settings
  add column if not exists site_logo_url text,
  add column if not exists site_description text not null default 'Tamil books, independent publishers, and thoughtful publishing services.',
  add column if not exists homepage_slider_enabled boolean not null default true,
  add column if not exists homepage_slider_interval_seconds integer not null default 6,
  add column if not exists homepage_arrivals_title text not null default 'New arrivals';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-assets',
  'site-assets',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view site assets" on storage.objects;
create policy "Public can view site assets"
  on storage.objects for select
  using (bucket_id = 'site-assets');