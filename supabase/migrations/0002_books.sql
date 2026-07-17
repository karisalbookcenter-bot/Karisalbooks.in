-- ============================================================================
-- KarisalBooks.in — Migration 0002
-- Scope: books table ONLY, plus a Supabase Storage bucket for cover images.
-- No frontend, auth, admin UI, payments, cart, or orders in this migration.
--
-- Context: Sprint 10 ("Book CRUD + Supabase Integration") requires a real
-- `books` table to build a Repository/Service layer against. Migration
-- 0001 (Day 2) intentionally scoped out `books` — "Do not create any other
-- tables" — so this migration adds exactly the one table Sprint 10 needs,
-- following 0001's conventions verbatim (uuid pk, the existing
-- `record_status` enum, the existing `set_updated_at()` trigger function,
-- RLS policies created but disabled). Nothing in 0001 is altered.
-- ============================================================================


-- ============================================================================
-- 1. BOOKS
-- ============================================================================
-- The product catalog's core entity. Links to three of Migration 0001's
-- tables (categories, authors, publishers) and optionally a fourth
-- (subcategories) — the same foreign-key style already established there.

create table if not exists books (
  id                uuid primary key default gen_random_uuid(),

  -- Required linkage: every book has exactly one category and one author,
  -- mirroring the `not null` linkage pattern subcategories.category_id
  -- already established in 0001. ON DELETE RESTRICT so a category/author
  -- with existing books can't be silently deleted out from under them —
  -- the opposite choice `subcategories.category_id` made (CASCADE), because
  -- deleting a whole book is a much bigger, more surprising side effect
  -- than deleting a subcategory.
  category_id       uuid not null references categories(id) on delete restrict,
  author_id         uuid not null references authors(id) on delete restrict,

  -- Optional linkage: a book may or may not have a specific subcategory or
  -- a recorded publisher yet. ON DELETE SET NULL so removing either doesn't
  -- block deletion or cascade-delete the book itself.
  subcategory_id    uuid references subcategories(id) on delete set null,
  publisher_id      uuid references publishers(id) on delete set null,

  title             text not null,
  slug              text not null,
  description       text,
  isbn              text,

  -- INR, matching the CURRENCY config already established in Day 3's
  -- src/config/settings.ts. numeric(10,2), not float, for exact currency
  -- arithmetic (no floating-point rounding surprises on prices).
  price             numeric(10, 2) not null default 0 check (price >= 0),

  -- Powers the Sprint 07 dashboard's "Low Stock" stat card once a real
  -- query replaces its current placeholder "—" value.
  stock_quantity    integer not null default 0 check (stock_quantity >= 0),

  cover_image_url   text,

  status            record_status not null default 'active',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint books_slug_unique unique (slug),
  constraint books_isbn_unique unique (isbn)
);

comment on table books is
  'Product catalog entity. Requires a category and author; subcategory and publisher are optional.';

create trigger trg_books_updated_at
  before update on books
  for each row
  execute function set_updated_at();

-- Indexes
create index if not exists idx_books_category_id     on books (category_id);
create index if not exists idx_books_subcategory_id   on books (subcategory_id);
create index if not exists idx_books_author_id        on books (author_id);
create index if not exists idx_books_publisher_id     on books (publisher_id);
create index if not exists idx_books_status           on books (status);
create index if not exists idx_books_title            on books (title);
-- Supports the low-stock dashboard query (status = 'active' and
-- stock_quantity below some threshold) without a full table scan.
create index if not exists idx_books_stock_quantity   on books (stock_quantity);


-- ============================================================================
-- 2. ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Same policy-defined-but-disabled approach as Migration 0001 — see that
-- file's own RLS section for the full reasoning. Enabling RLS on `books`
-- is a single `alter table` once the Auth milestone's admin roles are
-- wired into a real session.

create policy "Public can read active books"
  on books for select
  using (status = 'active');

alter table books disable row level security;


-- ============================================================================
-- 3. STORAGE BUCKET FOR BOOK COVER IMAGES
-- ============================================================================
-- Backs `src/features/books/services/image-upload.service.ts` (Sprint 10).
-- Created here via SQL (Supabase supports inserting directly into
-- `storage.buckets`) rather than requiring a manual dashboard step, so this
-- migration alone is sufficient to make the Image Upload Service functional
-- against a fresh Supabase project. `public = true` because cover images
-- are meant to be publicly viewable (same trust level as any other
-- storefront image) — this is not a bucket for sensitive files.

insert into storage.buckets (id, name, public)
values ('book-covers', 'book-covers', true)
on conflict (id) do nothing;

-- Storage policies, same "defined but disabled" posture as every table
-- above — Supabase Storage's own RLS applies to the `storage.objects`
-- table, gated independently of the `books` table's RLS.
create policy "Public can view book cover images"
  on storage.objects for select
  using (bucket_id = 'book-covers');

create policy "Public can upload book cover images"
  on storage.objects for insert
  with check (bucket_id = 'book-covers');

-- Storage RLS ships enabled by default on new Supabase projects; disabled
-- here for consistency with every other table in this migration set, to
-- be revisited alongside the rest of RLS once Auth roles are wired in.
alter table storage.objects disable row level security;


-- ============================================================================
-- End of Migration 0002
-- ============================================================================
