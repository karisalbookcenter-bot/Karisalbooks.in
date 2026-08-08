# KarisalBooks.in — Book CRUD + Supabase Integration (Foundation)

**Milestone:** Sprint 10 — Book CRUD + Supabase Integration (Foundation)
**Builds on:** Day 1 (Supabase clients), Day 2 (`categories`/`subcategories`/
`authors`/`publishers` schema, `record_status` enum, `set_updated_at()`
trigger), Day 3 (`BaseEntity`, `ApiResponse<T>`, `PaginatedResult<T>`,
`slugify()`, `PAGINATION_DEFAULTS`), Sprint 05 (service-layer/raw-client
separation pattern), Sprints 08–09 (`Category`/`Subcategory` type
placement conventions, form-values casing convention)
**Explicitly out of scope today:** payment, checkout, cart, customer
pages, frontend storefront, order system, shipping, coupons,
authentication UI, analytics, and — per this sprint's own task list — any
Book admin UI component (no `BookTable`/`BookCard`/`BookFormLayout`).

---

## 0. A note on project state before this sprint

Before writing any code, the existing project was reviewed as instructed.
Two things worth being explicit about, since they affect what "reuse
everything" could actually mean here:

1. **No `books` table existed.** Day 2's migration explicitly scoped
   itself to `categories`, `subcategories`, `authors`, and `publishers`
   ("Do not create any other tables"). Sprint 10 cannot build a
   "Supabase Repository Layer for Books" against a table that doesn't
   exist, so this sprint's first piece of work is Migration 0002, adding
   exactly the `books` table (plus a Storage bucket for cover images) —
   new, additive database architecture, not a modification of Migration
   0001.
2. **No admin Book UI exists.** Every prior admin framework (Dashboard,
   Category, Subcategory) was explicitly "UI architecture only, no
   database, no API." Sprint 10 flips that: it's explicitly the "CRUD +
   Supabase Integration" sprint, and its task list (Repository, Service,
   Validation, Form *State*, Create/Update/Delete/Fetch/Search,
   Pagination, Image Upload) never asks for a Table/Card/FormLayout
   component the way Sprint 08/09 did. So this sprint builds the data
   layer those future components will sit on top of — not the components
   themselves.

## 1. Layered architecture

Four layers, each with one job, mirroring the separation
`docs/AUTH_ARCHITECTURE.md` already established for auth
(`auth.service.ts` as the callable layer, raw `supabase.auth` calls
inside it):

```
useBookForm (hook)              <- Task 4: form state, no UI
      |
      v
book.service.ts                 <- Task 2: validates, shapes ApiResponse<T>, never throws
      |
      v
book.validation.ts   <-----------  Task 3: zod schemas (also called directly by the hook)
      |
      v
book.repository.ts              <- Task 1: the only file calling supabase.from("books")
      |
      v
Supabase (books table, Migration 0002)
```

- **`book.repository.ts`** — thin, literal Supabase calls. Throws a plain
  `Error` on failure; has no opinion about how errors should look to a
  caller. Uses `@/lib/supabase/server` (Day 1) since every write is an
  admin-privileged operation.
- **`book.validation.ts`** — `zod` schemas (`bookInsertSchema`,
  `bookUpdateSchema`) plus `validateBookInsert`/`validateBookUpdate`,
  returning `{ success, data?, errors? }` with field-keyed error messages.
  This is the project's **first schema-based validation layer** — every
  prior form (`CategoryFormLayout`, `SubcategoryFormLayout`) was
  explicitly UI-only with no real validation. `zod` was added as a new
  dependency (`package.json`) specifically because this is where real
  persistence — and therefore real validation — begins; a hand-rolled
  `if` chain would have worked for one entity, but `zod` is the pattern
  a future Category/Subcategory *backend* sprint (neither has one yet)
  can adopt too, rather than each inventing its own validation style.
- **`book.service.ts`** — the layer everything else actually calls.
  Validates first (so a bad request never reaches Supabase), calls the
  repository, and catches whatever it throws, always returning
  `ApiResponse<T>` (Day 3's `{ data, error: null } | { data: null, error }`
  shape) — never throwing itself. This is what lets a caller (a hook, a
  future Server Action) branch on `.error` instead of wrapping every call
  in `try/catch`.
- **`useBookForm.ts`** — client-side form state only. Calls
  `validateBookInsert`/`validateBookUpdate` directly (the *same* schemas
  the service uses server-side) for instant field errors before ever
  calling `book.service.ts`, so a validation rule is defined exactly
  once and enforced identically on both sides.

## 2. Repository layer (Task 1)

`src/features/books/services/book.repository.ts`. One function per
Supabase operation: `getBookById`, `getBookBySlug`, `listBooks`,
`createBook`, `updateBook`, `deleteBook`, plus bulk equivalents
(`updateBooksStatus`, `deleteBooks` — ready for a future Book admin
screen's `BulkActionBar` integration, the same pattern Sprint 09 used for
Subcategories, not wired to anything yet since no UI exists this sprint).

