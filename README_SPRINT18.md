# Sprint 18 — Public Storefront (Read-Only)

## What this delivers
A read-only public catalog: home page, full book listing with search +
category filter, book detail page, and single-route category browsing
with subcategory chips as in-page filters. No login, cart, checkout,
payment, orders, or customer backend — all explicitly out of scope, per
the approved plan.

## Two requirements applied
1. **No hardcoded `RecordStatus` values.** `src/features/storefront/constants.ts`
   defines one typed constant, `PUBLIC_VISIBLE_STATUS: RecordStatus = "active"`,
   imported by every storefront file that filters by status. No existing
   shared runtime constant for this was found in any verified file
   (`common.types.ts` was never uploaded) — this is a single source of
   truth pending a real shared constant, not a guess at one that doesn't
   exist. Verified: no `"active"`/`"inactive"`/`"archived"` string literal
   appears anywhere else in this package.
2. **Category browsing: `/categories/[slug]` only.** Confirmed no nested
   route directory exists in this package. Subcategory selection is
   local component state that refetches books on the same page.

## Files

```
NEW:
  app/books/page.tsx
  app/books/[slug]/page.tsx
  app/categories/[slug]/page.tsx
  src/features/storefront/constants.ts
  src/features/storefront/utils.ts
  src/features/storefront/components/BookCard.tsx
  src/features/storefront/components/BookGrid.tsx
  src/features/storefront/components/SubcategoryChips.tsx

REPLACED (real Day-1 placeholder — confirmed via your uploaded page.tsx,
never touched since Day 1; not a completed Sprint 14–17 file):
  app/page.tsx
```

**Nothing from Sprint 14–17 is in this package.** `app/layout.tsx`,
`MainLayout`, `book.service.ts`, `category.service.ts`,
`subcategory.service.ts`, `author.service.ts`, `publisher.service.ts` are
all consumed exactly as confirmed, unmodified.

## Architecture decisions, stated plainly
- Every page is a Client Component (`"use client"`), matching the
  confirmed existing pattern — every service uses the browser Supabase
  client. Trade-off: no server-side rendering for the public catalog in
  this sprint. Flagged in the original plan as a deliberate
  consistency-over-SEO choice, not an oversight.
- `getCategoryBySlug` does not exist on `category.service.ts` — the
  category page fetches the full category list once and matches by slug
  client-side, rather than adding a method to a Sprint 16 file
  unnecessarily. Fine at current scale.
- Author/Publisher names: listing pages fetch the full list once and
  build an id→name lookup (`buildNameMap`); the detail page instead uses
  `.get(id)` for the two records it actually needs — the more efficient
  choice for a single-item page.
- Pagination on `/books` is a plain Prev/Next pair, not the shared
  `Pagination` component — that component's prop contract was guessed at
  two different ways across earlier sprints (never independently
  verified), so a third guess was avoided in favor of two buttons built
  directly on `listBooks`'s own `page`/`total` fields.
- `BookCard.tsx` is storefront-only, not reused from the admin
  `BookCard.tsx` — the admin version's props (selection, edit/delete) are
  admin-specific, and reusing it would couple the public site to the
  admin feature folder.

## Assumptions (unchanged from the approved plan, still open)
- `Category`/`Subcategory` `status` gates public visibility — assumed,
  not confirmed against a real access-control requirement.
- `category.service.ts`/`subcategory.service.ts`'s `status` filter
  (singular) and `book.service.ts`'s `statuses` filter (plural array) are
  both used exactly per their real/self-authored signatures — this
  inconsistency between the two services is real and pre-existing, not
  introduced here.
- `SearchBar`'s exact prop contract (`value`/`onChange`/`placeholder`) —
  same assumption carried since Sprint 15, never independently verified.
