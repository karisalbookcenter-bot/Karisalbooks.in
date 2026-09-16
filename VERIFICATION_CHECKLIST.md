# Sprint 18 (Recreated) — Verification Checklist

## Automated checks run in this sandbox (no network — grep-based, not a real build)

- [x] Brace/paren balance across all 13 files — clean.
- [x] Zero import of `@/lib/supabase/server` anywhere in this package (only an explanatory doc-comment mentions the string).
- [x] Zero import from `@/features/books/services/*`, `@/features/categories/services/*`, `@/features/subcategories/services/*`, `@/features/authors/services/*`, `@/features/publishers/services/*` (only an explanatory doc-comment mentions one path).
- [x] Zero `"active"`/`"inactive"`/`"archived"` string literal outside `constants.ts`.
- [x] Zero `cart`/`checkout`/`payment`/`createOrder`/`supabase.auth` reference anywhere.
- [x] Zero file under any `admin` path in this package.

## What you need to run locally (this sandbox cannot)

- [ ] `npm run build` — the real, authoritative check. Please run this before merging and paste any error here.
- [ ] `npx tsc --noEmit` — if the build passes but you want an extra type-check pass.

## Manual functional checks (after merging + `npm run dev`)

- [ ] `/` — loads, shows "Shop by category" links and a "Recently added" grid.
- [ ] `/books` — search box filters by title; category dropdown filters; Prev/Next pagination appears past 12 books.
- [ ] `/books/[slug]` for a real, active book — shows cover, title, author, publisher (if set), price, stock, ISBN (if set), description.
- [ ] `/books/some-fake-slug` — shows "Book not found".
- [ ] `/categories/[slug]` for a real, active category — shows name/description, subcategory chips, filtered books.
- [ ] Clicking a subcategory chip filters in place (URL does not change).
- [ ] `/categories/some-fake-slug` — shows "Category not found".
- [ ] Any book/category with `status` other than `"active"` does NOT appear anywhere on the storefront.
- [ ] `/admin/*` routes still work exactly as before (this package touches nothing under `app/admin/` or any admin feature file).

## Known, accepted scope limits (by design)
- No SSR — every page is a Client Component, since the storefront intentionally avoids the server Supabase client entirely per this sprint's rules.
- No login, cart, checkout, payment, or orders — explicitly out of scope.
- `Author`/`Publisher` are only ever read as `{ id, name }` — their full type/shape was never confirmed.