Postgres returns `numeric` columns as strings over the Supabase JS client
(to avoid floating-point precision loss in transit); `mapRow()` is the one
place `price` gets parsed back into the `number` the `Book` type promises,
so every other layer can trust `Book.price` is always a real number.

## 3. Book Service (Task 2)

`src/features/books/services/book.service.ts`. `getBook`/`getBookBySlug`
(Task 8: Fetch), `listBooks` (Tasks 9–10: Search + Pagination — `search`
and every filter/sort param are optional; calling it with nothing just
paginates all books), `createBook` (Task 5), `updateBook` (Task 6),
`deleteBook` (Task 7), plus the bulk variants. Every method returns
`Promise<ApiResponse<T>>`.

## 4. Search and pagination (Tasks 9–10)

Unlike Category/Subcategory's client-side, in-memory
`searchCategories`/`filterCategoriesByStatus`/`sortByKey`/`paginate`
pipeline (Sprints 08–09 — the right choice there, since those frameworks
had no table to query), `listBooks` does **real, server-side** search/
filter/sort/pagination:

- **Search** — `.or("title.ilike.%term%,description.ilike.%term%,isbn.ilike.%term%")`,
  a single Postgres query, not a full-table fetch filtered in memory.
- **Filters** — `category_id`/`subcategory_id`/`author_id`/`publisher_id`/
  `status` each become a `.eq()`/`.in()` clause, applied only when
  supplied.
- **Sort** — `.order(sortBy, { ascending: sortDirection === "asc" })`,
  reusing the exact `SortDirection` type Sprint 09 added to
  `common.types.ts` for `SubcategoryTable`'s client-side sort — same
  type, now backing a real `ORDER BY` instead of an in-memory
  `Array.sort`.
- **Pagination** — `.range(from, to)` with `{ count: "exact" }`, returning
  the *exact same* `PaginatedResult<T>` shape (Day 3) every paginated
  list in this app already returns. A future `BookTable` paired with
  Sprint 09's `Pagination` component needs no new prop shape — it's the
  identical contract, just backed by a real query instead of the local
  `paginate()` helper.

## 5. Image Upload Service (Task 11)

