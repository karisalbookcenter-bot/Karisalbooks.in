# Category & Subcategory Backend Integration — Sprint 16

## What this sprint delivers
Real Supabase-backed read/write access for Categories and Subcategories
(`category.repository.ts`/`category.service.ts`,
`subcategory.repository.ts`/`subcategory.service.ts`), and wires that data
into the one place this project already has full, verified control over:
the Book admin flow (`BookManagementOverview.tsx`, `BookFormLayout.tsx`,
`BookFilters.tsx`, `BookTable.tsx`) built in Sprint 15.

## Why hand-written repositories, not the Author/Publisher factory
Sprint 11 used `createSupabaseRepository`/`createEntityService` for
Author/Publisher. This sprint does **not** call that factory, because its
exact config shape and import path were never supplied as a real file —
`author.repository.ts`/`publisher.repository.ts` themselves were never
uploaded, only described in prose (`AUTHOR_PUBLISHER_MANAGEMENT.md`).
Guessing that factory's signature risked a broken import.

Instead, `category.repository.ts`/`subcategory.repository.ts` are
hand-written directly against the Supabase client — the same shape
`book.repository.ts` (Sprint 10) uses, which IS independently confirmed:
`useBookForm.ts` (a `"use client"` hook) calls `bookService.createBook`/
`updateBook` directly with no API route or Server Action in between,
which only works if `book.service.ts`/`book.repository.ts` already use the
**browser** Supabase client (`@/lib/supabase/client`), not the server one.
`category.repository.ts`/`subcategory.repository.ts` follow that same,
evidence-based convention.

**If `author.repository.ts`/`publisher.repository.ts`'s real source is
supplied later**, this could be refactored to use the same factory for
full consistency — noted as a fair follow-up, not done here to avoid an
unverified import.

## Assumptions still open (flagged, not silently made)
1. Table names `categories`/`subcategories`, column `category_id` on
   `subcategories` — inferred from the Day 2 migration description, not
   read directly (though the real `subcategory.types.ts`'s own doc comment
   does independently confirm `category_id` is `not null` on that table,
   which matches).
2. `@/components/ui/select`'s `Select` component accepts a `disabled` prop
   (used on the Subcategory field, disabled until a category is picked) —
   a standard assumption for a shadcn-style select wrapper, not
   independently confirmed.
3. `PaginatedResult<T>`'s exact shape (`items`/`total`/`page`/`pageSize`)
   — `book.service.ts` confirms this type exists and wraps `Book[]`, but
   `common.types.ts` itself was never supplied, so its field names are
   still inferred, not read.

(The `CategoryInsert`/`CategoryUpdate`/`SubcategoryInsert`/`SubcategoryUpdate`
assumption from the first two Sprint16.zip versions has been resolved —
see the fix pass v3 note above — rather than left on this list. Same for
the `ParentCategorySelector` import.)

## Explicit scope decision — what this sprint does NOT do
Task list asked to wire **BookFormLayout** to real category data, which is
done. It did not ask to wire the Sprint 08/09 `CategoryManagementOverview`/
`SubcategoryManagementOverview` admin pages themselves (their own
add/edit/delete UI) to this new backend — and that was deliberately not
attempted here, because:
- Their real source files were never supplied (same reasoning as the
  Author/Publisher factory above).
- Guessing their prop contracts and rewriting their internals would
  violate this sprint's own "no UI redesign" / "do not modify previous
  sprint features unless required" constraints far more than leaving them
  untouched does.
- No route currently mounts them anyway (`app/admin/categories/page.tsx`
  and `app/admin/subcategories/page.tsx` don't exist yet — Sprint 14 only
  mounted `/admin`, Sprint 15 only mounted `/admin/books`).

**Recommended as a real Sprint 17**, once `CategoryManagementOverview.tsx`/
`SubcategoryManagementOverview.tsx`'s actual source can be supplied for the
same kind of precise, verified fix Sprint 15→16 did for Books.

## Fix pass v3 — verified against the real book.service.ts, category.types.ts, subcategory.types.ts
The person supplied these 5 real files: `category.types.ts`,
`category-management.types.ts`, `subcategory.types.ts`,
`subcategory-management.types.ts`, `book.service.ts`. Three real bugs were
found and fixed — all in files this sprint owns, no backend file touched:

1. **`book.service.ts`'s bulk method names were wrong.** Code called
   `bookService.deleteBooks(ids)` / `bookService.updateBooksStatus(ids, status)`
   — guesses. Real names: **`bulkDeleteBooks(ids)`** / **`bulkUpdateBooksStatus(ids, status)`**.
   Fixed in `BookManagementOverview.tsx`.
