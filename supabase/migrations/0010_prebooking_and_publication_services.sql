alter table public.books
  add column if not exists prebooking_enabled boolean not null default false,
  add column if not exists prebooking_start_at timestamptz,
  add column if not exists prebooking_end_at timestamptz,
  add column if not exists prebooking_price numeric(10, 2),
  add column if not exists prebooking_offer_price numeric(10, 2),
  add column if not exists prebooking_offer_start_at timestamptz,
  add column if not exists prebooking_offer_end_at timestamptz,
  add column if not exists prebooking_ready_at timestamptz;

alter table public.books
  add constraint books_prebooking_window_check check (
    not prebooking_enabled or (
      prebooking_start_at is not null
      and prebooking_end_at is not null
      and prebooking_end_at > prebooking_start_at
      and prebooking_price is not null
      and prebooking_price >= 0
    )
  ),
  add constraint books_prebooking_offer_check check (
    prebooking_offer_price is null or (
      prebooking_offer_price >= 0
      and prebooking_price is not null
      and prebooking_offer_price < prebooking_price
      and prebooking_offer_start_at is not null
      and prebooking_offer_end_at is not null
      and prebooking_offer_end_at > prebooking_offer_start_at
    )
  );

alter table public.orders
  add column if not exists purchase_type text not null default 'books',
  add column if not exists prebooking_id text;

alter table public.orders
  add constraint orders_purchase_type_check check (purchase_type in ('books', 'prebooking'));

create sequence if not exists public.prebooking_reference_seq;

create or replace function public.assign_prebooking_reference()
returns trigger
language plpgsql
as $$
begin
  if new.purchase_type = 'prebooking' and new.prebooking_id is null then
    new.prebooking_id := 'KB-PB-' || lpad(nextval('public.prebooking_reference_seq')::text, 7, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_assign_prebooking_reference on public.orders;
create trigger trg_assign_prebooking_reference
  before insert on public.orders
  for each row
  execute function public.assign_prebooking_reference();

create unique index if not exists orders_prebooking_id_unique
  on public.orders (prebooking_id)
  where prebooking_id is not null;

alter table public.order_items
  add column if not exists is_prebooking boolean not null default false;

create table if not exists public.publication_quote_requests (
  id uuid primary key default gen_random_uuid(),
  request_number text unique,
  name text not null,
  email text not null,
  phone text not null,
  book_title text not null,
  description text not null,
  estimated_pages integer not null check (estimated_pages > 0),
  print_quantity integer not null check (print_quantity > 0),
  trim_size text not null,
  print_type text not null,
  binding_type text not null,
  manuscript_path text not null,
  cover_path text not null,
  quote_amount numeric(10, 2),
  quote_note text,
  status text not null default 'new' check (status in ('new', 'reviewing', 'quoted', 'accepted', 'completed', 'declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create sequence if not exists public.publication_quote_reference_seq;

create or replace function public.assign_publication_quote_reference()
returns trigger
language plpgsql
as $$
begin
  if new.request_number is null then
    new.request_number := 'KB-QT-' || lpad(nextval('public.publication_quote_reference_seq')::text, 7, '0');
  end if;
  return new;
end;
$$;

create trigger trg_publication_quote_reference
  before insert on public.publication_quote_requests
  for each row
  execute function public.assign_publication_quote_reference();

create trigger trg_publication_quote_requests_updated_at
  before update on public.publication_quote_requests
  for each row
  execute function public.set_updated_at();

alter table public.publication_quote_requests enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'publication-submissions',
  'publication-submissions',
  false,
  20971520,
  array[
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/pdf',
    'image/jpeg'
  ]
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

alter table storage.objects enable row level security;