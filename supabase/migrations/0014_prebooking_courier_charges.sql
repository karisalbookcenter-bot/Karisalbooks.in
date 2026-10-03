alter table public.books
  add column if not exists prebooking_professional_courier_charge numeric(10, 2) not null default 0
    check (prebooking_professional_courier_charge >= 0),
  add column if not exists prebooking_postal_charge numeric(10, 2) not null default 0
    check (prebooking_postal_charge >= 0);
