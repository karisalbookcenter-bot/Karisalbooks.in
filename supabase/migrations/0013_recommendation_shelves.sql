create table if not exists recommendation_shelves (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  variety_tag text,
  category_id uuid references categories(id) on delete set null,
  status record_status not null default 'active',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_recommendation_shelves_status_order
  on recommendation_shelves (status, sort_order);

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'trg_recommendation_shelves_updated_at'
  ) then
    create trigger trg_recommendation_shelves_updated_at
      before update on recommendation_shelves
      for each row execute function set_updated_at();
  end if;
end $$;

create table if not exists recommendation_shelf_books (
  shelf_id uuid not null references recommendation_shelves(id) on delete cascade,
  book_id uuid not null references books(id) on delete cascade,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (shelf_id, book_id)
);

create index if not exists idx_recommendation_shelf_books_order
  on recommendation_shelf_books (shelf_id, position);

alter table recommendation_shelves disable row level security;
alter table recommendation_shelf_books disable row level security;