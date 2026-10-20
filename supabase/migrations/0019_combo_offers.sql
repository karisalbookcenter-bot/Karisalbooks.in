create table if not exists public.combo_offers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  offer_price numeric(10, 2) not null check (offer_price >= 1),
  status text not null default 'inactive' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.combo_offer_books (
  combo_offer_id uuid not null references public.combo_offers(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete restrict,
  primary key (combo_offer_id, book_id)
);

alter table public.combo_offers enable row level security;
alter table public.combo_offer_books enable row level security;

create trigger trg_combo_offers_updated_at
  before update on public.combo_offers
  for each row
  execute function public.set_updated_at();

alter table public.orders
  drop constraint if exists orders_purchase_type_check;

alter table public.orders
  add constraint orders_purchase_type_check
  check (purchase_type in ('books', 'prebooking', 'customize', 'mixed', 'combo')),
  add column if not exists combo_offer_id uuid references public.combo_offers(id) on delete set null,
  add column if not exists combo_offer_price numeric(10, 2);

alter table public.order_items
  add column if not exists is_combo_offer boolean not null default false;

comment on column public.orders.combo_offer_price is
  'Manually configured combo price, inclusive of delivery; regular book and courier pricing is not applied.';
