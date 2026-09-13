# Sprint 18 Verification Checklist

## Automated checks run (this sandbox — no network, no real tsc/build)
- [x] Brace/paren balance across all 9 files — all clean.
- [x] No `"active"`/`"inactive"`/`"archived"` string literal outside `constants.ts`.
- [x] No `app/categories/[slug]/[...]` nested directory exists.
- [x] No cart/checkout/payment/login/register functionality (only doc-comments mentioning them as future/out-of-scope).
- [x] No Sprint 14–17 file present in this package.

## Manual checks — please verify after merging into your repo

- [ ] `npm run build` / `npx tsc --noEmit` passes locally (not run here — no network access in this sandbox).
- [ ] Home page (`/`) loads, shows recent books and top-level categories.
- [ ] `/books` — search box filters results; category dropdown filters results; Prev/Next pagination works past 12 books.
- [ ] `/books/[slug]` — a real book's detail page shows cover, title, author, publisher (if set), price, stock, ISBN (if set), description.
- [ ] `/books/some-fake-slug` — shows "Book not found" with a link back to `/books`.
- [ ] `/categories/[slug]` — a real category's page shows its name/description, subcategory chips, and its books.
- [ ] Clicking a subcategory chip filters the book grid **without navigating** (URL stays `/categories/[slug]`).
- [ ] Clicking "All" chip clears the subcategory filter.
- [ ] `/categories/some-fake-slug` — shows "Category not found".
- [ ] A book with `status !== "active"` (if you have one) does **not** appear on any storefront page.
- [ ] Existing `/admin/*` routes still work unaffected (this sprint touched nothing under `app/admin/`).

## Known, accepted gaps (by design, not oversight)
- No SSR/ISR — all storefront pages are Client Components (see README's "Architecture decisions").
- No breadcrumb / category link on the book detail page (not in the requested field list).
- Pagination on `/books` is Prev/Next only, no page-size selector or jump-to-page.
