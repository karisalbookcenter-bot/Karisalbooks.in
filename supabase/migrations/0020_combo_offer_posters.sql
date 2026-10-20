alter table public.combo_offers
  add column if not exists poster_url text;

comment on column public.combo_offers.poster_url is
  'Optional public image used to display and share the combo offer.';
