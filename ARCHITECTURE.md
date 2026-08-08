# KarisalBooks.in — Master Architecture

**Milestone:** Day 3 — Master Architecture
**Scope:** Folder structure, configuration system, constants, shared types,
navigation config, layout wrappers, route constants, and utility helpers.
**Explicitly out of scope today:** login/auth, products, cart, checkout,
payment, orders, frontend pages, and APIs. Nothing in this document wires
up to a real page, a real database call, or a real UI screen — it is the
skeleton those things will attach to later.

---

## 1. Why a feature-based architecture

A book eCommerce site has clearly separable product areas — Books,
Competitive Exams, Publication Services, Offer Zone, Pre Booking, Contact,
About — that will each grow their own components, hooks, and data-access
code over time. Two folder strategies are common:

- **Type-based** (`components/`, `hooks/`, `services/` each containing
  files for every feature mixed together)
- **Feature-based** (`features/books/`, `features/offer-zone/`, ... each
  containing its own `components/`, `hooks/`, `services/`, `types/`)

We use **feature-based**, with a small shared layer for anything genuinely
cross-cutting. This keeps each product area self-contained (easy to find
everything related to "Offer Zone" in one place, easy to eventually extract
or hand off to a different team) while the shared layer prevents
duplicating things like the Supabase client or the `Button` component
across every feature.

## 2. Folder structure

```
src/
├── app/                     # Next.js App Router (Day 1) — untouched
├── components/              # Cross-feature UI (Day 1: layout/, ui/) — untouched
├── config/                  # NEW — app.ts, navigation.ts, settings.ts
├── constants/                # NEW — routes.constants.ts, app.constants.ts
├── contexts/                 # NEW — createSafeContext.tsx (pattern only)
├── features/                  # NEW — one folder per product area
│   ├── books/
│   ├── competitive-exams/
│   ├── publication-services/
│   ├── offer-zone/
│   ├── pre-booking/
│   ├── contact/
│   └── about/
│       each containing: components/ hooks/ services/ types/
├── hooks/                    # NEW — cross-feature hooks (useMounted, useToggle)
├── layouts/                   # NEW — PageWrapper, SectionWrapper, ContentContainer
├── lib/                      # Day 1: supabase/, utils.ts — untouched
│   └── helpers/               # NEW — string/format/array helpers
├── services/                  # NEW — BaseService<T> contract (pattern only)
└── types/                    # Day 2 had index.ts — untouched; NEW files added:
    ├── common.types.ts
    ├── navigation.types.ts
    └── layout.types.ts
```

Nothing from Day 1 (project setup, layout, home page) or Day 2 (database
migration) was modified. Everything above is additive.

## 3. The configuration system (`src/config`)

Three files, each with a distinct responsibility so a future engineer
knows exactly where to look:

| File             | Answers the question...                                  |
|-------------------|-----------------------------------------------------------|
| `app.ts`          | "What is this site called, and what's its identity/SEO/contact info?" |
| `navigation.ts`   | "What menu items exist, in what order, pointing where?"   |
| `settings.ts`     | "What are the business/behavioral defaults and feature flags?" |

Each exports a plain, typed object (`appConfig`, `mainNavigation`,
`settings`) — no logic, no side effects, safe to import anywhere including
Server Components. A barrel file (`config/index.ts`) re-exports all three
so consuming code can `import { appConfig, mainNavigation } from "@/config"`.

## 4. Centralized constants (`src/constants`)

- **`routes.constants.ts`** — the single source of truth for every internal
  URL (`ROUTES.BOOKS`, `ROUTES.CONTACT`, etc.), plus derived types
  (`AppRoute`, `RouteKey`) so a function can require "a valid route" as a
  type, not just any string.
- **`app.constants.ts`** — non-route constants: the `RECORD_STATUS` values
  (kept in sync with the `record_status` enum from the Day 2 SQL
  migration), pagination defaults, generic UI copy, locale, and currency.

Rule enforced by this structure: **no file outside `constants/` should ever
contain a hardcoded path string or a magic value** like `"active"` or
`20` — it imports the constant instead.

## 5. Reusable TypeScript interfaces (`src/types`)

Three new files, additive to the Day 2 `types/index.ts` placeholder:

