# Sprint 16 — Category & Subcategory Backend Integration

Full details, assumptions, and scope decisions: `docs/CATEGORY_SUBCATEGORY_BACKEND.md`.

## Fix pass v3 (this version)
Verified against 5 real files the person supplied (`category.types.ts`,
`category-management.types.ts`, `subcategory.types.ts`,
`subcategory-management.types.ts`, `book.service.ts`). Found and fixed 3
real bugs — see the doc's "Fix pass v3" section for exact detail:
- `book.service.ts`'s bulk methods are `bulkDeleteBooks`/`bulkUpdateBooksStatus`, not `deleteBooks`/`updateBooksStatus`.
- `listBooks()`'s status filter is `statuses: RecordStatus[]`, not `status: RecordStatus`.
- `category.types.ts`/`subcategory.types.ts` don't export Insert/Update types — now defined locally in each repository file instead.

## New files (4)
- `src/features/categories/repositories/category.repository.ts`
- `src/features/categories/services/category.service.ts`
- `src/features/subcategories/repositories/subcategory.repository.ts`
- `src/features/subcategories/services/subcategory.service.ts`

## Modified files (3) — edited in place from the verified Sprint 15 state, not recreated
- `src/features/admin/components/books/BookManagementOverview.tsx` — fetches categories/subcategories internally (same pattern as authors/publishers); uses the real `bulkDeleteBooks`/`bulkUpdateBooksStatus`/`statuses[]` shapes now.
- `src/features/admin/components/books/BookFormLayout.tsx` — real Subcategory field, filtered by selected category; resets subcategory when category changes. Category field uses a plain `<Select>` (same as Author/Publisher in this file) — no `ParentCategorySelector` dependency.
- `app/admin/books/page.tsx` — simplified now that `BookManagementOverview` takes no props.

## Documentation
- `docs/CATEGORY_SUBCATEGORY_BACKEND.md` — new sprint doc, following this project's existing per-sprint `docs/*.md` convention.

## Explicitly out of scope (see doc for why)
Sprint 08/09's own `CategoryManagementOverview`/`SubcategoryManagementOverview`
admin pages were not wired to this new backend — their real source was
never supplied, and no route mounts them yet regardless.

## Still open (see doc's "Assumptions still open")
Table/column names, the `Select` component's `disabled` prop, and
`PaginatedResult<T>`'s exact field shape — none read directly yet.