`src/features/books/services/image-upload.service.ts`, backed by
Migration 0002's `book-covers` Storage bucket (created via SQL — `insert
into storage.buckets` — so the migration alone makes this functional
against a fresh Supabase project, no manual dashboard step required).

- `validateImageFile(file)` checks type (JPEG/PNG/WEBP) and size (5MB
  max) against `IMAGE_UPLOAD_CONSTRAINTS` (`@/constants/storage.constants`,
  new this sprint, centralized the same way `ROUTES`/`PERMISSIONS` are)
  before any network call.
- `uploadBookCoverImage(file, bookId?)` uploads to a collision-resistant
  path (`{bookId ?? "unassigned"}/{timestamp}-{slugified filename}`) and
  returns the public URL. `bookId` is optional specifically so a future
  create form can let a user pick a cover image *before* the book row
  (and its id) exists yet.
- `deleteBookCoverImage(path)` removes a file — for when a cover is
  replaced or a book is deleted.

Uses `@/lib/supabase/client` (the browser client), not the server client
the repository uses — a file upload originates from a browser file input,
the same reasoning that keeps `auth.service.ts` (Sprint 05) on the
browser client too.

## 6. Book Form State Management (Task 4)

`src/features/books/hooks/useBookForm.ts`. Returns `values`, `errors`,
`isSubmitting`, `isUploadingImage`, `submitError`, `setField`,
`selectCoverImageFile`, `reset`, and `submit`. `BookFormValues`
(`src/features/books/types/book-form.types.ts`) is camelCase and
string-typed throughout — the exact convention `CategoryFormValues`/
`SubcategoryFormValues` (Sprints 08–09) already established for
form-ergonomic state, distinct from the snake_case, correctly-typed
`Book`/`BookInsert` the service layer expects. `setField("title", ...)`
auto-derives `slug` via `slugify()` until the slug field is hand-edited —
the identical UX `CategoryFormLayout` gives, just without the UI wrapped
around it.

`submit()` validates client-side first (via the same `book.validation.ts`
schemas), uploads a pending cover image if one was selected, then calls
`book.service.ts`'s `createBook`/`updateBook` depending on `mode`. This
hook builds **no JSX** — a future `BookFormLayout` component (not this
sprint) is what would actually render inputs bound to `values`/`setField`,
following the exact shape `CategoryFormLayout`/`SubcategoryFormLayout`'s
JSX already demonstrates for two other entities.

## 7. Database schema (Migration 0002)

`supabase/migrations/0002_books.sql`. `books` table: `category_id` and
`author_id` required (`not null`, `on delete restrict` — deleting a
category/author with existing books is blocked, a bigger, more surprising
side effect than Migration 0001's `subcategories.category_id on delete
cascade`); `subcategory_id` and `publisher_id` optional (`on delete set
null`). `price numeric(10,2)` for exact currency arithmetic;
`stock_quantity integer`, indexed, specifically to power the Sprint 07
dashboard's "Low Stock" stat card once a real query replaces its current
placeholder. Reuses the existing `record_status` enum and
`set_updated_at()` trigger function from Migration 0001 verbatim — no
duplicate enum, no duplicate trigger function. RLS policy created but
disabled, matching Migration 0001's posture exactly.

## 8. Consistency verification performed

- Every new/modified `.ts`/`.tsx` file (11 files) passed a `tsc --noEmit`
  syntax-only scan — zero `TS1xxx` errors.
- Every cross-file import was checked to resolve to a real file on disk.
- `book.repository.ts` and `book.service.ts` share several function names
  (`createBook`, `updateBook`, `deleteBook`, `listBooks`,
  `getBookBySlug`) by design — each is consumed via a namespace import
  (`import * as repository from "./book.repository"`) or a specific named
  import, never through a combined barrel, so this is not a real
  collision. Confirmed no `services/index.ts` exists for
  `features/books`, matching Sprint 05's identical decision for
  `features/auth/services/`.

## 9. Future integration path

Nothing below is built today:

1. **Wire an API surface.** A future Server Action or Route Handler calls
   `book.service.ts` directly (Server Actions are the more idiomatic
   Next.js 15 choice here, needing no new `app/api/*` route file at all).
2. **Build the admin UI.** A future sprint builds `BookTable`, `BookCard`,
   `BookFormLayout`, `BookFilters`, `BookToolbar`, `BookEmptyState`,
   `BookSkeleton`, and `BookManagementOverview`, following Sprint 08/09's
   exact component patterns, consuming `book.service.ts` +
   `useBookForm` + Sprint 06/09's `AdminShell`/`Pagination`/
   `BulkActionBar`/`StatusBadge` rather than any new primitive.
3. **Wire the dashboard's placeholders.** Sprint 07's `StatCard` values
   for "Total Books" and "Low Stock" become real once a page calls
   `listBooks({ pageSize: 1 })` for a total count and a filtered query
   against `stock_quantity` for the low-stock figure.
4. **Enable RLS.** Once Sprint 05's `AuthProvider` is wired into a real
   `app/admin/layout.tsx` (still not done — see
   `docs/AUTH_ARCHITECTURE.md`), enable RLS on `books` and add
   role-aware write policies, replacing the current "policy defined,
   disabled" posture.
5. **Route + guard.** Create `app/admin/books/page.tsx`, extend
   `authConfig.adminRoutePrefixes`, and add the
   `getServerAuthUser()`/`hasMinimumRole()` guard — identical wiring to
   every other future admin route this project's docs already describe.

## 10. Files added this sprint

```
supabase/migrations/0002_books.sql          # books table + book-covers Storage bucket

src/types/book.types.ts                     # Book, BookInsert, BookUpdate
src/constants/storage.constants.ts          # STORAGE_BUCKETS, IMAGE_UPLOAD_CONSTRAINTS

src/features/books/services/book.repository.ts
src/features/books/services/book.service.ts
src/features/books/services/book.validation.ts
src/features/books/services/image-upload.service.ts
src/features/books/hooks/useBookForm.ts
src/features/books/hooks/index.ts
src/features/books/types/book-form.types.ts
src/features/books/types/index.ts
src/features/books/README.md                # rewritten for Sprint 10

docs/BOOK_CRUD_FOUNDATION.md                # this file
```

## 11. Files modified — and why

| File | Why |
|---|---|
| `package.json` | Added `zod` — the project's first schema validation library, needed for `book.validation.ts`. No other dependency changed. |
| `src/constants/index.ts` | Barrel export added for the new `storage.constants.ts`. |
| `src/features/books/{hooks,services,types}/.gitkeep` | Removed — these three Day 3 scaffold folders now contain real files. |
| `src/features/books/components/.gitkeep` | Restored after an initial removal — this folder is still intentionally empty this sprint (no UI built) and needs the placeholder to persist in version control. |

**Confirmed unmodified:** every file from Day 1–4 and Sprint 05–09 not
listed above — `supabase/migrations/0001_taxonomy_and_contributors.sql`,
`src/config/auth.ts`, `src/middleware.ts`, `AdminShell.tsx`, every
Category/Subcategory component, `Category`/`Subcategory` types,
`category.helpers.ts`/`subcategory.helpers.ts`, and
`permissions.constants.ts` (no new permission needed — Book CRUD has no
UI yet to gate).
