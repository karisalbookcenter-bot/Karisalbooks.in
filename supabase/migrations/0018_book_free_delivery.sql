alter table public.books
  add column if not exists is_free_delivery boolean not null default false;

comment on column public.books.is_free_delivery is
  'When true, this book is excluded from regular weight-based courier charges.';
