-- ============================================================================
-- KarisalBooks.in — Migration 0001
-- Scope: categories, subcategories, authors, publishers ONLY
-- No frontend, auth, admin, APIs, payments, cart, or orders in this migration.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 0. EXTENSIONS
-- ----------------------------------------------------------------------------
-- gen_random_uuid() lives in pgcrypto on most Supabase projects.
create extension if not exists "pgcrypto";


-- ----------------------------------------------------------------------------
-- 1. SHARED TYPES
-- ----------------------------------------------------------------------------
-- A single enum reused by every table's `status` column. Using an enum
-- (instead of free text) prevents typos like 'Active' / 'active ' / 'ACTIVE'
-- from ever entering the data, and is cheaper to store/index than text.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'record_status') then
    create type record_status as enum ('active', 'inactive', 'archived');
  end if;
end $$;


-- ----------------------------------------------------------------------------
-- 2. SHARED TRIGGER FUNCTION: auto-update `updated_at`
-- ----------------------------------------------------------------------------
-- One function, reused by a trigger on every table, so `updated_at` is always
-- maintained by the database itself and can never be forgotten by app code.
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ============================================================================
-- 3. CATEGORIES
-- ============================================================================
-- Top-level and nested taxonomy for browsing books (e.g. Fiction > Fantasy >
-- High Fantasy). Uses a self-referencing `parent_id` (adjacency list model)
-- so nesting depth is NOT hard-coded — a category can have a parent, which
-- can have its own parent, indefinitely. Depth-first/recursive queries later
-- will use a recursive CTE (`WITH RECURSIVE`) to walk the tree; that requires
-- no schema change, which is exactly what "unlimited nesting" means here.

create table if not exists categories (
  id            uuid primary key default gen_random_uuid(),
  parent_id     uuid references categories(id) on delete cascade,
  name          text not null,
  slug          text not null,
  description   text,
  status        record_status not null default 'active',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint categories_slug_unique unique (slug),
  constraint categories_no_self_parent check (id <> parent_id)
);

comment on table categories is
  'Self-referencing taxonomy tree. parent_id = null means a root/top-level category. Unlimited nesting via recursive CTE.';

create trigger trg_categories_updated_at
  before update on categories
  for each row
  execute function set_updated_at();

-- Indexes
create index if not exists idx_categories_parent_id on categories (parent_id);
create index if not exists idx_categories_status     on categories (status);
create index if not exists idx_categories_name        on categories (name);


-- ============================================================================
-- 4. SUBCATEGORIES
-- ============================================================================
-- A second-level classification that always belongs to exactly one category.
-- Kept as its own table (rather than relying solely on categories.parent_id)
-- because the brief explicitly separates "categories" (the nestable tree)
-- from "subcategories" (a fixed, simple child layer directly under a
-- category) — useful when the storefront wants a stable, shallow filter
-- (Category → Subcategory) for navigation/facets, independent of however
-- deep the categories tree itself grows internally.

create table if not exists subcategories (
  id            uuid primary key default gen_random_uuid(),
  category_id   uuid not null references categories(id) on delete cascade,
  name          text not null,
  slug          text not null,
  description   text,
  status        record_status not null default 'active',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint subcategories_slug_unique unique (slug),
  constraint subcategories_category_name_unique unique (category_id, name)
);

comment on table subcategories is
  'Child classification that must belong to exactly one category (category_id is NOT NULL).';

create trigger trg_subcategories_updated_at
  before update on subcategories
  for each row
  execute function set_updated_at();

-- Indexes
create index if not exists idx_subcategories_category_id on subcategories (category_id);
create index if not exists idx_subcategories_status      on subcategories (status);
create index if not exists idx_subcategories_name         on subcategories (name);


-- ============================================================================
-- 5. AUTHORS
-- ============================================================================
-- Book authors, modeled as their own entity (not a text field on a future
-- `books` table) because: (a) the same author writes many books — a normalized
-- table avoids repeating/misspelling their name across rows, (b) it gives
-- authors their own page/profile (bio, photo) on the storefront later, and
-- (c) it allows many-to-many book-author relationships (co-authored books)
-- via a join table in a future migration, without reshaping this table.

create table if not exists authors (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null,
  bio           text,
  photo_url     text,
  status        record_status not null default 'active',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint authors_slug_unique unique (slug)
);

comment on table authors is
  'Normalized author entity, referenced by books (future migration) instead of storing author names as free text.';

create trigger trg_authors_updated_at
  before update on authors
  for each row
  execute function set_updated_at();

-- Indexes
create index if not exists idx_authors_status on authors (status);
create index if not exists idx_authors_name    on authors (name);


-- ============================================================================
-- 6. PUBLISHERS
-- ============================================================================
-- The company that published a book. Separated from `authors` because a
-- publisher is a different kind of entity (an organization, not a person),
-- has different attributes (website, not a bio/photo of a person), and one
-- publisher relates to many books, independently of which author(s) wrote them.

create table if not exists publishers (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null,
  description   text,
  website_url   text,
  status        record_status not null default 'active',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint publishers_slug_unique unique (slug)
);

comment on table publishers is
  'Normalized publisher entity, referenced by books (future migration) instead of storing publisher names as free text.';

create trigger trg_publishers_updated_at
  before update on publishers
  for each row
  execute function set_updated_at();

-- Indexes
create index if not exists idx_publishers_status on publishers (status);
create index if not exists idx_publishers_name    on publishers (name);


-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Policies are defined now so the access model is documented and version
-- controlled, but RLS enforcement is explicitly DISABLED on every table
-- for this milestone (no auth system exists yet — Task said "keep them
-- disabled for now"). Enabling RLS is a single ALTER TABLE per table in a
-- later migration, once auth/admin roles exist.

-- Public read policy: only rows with status = 'active' are visible to the
-- anon/public role. Everything else (insert/update/delete) is left with no
-- policy for now — it will be scoped to an admin role in the Admin Dashboard
-- milestone.

create policy "Public can read active categories"
  on categories for select
  using (status = 'active');

create policy "Public can read active subcategories"
  on subcategories for select
  using (status = 'active');

create policy "Public can read active authors"
  on authors for select
  using (status = 'active');

create policy "Public can read active publishers"
  on publishers for select
  using (status = 'active');

-- RLS intentionally left OFF for now — policies above will take effect
-- only once each line below is changed to `enable row level security`.
alter table categories     disable row level security;
alter table subcategories  disable row level security;
alter table authors        disable row level security;
alter table publishers     disable row level security;


-- ============================================================================
-- End of Migration 0001
-- ============================================================================