2. **`listBooks()`'s status filter shape was wrong.** Code sent
   `status: filters.statuses[0]` (singular, first element). Real shape is
   `statuses?: RecordStatus[]` (plural array). Fixed to send the whole
   array, or `undefined` when empty (an empty array risked being read as
   an `.in()` filter matching zero rows, not "no filter").
3. **`category.types.ts`/`subcategory.types.ts` do NOT export
   `CategoryInsert`/`CategoryUpdate`/`SubcategoryInsert`/`SubcategoryUpdate`.**
   Only `Category`/`CategoryTreeNode` and `Subcategory` are exported. The
   original repository files imported those four names from the types
   files anyway — an import that would have failed outright. Fixed by
   defining all four locally inside `category.repository.ts`/
   `subcategory.repository.ts` instead of touching the types files
   themselves (existing, completed Sprint 08/09 files).

Also fixed while cross-checking: `listBooks()`'s real `sortBy` parameter
is typed `keyof Book`, not `string` — `BookManagementOverview.tsx`'s
`filters.sortBy` (a plain `string`) is now cast at the call site, since
`BOOK_SORT_OPTIONS`'s ids are already real `Book` keys.

**Confirmed correct, no change needed:** `listBooks()`'s `categoryId`/
`authorId`/`page`/`pageSize`/`sortDirection` params (camelCase, matches
exactly), `deleteBook(id)` singular, `Category`/`Subcategory`'s `name`/
`slug`/`description`/`category_id` field names, `CategoryManagementOverviewProps`
confirming that page still takes `categories?: Category[]` as an optional
prop (consistent with this sprint's decision not to touch it).

## Fix applied after packaging (import verification)
The initial Sprint 16 package left `BookFormLayout.tsx` importing
`ParentCategorySelector` from `@/features/admin/components/subcategories`.
That path's existence was based on a doc read earlier in the conversation
that could not be freshly re-confirmed on request. Rather than leave an
unverified cross-feature dependency in place, it was **removed entirely**:
the Category field now uses the same plain `<Select>` this file already
uses for Author/Publisher — no new component, no new pattern, one fewer
external dependency to verify. `errors.category_id` was also added
alongside it, following the same snake_case error-key convention already
established for `errors.author_id`.

## How category/subcategory selection now works in the Book form
- `BookManagementOverview` fetches all categories and subcategories once
  (same pattern as authors/publishers), passes both down to
  `BookFormLayout`.
- Category and Subcategory are both plain `<Select>` elements — identical
  in kind to the existing Author/Publisher selects in the same file.
- Selecting a category clears any previously-selected subcategory
  (handled in `BookFormLayout`, not in `useBookForm.ts`, since that
  cross-field relationship is a presentation concern the hook's own
  `setField` doesn't need to know about).
- The Subcategory `<select>` is filtered client-side to
  `subcategory.category_id === values.categoryId`, disabled until a
  category is chosen.

## Files
```
NEW:
  src/features/categories/repositories/category.repository.ts
  src/features/categories/services/category.service.ts
  src/features/subcategories/repositories/subcategory.repository.ts
  src/features/subcategories/services/subcategory.service.ts

MODIFIED (Sprint 15 files, edited not recreated):
  src/features/admin/components/books/BookManagementOverview.tsx
  src/features/admin/components/books/BookFormLayout.tsx
  app/admin/books/page.tsx
```

## Not touched
`book.service.ts`, `book.repository.ts`, `book.validation.ts`,
`useBookForm.ts`, `book.types.ts`, `book-form.types.ts` (all backend/hook
files from the earlier fix pass), `author.service.ts`/`publisher.service.ts`,
`AdminShell`, `app/admin/layout.tsx`, every existing Category/Subcategory
admin UI component (`CategoryManagementOverview.tsx`,
`SubcategoryManagementOverview.tsx`, `CategoryFormLayout.tsx`,
`SubcategoryFormLayout.tsx`, etc.), and `BookTable.tsx`/`BookCard.tsx`/
`BookToolbar.tsx`/`BookEmptyState.tsx`/`BookSkeleton.tsx` (no reason to
touch — they already received real category/author data via props
correctly).

## Verification method
No network access in this sandbox — same limitation as the Sprint 15 fix
pass, so no real `tsc`/`next build` was run. Done instead:
1. Line-by-line reasoning against the 3 real files supplied in the
   previous turn (`book.types.ts`, `book-form.types.ts`, `useBookForm.ts`)
   to justify the browser-client choice above.
2. Brace/paren balance check across all 7 new/modified files — all
   balanced.
3. Manual trace of every prop passed into `BookFormLayout`/`BookTable`/
   `BookFilters` from `BookManagementOverview` to confirm the removed
   `categories`/`subcategories` props still line up now that they're
   local state instead.
