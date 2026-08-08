# KarisalBooks.in — Author & Publisher Management

**Milestone:** Sprint 11 — Author & Publisher Management
**Builds on:** Day 2 (`authors`/`publishers` schema), Day 3 (`BaseEntity`,
`ApiResponse<T>`, `PaginatedResult<T>`, `slugify()`, `PAGINATION_DEFAULTS`),
Sprint 06 (`PageContainer`, `TableSkeleton`/`CardSkeleton`, icon registry),
Sprint 08 (`StatusBadge`, `SearchBar`, `BulkActionBar`, UI primitives),
Sprint 09 (`Pagination`), Sprint 10 (repository/service/`ApiResponse`
pattern, Image Upload Service, form-state-hook pattern)
**Explicitly out of scope today:** Orders, Customers, Payments, Shipping,
Coupons, Storefront, Checkout, Analytics, Reports, Email.

---

## 1. What this sprint is, architecturally

Sprint 10 built Book's backend (repository → validation → service → form
hook) by hand, as the project's first real Supabase integration. Sprint 11
needed the *same* layered backend for two more entities — and, unlike
Sprint 10, *also* their admin UI (Tasks 14–15 explicitly ask for it,
where Sprint 10's task list never did). Two decisions shaped everything
below:

1. **Generalize the backend, don't triplicate it.** `Author` and
   `Publisher` are structurally simple and nearly identical to each other
   (`id`, `name`, `slug`, one optional text field, one optional link
   field, `status`, timestamps — no self-reference, no required foreign
   key). Hand-writing `author.repository.ts`/`publisher.repository.ts` as
   two more copies of Sprint 10's `book.repository.ts` would be exactly
   the duplicate code this sprint's rules forbid. So this sprint extracts
   the repeated *shape* into two generic factories
   (`src/services/createSupabaseRepository.ts`,
   `createEntityService.ts`) once, and both entities' repository/service
   files become a handful of lines each.
2. **Don't generalize the UI or validation the same way.** See §5 for why.

`book.repository.ts`/`book.service.ts` themselves are **not** refactored
onto the new factories — that would be modifying completed Sprint 10
architecture without a Sprint 11 task asking for it. The factories exist
for Author/Publisher; retrofitting Book is a future sprint's call.

## 2. The generic factories

```
createSupabaseRepository<T, TInsert, TUpdate>(config)
  -> { getById, getBySlug, list, create, update, remove, bulkUpdateStatus, bulkRemove }

createEntityService(repository, { validateInsert, validateUpdate })
  -> { get, getBySlug, list, create, update, remove, bulkUpdateStatus, bulkRemove }
      (every method returns Promise<ApiResponse<T>>, never throws)
```

Every method matches its `book.repository.ts`/`book.service.ts`
equivalent 1:1 in behavior — same `.or()` search construction, same
`.range()` + `{ count: "exact" }` pagination, same auto-slug-from-name on
create, same "repository throws, service catches and shapes
`ApiResponse<T>`" contract. `author.repository.ts` is genuinely this
short:

```ts
export const authorRepository = createSupabaseRepository<Author, AuthorInsert, AuthorUpdate>({
  table: "authors",
  searchableColumns: ["name", "slug", "bio"],
});
```

`author.service.ts`/`publisher.service.ts` are equally short — one call
to `createEntityService` each, passing their own validation functions.

## 3. Author CRUD, Search, Pagination (Tasks 1, 3, 5, 7, 9, 11)

`authorService.create`/`update`/`remove` = CRUD. `authorService.get`/
`getBySlug` = Fetch. `authorService.list({ search, statuses, sortBy,
sortDirection, page, pageSize })` = Search + Pagination, identical
contract to `book.service.ts`'s `listBooks` — real, server-side Postgres
queries (`ilike`, `.in()`, `.order()`, `.range()`), not client-side
in-memory filtering the way Sprint 08/09's Category/Subcategory
frameworks had to (no backend existed for them yet).

## 4. Publisher CRUD, Search, Pagination (Tasks 2, 4, 6, 8, 10, 11)

Identical to Author's, via the same two factories:

```ts
export const publisherRepository = createSupabaseRepository<Publisher, PublisherInsert, PublisherUpdate>({
  table: "publishers",
  searchableColumns: ["name", "slug", "description"],
});
```

## 5. What was *not* generalized, and why

- **Validation** (`author.validation.ts`/`publisher.validation.ts`) — two
  separate `zod` schema files, not one generic schema factory. The field
  differences (`bio`/`photo_url` vs. `description`/`website_url`) mean a
  generic validator would mostly be indirection around declaring "this
  field is an optional URL" twice — the real duplication risk was in the
  *query logic* (fully solved by the two factories above), not in a
  10-line schema declaration.
- **Config** (`authorManagement.ts`/`publisherManagement.ts`) — two small,
  declarative files (status options, bulk actions, view options), same
  reasoning: little logic to deduplicate in a static data array.
- **UI components** — `AuthorTable`/`PublisherTable`,
  `AuthorCard`/`PublisherCard`, etc. are separate files per entity, the
  same "copy the established pattern, adapt the fields" approach
  Sprint 09's `SubcategoryTable` took relative to Sprint 08's
  `CategoryTable`. A fully generic table/card factory (parameterized by
  field config) was considered and rejected for this sprint: JSX-level
  genericity across differently-shaped entities (an author's photo vs. a
  publisher's website link) adds real complexity for a payoff smaller
  than the repository/service generalization delivered.

## 6. Book <-> Author and Book <-> Publisher relationship support (Tasks 12–13)

`listBooks({ authorId })`/`listBooks({ publisherId })` already existed in
`book.repository.ts`/`book.service.ts` (Sprint 10) — reused directly
wherever actual book rows for an author/publisher are needed (e.g. a
future "Books by this author" screen). What Sprint 10 didn't have is a
lightweight *count*: `getBookCountForAuthor(authorId)` and
`getBookCountForPublisher(publisherId)` (in `author.repository.ts`/
`publisher.repository.ts` respectively), each a single
`{ count: "exact", head: true }` query against `books` — no book row is
ever fetched just to answer "how many." These are implemented in the
Author/Publisher features, not by modifying `book.repository.ts`, since
"how many books does this author have" is conceptually what an Author
page needs, not something the Book repository itself is responsible for.

`AuthorTable`/`AuthorCard` and `PublisherTable`/`PublisherCard` accept an
optional `bookCounts: Record<string, number>` prop — supplied by a future
page that calls the count functions per row — and render a "Books" column/
line only when it's provided, so the components work standalone (no
forced dependency on the Book feature) but light up the relationship the
moment real data is wired in.

## 7. Image Upload Service reuse (Requirements: "Reuse existing ... Image
Upload Service")

`Author.photo_url` is the one field across Author/Publisher that needs
image upload. Rather than duplicate Sprint 10's
`image-upload.service.ts`, that file was **generalized**: its upload/
delete logic was extracted into bucket-parameterized internal helpers
(`uploadToBucket`/`deleteFromBucket`); `uploadBookCoverImage`/
`deleteBookCoverImage` keep their **exact original Sprint 10 signatures
and behavior** (no existing call site changed), and new
`uploadAuthorPhoto`/`deleteAuthorPhoto` call the same helpers against a
new `author-photos` bucket (`STORAGE_BUCKETS.AUTHOR_PHOTOS`, added to
Sprint 10's `storage.constants.ts`; the bucket itself created by
Migration 0003, mirroring Migration 0002's own Storage section).

**A known, documented tradeoff:** `image-upload.service.ts` still
physically lives under `src/features/books/services/`, so
`useAuthorForm.ts` (in `features/authors/`) imports it cross-feature. The
alternative — moving the file to a neutral top-level location like
`src/services/` — was rejected for this sprint specifically because it
would mean editing `useBookForm.ts`'s import too, and this sprint's rules
say not to modify completed architecture without a task requiring it. The
cross-feature import is the more conservative choice; promoting the file
to `src/services/image-upload.service.ts` is a reasonable future cleanup
once a third entity needs image upload, at which point "used by two or
more features" (Day 3's own promotion rule) applies unambiguously.

## 8. Author & Publisher Management UI (Tasks 14–15)

Both follow the exact composed-page shape `CategoryManagementOverview`/
`SubcategoryManagementOverview` (Sprints 08–09) established:

```
AuthorManagementOverview / PublisherManagementOverview
└── PageContainer
    ├── AuthorToolbar / PublisherToolbar   (SearchBar + Filters + view switch + Add button)
    ├── BulkActionBar                       (Sprint 08's component, reused directly)
    ├── AuthorTable/Card <-> PublisherTable/Card
    └── Pagination                          (Sprint 09's component, reused directly)
```

**The meaningful difference from Sprint 08/09:** those frameworks were
explicitly UI-only, with no backend to call. This sprint's
`AuthorManagementOverview`/`PublisherManagementOverview` are ready to
render **real data** the moment a future route calls `authorService.list()`/
`publisherService.list()` and passes the result in — see
`features/admin/README.md`'s worked example
(`app/admin/authors/page.tsx`) for the exact composition, including
computing `bookCounts` via `getBookCountForAuthor`. No such route exists
yet; only the ready-to-use pieces do.

Both `AuthorFormLayout`/`PublisherFormLayout` are presentation-only
components (following `CategoryFormLayout`'s exact styling/structure —
`Save` is `type="button"`, never `type="submit"`), but unlike Sprint
08/09's forms, the *hooks* behind them (`useAuthorForm`/
`usePublisherForm`) are wired to genuinely call `authorService.create`/
`update` and `publisherService.create`/`update` — real persistence is one
hook-and-component-composition away, not a future sprint's work.

## 9. Consistency verification performed

- All 45 new/modified `.ts`/`.tsx` files passed a `tsc --noEmit`
  syntax-only scan — zero `TS1xxx` errors.
- Every cross-file import was checked to resolve to a real file on disk.
- Zero duplicate exported names across `features/admin/components/**`,
  `config/*.ts`, and `features/admin/types/*.ts`.
- Every icon key used this sprint (`building-2`, `check-circle`, `close`,
  `filter`, `grid`, `inbox`, `plus`, `table`, `user-circle`, `users`,
  `x-circle`) already existed in the centralized registry — no new icon
  was needed.
- A brace-expansion shell bug (the same `/bin/sh` limitation
  encountered earlier in this project's history) briefly created literal
  `{services,hooks,types,components}`-named folders instead of four
  separate ones; caught and corrected before finalizing — confirmed via
  `find` that only real, correctly-named directories remain.

## 10. Files added this sprint

```
src/services/createSupabaseRepository.ts    # Generic repository factory
src/services/createEntityService.ts         # Generic service factory

src/types/author.types.ts                   # Author, AuthorInsert, AuthorUpdate
src/types/publisher.types.ts                # Publisher, PublisherInsert, PublisherUpdate

src/config/authorManagement.ts
src/config/publisherManagement.ts

src/features/authors/
├── services/author.repository.ts, author.service.ts, author.validation.ts
├── hooks/useAuthorForm.ts, index.ts
├── types/author-form.types.ts, index.ts
└── README.md

src/features/publishers/
├── services/publisher.repository.ts, publisher.service.ts, publisher.validation.ts
├── hooks/usePublisherForm.ts, index.ts
├── types/publisher-form.types.ts, index.ts
└── README.md

src/features/admin/types/author-management.types.ts
src/features/admin/types/publisher-management.types.ts

src/features/admin/components/authors/
├── AuthorManagementOverview.tsx, AuthorToolbar.tsx, AuthorFilters.tsx,
│   AuthorTable.tsx, AuthorCard.tsx, AuthorFormLayout.tsx,
│   AuthorEmptyState.tsx, AuthorSkeleton.tsx, index.ts

src/features/admin/components/publishers/
├── (identical set to authors/, Publisher-named)

supabase/migrations/0003_author_photos_storage.sql

docs/AUTHOR_PUBLISHER_MANAGEMENT.md          # this file
```

## 11. Files modified — and why

| File | Why |
|---|---|
| `src/config/index.ts` | Barrel exports added for `authorManagement.ts`/`publisherManagement.ts` |
| `src/constants/storage.constants.ts` | Added `STORAGE_BUCKETS.AUTHOR_PHOTOS` — additive only, needed for author photo uploads |
| `src/features/admin/types/index.ts` | Barrel exports added for the two new admin type files |
| `src/features/admin/components/index.ts` | Barrel exports added for `authors/`/`publishers/` |
| `src/features/books/services/image-upload.service.ts` | Generalized to bucket-parameterized internal helpers (§7) — public API (`uploadBookCoverImage`/`deleteBookCoverImage`) unchanged; new `uploadAuthorPhoto`/`deleteAuthorPhoto` added |
| `src/features/README.md` | Notes the new `authors/`/`publishers/` feature folders and the extended `admin/` folder |
| `src/features/admin/README.md` | Structure diagram and usage examples updated for Sprint 11; also fixed a pre-existing duplicated example block found while editing |

**Confirmed no other previous-sprint file was touched** —
`book.repository.ts`, `book.service.ts`, `book.validation.ts`,
`useBookForm.ts`, `config/auth.ts`, `src/middleware.ts`, `AdminShell.tsx`,
every Category/Subcategory component and helper,
`permissions.constants.ts` (no new permission added — see
`authorManagement.ts`'s own note on why Author/Publisher bulk actions are
left unpermissioned pending a future `MANAGE_AUTHORS`/`MANAGE_PUBLISHERS`
permission), and Migrations 0001/0002 all verified untouched.

## 12. Future integration path

1. **Wire real routes.** `app/admin/authors/page.tsx` and
   `app/admin/publishers/page.tsx`, following the worked example in
   `features/admin/README.md`.
2. **Add `MANAGE_AUTHORS`/`MANAGE_PUBLISHERS` permissions** to
   `permissions.constants.ts` (Sprint 05) and grant them in
   `ROLE_PERMISSIONS`, then set them on `AUTHOR_BULK_ACTIONS`/
   `PUBLISHER_BULK_ACTIONS` — deferred this sprint the same way
   `DASHBOARD_QUICK_ACTIONS` (Sprint 07) deferred them, rather than
   mapping to an inaccurate existing permission.
3. **Promote `image-upload.service.ts`** to `src/services/` once a third
   entity needs image upload (§7).
4. **Retrofit `book.repository.ts`/`book.service.ts`** onto the new
   generic factories, if a future sprint decides the consistency is worth
   the migration — not done this sprint, since Book's hand-written
   version already works and wasn't asked to change.
