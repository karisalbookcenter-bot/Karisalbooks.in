# Category & Subcategory Admin CRUD

## Admin access

Use **Categories** or **Subcategories** in the admin sidebar to manage the
catalog. The Dashboard also links directly to both management pages.

The Add buttons remain available when their lists are empty, so the first
category can be created in the admin UI. A subcategory requires an existing
category; the Subcategories page directs the admin to create one first when
none exist.

## Available operations
- CRUD wiring: `onEdit`/`onDelete` wired to `CategoryTable`/`CategoryTreeView`/
  `SubcategoryTable`/`SubcategoryCard` — using prop contracts these
  components already had, never previously passed.
- `onAction` wired to `BulkActionBar` for both screens.
- `CategoryFormLayout`/`SubcategoryFormLayout` now mounted inside their
  Overview, with real
  `handleSave` calling `category.service.ts`/`subcategory.service.ts`.
- The Categories and Subcategories route pages own data fetching and
  `onDataChange`-triggered refetch.
- The Subcategories page is linked from the admin sidebar and loads both
  categories and subcategories.
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
