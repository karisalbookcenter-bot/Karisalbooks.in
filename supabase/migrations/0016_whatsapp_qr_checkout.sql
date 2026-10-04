alter table public.site_settings
  add column if not exists whatsapp_orders_enabled boolean not null default true,
  add column if not exists qr_payment_enabled boolean not null default false,
  add column if not exists payment_qr_url text not null default '';
