# Sprint 17 — Category & Subcategory Admin CRUD (final)

Full detail: `docs/CATEGORY_SUBCATEGORY_ADMIN_CRUD.md`.

## Two restrictions applied, both fully complied with
1. **`category.service.ts`/`subcategory.service.ts` are not in this
   package at all** — an earlier draft added a small type re-export to
   each; reverted, and the form layouts now import those types from the
   repository files instead, where they already existed.
2. **EmptyState/Toolbar behavior is byte-identical to Sprint 08/09** — an
   earlier draft restructured the empty-state gate so "Add" stayed
   reachable on an empty catalog; reverted. Known, explicitly-flagged
   consequence: the very first category/subcategory can't be added from
   this screen while the list is empty (documented, not fixed).

## Modified (8 files, all real, uploaded, edited in place)
- `CategoryManagementOverview.tsx` / `SubcategoryManagementOverview.tsx` — CRUD wiring only: `onEdit`/`onDelete`/bulk `onAction`, form mounted, original layout/gate untouched.
- `CategoryFormLayout.tsx` / `SubcategoryFormLayout.tsx` — controlled fields + real `handleSave`, no hook.
- `category-management.types.ts` / `subcategory-management.types.ts` — additive fields only.

## New (2 files)
- `app/admin/categories/page.tsx`
- `app/admin/subcategories/page.tsx`

## Verified
Imports, TypeScript (manual, no network for a real build — see doc), modified-files list, and every modification's reasoning — all in the doc above.
