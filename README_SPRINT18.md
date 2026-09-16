# Sprint 18 (Recreated) — Public Storefront

## Why this version is different from the first Sprint 18 attempt
The first attempt called the **admin** `book.service.ts`/`category.service.ts`/etc.
directly from storefront pages. That surfaced a real, pre-existing (Day 1)
bug: `book.repository.ts`, `author.repository.ts`, `publisher.repository.ts`,
and `createSupabaseRepository.ts` all import the **server** Supabase client
(`@/lib/supabase/server`), which cannot run in `"use client"` code — the
`Module not found: next/headers` build error traced back to this.

Per your explicit rules this time (don't touch the admin book repository,
don't use the server client in client components), this version does
**not** call any admin service or repository at all. Instead, every
storefront page reads directly from Supabase via a brand-new,
**storefront-owned** data-access layer, using only the confirmed-safe
browser client (`@/lib/supabase/client`).

## Architecture

```
src/features/storefront/
├── constants.ts                          # PUBLIC_VISIBLE_STATUS (typed, not a raw string)
├── utils.ts                              # buildNameMap()
├── services/
│   ├── book.storefront.ts                # listPublicBooks, getPublicBookBySlug
│   ├── category.storefront.ts            # listPublicCategories, getPublicCategoryBySlug
│   ├── subcategory.storefront.ts         # listPublicSubcategoriesByCategory
│   └── author-publisher.storefront.ts    # name-only lookups (see note below)
└── components/
    ├── BookCard.tsx
    ├── BookGrid.tsx
    └── SubcategoryChips.tsx

app/
├── page.tsx                # replaces the real Day-1 placeholder
├── books/page.tsx
├── books/[slug]/page.tsx
└── categories/[slug]/page.tsx
```

Every `*.storefront.ts` file queries Supabase directly (`.from("books")`,
`.from("categories")`, etc.) via `createClient()` from
`@/lib/supabase/client` — the exact same table names and column shapes
already confirmed from your uploaded `book.types.ts`/`category.types.ts`/
`subcategory.types.ts`. **No admin repository, service, or component is
imported anywhere in this package** (verified — see checklist).

## Rules verified, not just followed

| Rule | How it's satisfied |
|---|---|
| Don't modify admin features | Zero admin files in this package |
| Don't modify/reuse book admin repository/service | `book.storefront.ts` queries `books` table independently; `book.repository.ts`/`book.service.ts` never imported |
| No server Supabase client in client components | Every service file uses `@/lib/supabase/client` only — grepped, zero matches for `lib/supabase/server` outside an explanatory comment |
| Follow existing architecture | Same hand-written-repository pattern as `category.repository.ts` (Sprint 16); same "fetch once, resolve many" name-lookup pattern as `BookManagementOverview.tsx` |
| No RecordStatus hardcoding | Single typed `PUBLIC_VISIBLE_STATUS` constant, imported everywhere |
| No login/cart/payment/orders | Grepped — none present |

## Honest note on `Author`/`Publisher`
Their full type files were never uploaded in this conversation — only the
`.name` field is confirmed (via `author.service.ts`'s doc comment).
`author-publisher.storefront.ts` therefore only ever selects and returns
`{ id, name }`, not a full `Author`/`Publisher` type, so nothing here
asserts a shape that hasn't actually been confirmed.

## Change from the first draft: no `SearchBar` reuse
The book listing page now uses a plain `<input type="search">` instead of
`@/components/common/SearchBar`. That component's exact prop contract was
never independently verified (only assumed since Sprint 15) — given this
sprint's stricter verification bar, a plain, self-contained input was
preferred over repeating an unverified assumption a third time.

## Build verification
No network access in this sandbox, so `npm run build`/`tsc --noEmit`
could not be run here — see `VERIFICATION_CHECKLIST.md` for exactly what
was checked (grep-based, all passed) versus what still needs your local
`npm run build` to confirm.