- **`common.types.ts`** — `RecordStatus`, `BaseEntity` (the `id` /
  `created_at` / `updated_at` / `status` shape every Day 2 table has —
  future feature entities like `Book` will `extend BaseEntity` instead of
  re-declaring those four fields), `ApiResponse<T>` (a consistent
  success/error shape for future services), `PaginatedResult<T>`, and small
  utility aliases (`Nullable<T>`, `Maybe<T>`, `ID`).
- **`navigation.types.ts`** — `NavigationItem` (id, label, href, order,
  isVisible, optional nested `children` for a future dropdown/mega-menu)
  and `NavigationConfig`.
- **`layout.types.ts`** — `LayoutProps` (what every layout wrapper accepts)
  and `PageMeta` (title/description/ogImage shape for future per-page SEO).

## 6. Navigation configuration (`src/config/navigation.ts`)

Defines `mainNavigation`, an ordered list of exactly the required items:
Home, Books, Competitive Exams, Publication Services, Offer Zone,
Pre Booking, Contact, About — each with a stable `id`, a `label`, an `href`
drawn from `ROUTES` (never a hardcoded string), an `order`, and an
`isVisible` flag so an item can be defined ahead of time and toggled on
later without touching this file's structure. Each item's type also allows
an optional `children` array — unused today, but it means that when Books
later needs a dropdown built from the Day 2 categories tree, that's a data
change, not a type change.

No header component renders this yet — that is a UI-milestone concern.

## 7. Reusable layout wrappers (`src/layouts`)

Three structural components: `PageWrapper`, `SectionWrapper`,
`ContentContainer`. Each is intentionally minimal — a semantic HTML element
plus a `className` passthrough, with **no visual styling** (no colors,
spacing, or typography decisions), since visual design is out of scope for
this milestone. Their only job is to establish *where* a page, a section,
and a width-constrained container compose in the tree, so a future design
pass has a consistent structure to style rather than inventing wrapper
components on the fly.

This is a distinct, lower-level folder from the existing
`src/components/layout/` (Header, Footer, MainLayout, built Day 1 with
real visual UI) — that folder is untouched and will eventually be composed
*using* these structural primitives.

## 8. Route constants (`src/constants/routes.constants.ts`)

Covered in §4 above — `ROUTES`, `AppRoute`, `RouteKey`. This is the file
`navigation.ts` reads from, and the file any future page/link/redirect
should read from instead of writing a path literal.

## 9. Reusable utility helpers (`src/lib/helpers`)

Pure, framework-agnostic functions, grouped by concern:

- **`string.helpers.ts`** — `slugify`, `truncate`, `capitalize`
- **`format.helpers.ts`** — `formatCurrency` (INR), `formatDate`
- **`array.helpers.ts`** — `chunk`, `paginate` (returns the
  `PaginatedResult<T>` shape from `common.types.ts`)

These are additive to the Day 1 `lib/utils.ts` (the shadcn/ui `cn()`
class-name helper), which is untouched — `lib/utils.ts` stays focused on
styling concerns, `lib/helpers/` covers everything else.

## 10. Services and hooks (pattern only, no implementation)

- **`src/services/base.service.ts`** defines `BaseService<T extends
  BaseEntity>` — the shape (`getById`, `list`) every future feature service
  will implement against Supabase. No method body exists yet; this is the
  contract, not the implementation.
- **`src/hooks/`** contains two small, genuinely generic hooks
  (`useMounted`, `useToggle`) that don't belong to any one feature and
  don't render any UI themselves.
- **`src/contexts/createSafeContext.tsx`** is a factory for building a
  type-safe Context/Provider/hook trio without repeating boilerplate or
  using a fake default value. No application context (cart, auth, etc.) is
  created — those are out of scope today.

## 11. What deliberately isn't here yet

By design, this milestone contains no page component, no route handler, no
Supabase query, no auth check, and no styled UI beyond what already existed
from Day 1. Every file above is either a type, a config object, a constant,
a documented empty folder, or a structurally-plain wrapper. That's the
intended boundary of "Master Architecture": the shape of the codebase is
now fixed, so every future milestone (Books feature, Auth, Cart, Admin,
APIs) has an obvious, pre-agreed place to land.
