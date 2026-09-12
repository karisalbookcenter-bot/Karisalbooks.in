# Category & Subcategory Admin CRUD — Sprint 17 (final, restriction-compliant)

## Two restrictions applied after initial implementation

**1. Do not modify `category.service.ts`/`subcategory.service.ts` unless a
real compile error requires it.**
The first draft added a 2-line type re-export to each so `CategoryFormLayout.tsx`/
`SubcategoryFormLayout.tsx` could import `CategoryInsert`/`SubcategoryInsert`.
That edit is gone. Instead, both form layouts import those types directly
from `category.repository.ts`/`subcategory.repository.ts` — where they're
already defined (Sprint 16 fix-pass v3) — so the service files need no
change at all. **Neither service file is part of this package.**

**2. Do not change existing UI behaviour or layout — keep EmptyState/Toolbar
exactly as-is.**
The first draft restructured both Overviews so the toolbar stayed visible
even with zero records (so "Add" would be reachable on an empty catalog).
That restructuring is reverted. The original gate is back exactly as
Sprint 08/09 wrote it:

```
!loading && !hasAnyCategories ? <CategoryEmptyState variant="no-data" /> : ( toolbar + panel + bulk + table/tree )
```

**Known, explicitly-accepted consequence:** when a catalog has zero
categories (or zero subcategories), the toolbar — and therefore "Add" —
is not reachable from this screen, because `CategoryEmptyStateProps`/
`SubcategoryEmptyStateProps` expose no add-trigger of their own (only
`onClearFilters`, for search/filter clearing). This is unchanged from
Sprint 08/09's original behavior, preserved per explicit instruction
rather than fixed. Bootstrapping the very first category currently
requires a route other than this screen (e.g. direct Supabase insert)
until a future sprint adds an add-affordance to the empty state itself —
that would be a real (if small) UI change, and is out of scope here.

## What Sprint 17 actually implements (unchanged from the approved plan)
- CRUD wiring: `onEdit`/`onDelete` wired to `CategoryTable`/`CategoryTreeView`/
  `SubcategoryTable`/`SubcategoryCard` — using prop contracts these
  components already had, never previously passed.
- `onAction` wired to `BulkActionBar` for both screens.
- `CategoryFormLayout`/`SubcategoryFormLayout` now mounted inside their
  Overview (inside the same existing non-empty branch), with real
  `handleSave` calling `category.service.ts`/`subcategory.service.ts`.
- Two new route pages, each owning fetch + `onDataChange`-triggered refetch.
- No new hook (proved unnecessary before writing code — see the
  conversation's earlier verification).

## Files

```
MODIFIED (real files you uploaded, edited in place):
  src/features/admin/components/categories/CategoryManagementOverview.tsx
  src/features/admin/components/categories/CategoryFormLayout.tsx
  src/features/admin/components/subcategories/SubcategoryManagementOverview.tsx
  src/features/admin/components/subcategories/SubcategoryFormLayout.tsx
  src/features/admin/types/category-management.types.ts       (additive fields only)
  src/features/admin/types/subcategory-management.types.ts    (additive fields only)

NEW:
  app/admin/categories/page.tsx
  app/admin/subcategories/page.tsx

NOT MODIFIED THIS PASS (were touched in the withdrawn first draft):
  src/features/categories/services/category.service.ts     — reverted, 0 changes
  src/features/subcategories/services/subcategory.service.ts — reverted, 0 changes
```

## Import verification (import paths actually used)
- `CategoryFormLayout.tsx`: `CategoryInsert` ← `@/features/categories/repositories/category.repository` (exists — Sprint 16 fix-pass v3 defined it there); `categoryService.createCategory`/`updateCategory` ← `@/features/categories/services/category.service` (exists, untouched, function names confirmed from that sprint's own read of the real service).
- `SubcategoryFormLayout.tsx`: same pattern, `SubcategoryInsert` ← `@/features/subcategories/repositories/subcategory.repository`.
- `CategoryManagementOverview.tsx`/`SubcategoryManagementOverview.tsx`: `categoryService`/`subcategoryService` namespace imports call `deleteCategory`/`deleteCategories`/`updateCategoriesStatus` (and the Subcategory equivalents) — all already existed in the untouched service files, only the *files* were reverted, not these Overview components' calls into them.
- No import references either `useCategoryForm.ts` or `useSubcategoryForm.ts` — confirmed absent, consistent with the no-new-hook decision.

## TypeScript verification method (same caveat as every prior sprint)
No network access in this sandbox — no real `tsc`/build. Done instead:
brace/paren balance check across all 8 modified/new files, plus a full
manual re-trace of every prop each edited component passes, against the
real uploaded prop-contract types, after reverting both restricted changes.

## Assumptions carried forward (unchanged from the first draft)
- `BulkActionBar` accepts an `onAction` prop — never independently confirmed (its own source was never supplied).
- `PaginatedResult<T>`'s exact shape — still inferred.
- Parent-category exclusion (`getDescendantIds`, local to `CategoryManagementOverview.tsx`) — unchanged, still not added to the unseen `category.helpers.ts`.
- No `category.validation.ts`/`subcategory.validation.ts` exists — both forms still use minimal inline required-field checks only.
