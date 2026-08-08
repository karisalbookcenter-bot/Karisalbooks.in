# KarisalBooks.in — Customer Management Framework

**Milestone:** Sprint 12 — Customer Management Framework (Admin CMS)
**Builds on:** Day 3 (`BaseEntity`, `RecordStatus`, `PaginatedResult<T>`,
`paginate()`), Sprint 06 (`PageContainer`, `TableSkeleton`/`CardSkeleton`,
`MobileNavDrawer`'s accessibility pattern, icon registry), Sprint 08
(`StatusBadge`, `SearchBar`, `BulkActionBar`, UI primitives — and the
"pure UI architecture, no backend yet" precedent this sprint follows most
closely), Sprint 09 (`Pagination`), Sprint 11 (`AuthorManagementOverview`/
`PublisherManagementOverview`'s composed-page shape)
**Explicitly out of scope today:** APIs, Supabase queries, CRUD
implementation, authentication logic, business logic, real data fetching.

---

## 1. What kind of sprint this is

Every entity framework before this one falls into one of two buckets:

- **UI-architecture-only** (Category — Sprint 08, Subcategory — Sprint 09):
  types, config, helpers, and components, with zero backend, built before
  any Supabase table/service existed for them.
- **Full-stack** (Book — Sprint 10, Author/Publisher — Sprint 11):
  repository, service, validation, hooks, *and* UI, all real.

Sprint 12 is deliberately the **first bucket again** — the task list and
Requirements ("No APIs, no Supabase queries, no CRUD implementation, no
real data fetching") describe exactly Category/Subcategory's original
scope, not Book/Author/Publisher's. `Customer` therefore has no
`features/customers/` folder, no repository, no service, no validation
schema, and no form hook — only a type, a config, pure helpers, and
components, the same shape `Category` had throughout Sprint 08.

## 2. Customer Management architecture

```
CustomerManagementOverview
└── PageContainer (title="Customers")
    ├── CustomerToolbar     (search + status filter + view switch — no Add button)
    ├── BulkActionBar       (Sprint 08's component, reused directly)
    ├── CustomerTable  <->  CustomerCard grid   (whichever view is active)
    ├── Pagination          (Sprint 09's component, reused directly)
    └── CustomerDetailsPanel   (NEW: right-anchored slide-over, opened by "View details")
```

This mirrors `AuthorManagementOverview`/`PublisherManagementOverview`
(Sprint 11) almost exactly, with two structural differences driven by
this sprint's scope and the entity's nature (§3, §4).

## 3. Customer entity type (Task 2)

`src/types/customer.types.ts`:

```ts
export interface Customer extends BaseEntity {
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
}
```

`extends BaseEntity` for `id`/`created_at`/`updated_at`/`status`, the Day 3
convention every entity in this project follows. No database migration
backs this type — unlike `Book`/`Author`/`Publisher`, which each have a
real table (Migrations 0001–0003). A real customer account will
eventually correspond 1:1 with a Supabase Auth user; where that role/
profile linkage would live is already discussed in
`docs/AUTH_ARCHITECTURE.md` §2, but wiring it up is a future sprint's
job, not represented in this type today.

## 4. Why there's no "Add Customer" anywhere (Task 3, config)

`src/config/customerManagement.ts` defines `CUSTOMER_STATUS_FILTER_OPTIONS`
(reused directly from `categoryManagement.ts`, the same "RecordStatus
options aren't actually category-specific" reasoning every entity's
config has used since Sprint 09), `CUSTOMER_VIEW_OPTIONS` (table/card),
and `CUSTOMER_BULK_ACTIONS` — but that last one is **Activate/
Deactivate/Archive only, no Delete**, and `CustomerToolbarProps` has no
`onAddCustomer` field at all.

This is a deliberate difference from Category/Subcategory/Author/
Publisher, all of which had "Add" buttons even in their own UI-only
sprints: those are catalog entities an *admin* creates. A customer
account is created by the customer themselves (a future storefront
sign-up flow), never by an admin filling out a form — so unlike a
missing "Add Category" button (which is just "not wired up yet"), an
"Add Customer" button would describe a workflow that will never exist.
The bulk actions that *do* exist are account-moderation actions an admin
legitimately performs on an existing account, matching this sprint's
"read/moderate, don't create" framing.

## 5. Customer helpers (Task 4)

`src/lib/helpers/customer.helpers.ts` — three pure, in-memory functions,
no Supabase, no I/O:

- `searchCustomers(customers, query)` — case-insensitive match across
  name, email, phone.
- `filterCustomersByStatus(customers, statuses)` — same "empty array
  means no filter" convention every `filter*ByStatus` helper in this
  project uses.
- `getCustomerInitials(fullName)` — derives the avatar-fallback initials
  `CustomerTable`/`CustomerCard`/`CustomerDetailsPanel` all show when no
  `avatar_url` exists.

## 6. Components (Tasks 6, 7, 9, 10, 11, 12)

| Component | Task | Mirrors | Difference |
|---|---|---|---|
| `CustomerTable` | 6 | `AuthorTable` | "Contact" column (email+phone) instead of a relationship count; single "View details" action instead of Edit/Delete |
| `CustomerCard` | 7 | `AuthorCard` | Same avatar-or-initials pattern; "View details" instead of Edit/Delete |
| `CustomerFilters` | 9 | `AuthorFilters` | Identical — single status dimension |
| `CustomerToolbar` | 10 | `AuthorToolbar` | No Add button (§4) |
| `CustomerEmptyState` | 11 | `AuthorEmptyState` | "No customers yet" reads passively (no invitation to add one) |
| `CustomerSkeleton` | 12 | `AuthorSkeleton` | Identical — reuses `TableSkeleton`/`CardSkeleton` directly |

All wrap Sprint 06's `EmptyState`, reuse `StatusBadge`/`formatDate`, and
follow the same loading/empty-handling-inside-the-component pattern every
prior table/card component in this project uses.

## 7. Customer Details Panel — the new UI pattern (Task 8)

`CustomerDetailsPanel` is the one genuinely new interaction this sprint
introduces: clicking "View details" on a table row or card opens a panel
sliding in **from the right**, showing that customer's full detail
without navigating away from the list. Every prior "detail" interaction
in this project has been an inline form (`CategoryFormLayout`,
`AuthorFormLayout`, ...); this is the first slide-over.

It's built on a new, generic **`SlideOverPanel`**
(`src/components/common/SlideOverPanel.tsx`), promoted to
`components/common/` rather than kept customer-specific, because "show
one record's details in a slide-over" has no customer logic in it — a
future Order detail view or Book quick-view reuses this exact shell.
`SlideOverPanel` is deliberately **not** a copy of `MobileNavDrawer`
(Sprint 06): that drawer opens from the *left* and shows *navigation*;
this one opens from the *right* and shows *content* — different enough
purposes to warrant a new component, built with the same hand-rolled
accessibility approach (`role="dialog"` + `aria-modal` + Escape-to-close
+ body-scroll lock + a real `<button>` scrim), and the same documented
gap (no focus trap — flagged, not silently shipped as complete, matching
how `MobileNavDrawer`'s own gap was documented).

`CustomerDetailsPanel` itself is **strictly read-only** — it displays
`customer` (avatar, name, status, email, phone, join date) and a
placeholder "Order history will appear here once the Orders system is
built" notice. Its one footer button, "Deactivate account," is visually
present but `disabled` with no `onClick` — a real moderation action wired
to a real mutation is future work, once a Customer *service* exists to
call (§9).

## 8. Consistency verification performed

- Every new/modified file (icon registry, entity type, config, helpers,
  admin types, 9 components, 2 barrels, 2 doc/README files) passed a
  `tsc --noEmit` syntax-only scan — zero `TS1xxx` errors.
- Every cross-file import was checked to resolve to a real file on disk.
- Zero duplicate exported names across `components/common/*.tsx`,
  `config/*.ts`, and `features/admin/components/**`.
- Every icon key used this sprint (`phone`, `mail`, `calendar-clock`,
  `filter`, `grid`, `table`, `users`, `check-circle`, `x-circle`,
  `inbox`, `close`) is registered in the centralized icon registry —
  confirmed via a set-difference check, not just a visual scan.
- **A note on process:** partway through this sprint, the working
  environment's ephemeral filesystem was reset, which momentarily
  appeared to have lost several already-completed files. They were
  recovered by restoring the most recent complete project ZIP (Sprint
  11's) from the persistent outputs directory, then precisely
  reapplying every Sprint 12 change on top of it. This is disclosed here
  rather than silently smoothed over, in case any wording differs
  subtly from what would have been in a single uninterrupted pass.

## 9. Future integration path

Nothing below is built today:

1. **Add a `customers` table** (a future migration) — likely with a
   foreign key to `auth.users.id` (Supabase Auth), since a customer
   account is fundamentally an authenticated user, unlike Category/Book/
   Author/Publisher.
2. **Build `features/customers/`** following `features/authors/`'s exact
   shape: `customer.repository.ts` via `createSupabaseRepository`
   (Sprint 11's generic factory — `Customer`'s flat shape fits it
   immediately), `customer.service.ts` via `createEntityService`, and a
   `customer.validation.ts` for whatever admin-editable fields exist
   (likely just `full_name`/`phone`, since `email` ties to the auth
   identity).
3. **Wire `CustomerDetailsPanel`'s "Deactivate account" button** to a
   real service call at that point, and change its `disabled` state to
   reflect an in-flight request.
4. **Add order-history data** (replacing today's placeholder notice in
   `CustomerDetailsPanel`) once a future Orders system exists to
   aggregate from — the same "placeholder now, real once the dependency
   exists" pattern Sprint 07's dashboard `StatCard`s and Sprint 11's
   `bookCounts` prop already established elsewhere in this project.
5. **Add a `MANAGE_CUSTOMERS` permission** (Sprint 05's
   `permissions.constants.ts`) and gate `CUSTOMER_BULK_ACTIONS` with it,
   the same deferred-permission pattern `authorManagement.ts`/
   `publisherManagement.ts` already left as a named follow-up.
6. **Route + guard.** `app/admin/customers/page.tsx`, extending
   `authConfig.adminRoutePrefixes` and adding the
   `getServerAuthUser()`/`hasMinimumRole()` guard, identical wiring to
   every other future admin route this project's docs describe.

## 10. Files added this sprint

```
src/types/customer.types.ts                        # Customer entity type
src/config/customerManagement.ts                    # status/bulk/view config
src/lib/helpers/customer.helpers.ts                  # search/filter/initials

src/components/common/SlideOverPanel.tsx             # NEW generic pattern

src/features/admin/types/customer-management.types.ts

src/features/admin/components/customers/
├── CustomerManagementOverview.tsx
├── CustomerToolbar.tsx
├── CustomerFilters.tsx
├── CustomerTable.tsx
├── CustomerCard.tsx
├── CustomerDetailsPanel.tsx
├── CustomerEmptyState.tsx
├── CustomerSkeleton.tsx
└── index.ts

docs/CUSTOMER_MANAGEMENT.md                          # this file
```

## 11. Files modified — and why

| File | Why |
|---|---|
| `src/lib/icons.tsx` | Added the `phone` icon key — needed for `CustomerCard`/`CustomerTable`/`CustomerDetailsPanel`'s contact display; no other icon added |
| `src/config/index.ts` | Barrel export added for `customerManagement.ts` |
| `src/lib/helpers/index.ts` | Barrel export added for `customer.helpers.ts` |
| `src/features/admin/types/index.ts` | Barrel export added for `customer-management.types.ts` |
| `src/components/common/index.ts` | Barrel export added for `SlideOverPanel` |
| `src/features/admin/components/index.ts` | Barrel export added for `customers/` |
| `src/features/admin/README.md` | Structure diagram, generic-pieces list, and usage examples updated for Sprint 12 |
| `src/features/README.md` | New note explaining why `Customer` has no top-level `features/customers/` folder, unlike Book/Author/Publisher |

**Confirmed no other previous-sprint file was touched** —
`book.repository.ts`/`service.ts`, every Author/Publisher backend file,
`config/auth.ts`, `src/middleware.ts`, `AdminShell.tsx`,
`MobileNavDrawer.tsx` (read for reference, not edited),
`permissions.constants.ts`, and every prior SQL migration all verified
untouched.
