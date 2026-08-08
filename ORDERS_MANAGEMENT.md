# KarisalBooks.in — Orders Management Framework

**Milestone:** Sprint 13 — Orders Management Framework (Admin CMS)
**Builds on:** Day 3 (`PaginatedResult<T>`, `paginate()`), Sprint 06
(`PageContainer`, `TableSkeleton`/`CardSkeleton`, icon registry), Sprint
08 (`Badge` primitive, `BulkActionBar`, `SearchBar`, UI-only precedent),
Sprint 09 (`Pagination`), Sprint 10 (`Book` entity, `formatCurrency`
usage precedent), Sprint 12 (`SlideOverPanel`, `CustomerManagementOverview`'s
composed-page shape, the "no Add button" reasoning)
**Explicitly out of scope today:** APIs, Supabase queries, CRUD
implementation, business logic, real data fetching.

---

## 1. What kind of sprint this is

Same bucket as Sprint 12's `Customer` framework: pure UI architecture,
built before any `orders` table or backend exists. `Order` has no
`features/orders/` folder, no repository, no service, no validation
schema — only a type, config, pure helpers, and components, following
`Customer`'s exact precedent from one sprint ago.

## 2. Orders Management architecture

```
OrderManagementOverview
└── PageContainer (title="Orders")
    ├── OrderToolbar     (search + status filter + view switch — no Add button)
    ├── BulkActionBar    (Sprint 08's component, reused directly)
    ├── OrderTable  <->  OrderCard grid   (whichever view is active)
    ├── Pagination       (Sprint 09's component, reused directly)
    └── OrderDetailsPanel   (SlideOverPanel's 2nd consumer, opened by "View details")
```

Structurally identical to `CustomerManagementOverview` (Sprint 12) — same
state shape (search, filters, view, pagination, selection, "which record's
details panel is open"), same component composition.

## 3. Why `Order` does not extend `BaseEntity`

Every other entity in this project (`Category`, `Subcategory`, `Book`,
`Author`, `Publisher`, `Customer`) extends `BaseEntity`, which types
`status` as `RecordStatus` ("active" | "inactive" | "archived") — a
*record lifecycle* question: is this row currently usable/visible. An
order's status answers a completely different question — *where is this
order in fulfillment* (`pending` -> `processing` -> `shipped` -> `delivered`,
or `cancelled`/`refunded` off that path). These aren't compatible domains
that happen to share a name; forcing `Order extends BaseEntity` would
either misrepresent what "active"/"inactive" means for an order, or
produce a TypeScript error from incompatibly overriding `status`'s type.

`src/types/order.types.ts` instead declares `Order` with its own
`id`/`created_at`/`updated_at` (same fields, same types as `BaseEntity`,
just not inherited) and its own `status: OrderStatus`. This is the first
and only such departure in the project — every other entity's shared
shape has been broad enough to fit `BaseEntity` honestly; `Order`'s isn't,
and the type reflects that rather than forcing a fit.

## 4. Why there's no "Add Order" anywhere

Identical reasoning to `Customer`'s missing "Add Customer" button
(Sprint 12): an order is created by a customer through a future checkout
flow, never typed in by an admin. `OrderToolbarProps` has no
`onAddOrder` field, and `ORDER_BULK_ACTIONS`
(`src/config/orderManagement.ts`) contains only fulfillment-workflow
transitions an admin legitimately performs on an *existing* order — Mark
as Processing, Mark as Shipped, Mark as Delivered, Cancel — never a
create action.

## 5. Config and helpers

`src/config/orderManagement.ts`:

- **`ORDER_STATUS_META`** — a `Record<OrderStatus, {...}>`, exhaustive by
  construction (TypeScript won't compile if a status is missing a
  mapping), giving each of the six statuses a label, an icon, and a
  `Badge` variant. This is what `OrderStatusBadge` (§6) reads from rather
  than hardcoding a switch statement.
- **`ORDER_STATUS_FILTER_OPTIONS`** — derived from `ORDER_STATUS_META`'s
  keys (not hand-duplicated), plus an "All statuses" entry.
- **`ORDER_BULK_ACTIONS`** — the four fulfillment transitions (§4). No
  `MANAGE_ORDERS` permission exists yet (Sprint 05 never defined one), so
  these are left unpermissioned — the same documented gap
  `authorManagement.ts`/`customerManagement.ts` already left for their
  own bulk actions.
- **`ORDER_VIEW_OPTIONS`** — table/card, identical shape to every other
  entity's view switcher.

`src/lib/helpers/order.helpers.ts` — three pure, in-memory functions
(`searchOrders`, `filterOrdersByStatus`, `getOrderItemCount`), no
Supabase, no I/O, mirroring `customer.helpers.ts`'s exact shape.

## 6. Why `OrderStatusBadge` is new, not a reuse of `StatusBadge`

`StatusBadge` (Sprint 08) is typed to `RecordStatus`. Since `Order.status`
is `OrderStatus` — an incompatible domain (§3) — a new
`OrderStatusBadge` component was needed. It is **not** a duplicate of
`StatusBadge`'s logic, though: both share the exact same underlying
`Badge` UI primitive (Sprint 08) and the exact same "look up label +
variant from config" shape. Only the six-line status→label/variant
mapping differs (`ORDER_STATUS_META` vs. `StatusBadge`'s internal
`RecordStatus` map) — the part that's genuinely different between the two
domains, not the part that would have been duplicate code.

`OrderStatusBadge` stays inside `features/admin/components/orders/`
rather than being promoted to `components/common/` — unlike
`SlideOverPanel` (§7), `OrderStatus` is genuinely order-specific; no
other entity would ever reuse this exact status vocabulary.

## 7. Order Details Panel — `SlideOverPanel`'s second consumer

`OrderDetailsPanel` is the second thing ever built on `SlideOverPanel`
(`components/common/SlideOverPanel.tsx`, Sprint 12) — exactly the "future
Order details view" its own doc comment predicted when it was promoted to
`components/common/` instead of kept Customer-specific. **Zero changes**
were needed to `SlideOverPanel` itself to support this; it was already
generic enough.

Shows the order number, status (`OrderStatusBadge`), customer name, a
line-item list (book title, quantity × unit price), and a subtotal/
shipping/total breakdown — all read directly from stored `Order`/
`OrderItem` fields, with one minor exception: each line's row total
(`quantity × unit_price`) is computed inline for display. This is a
trivial, transparent display computation in the same spirit as
`formatCurrency`'s formatting or a "12 subcategories" count elsewhere in
this project — not a business rule (no tax, discount, or shipping-cost
*policy* is computed anywhere; `subtotal`/`shipping_fee`/`total`
themselves are plain stored fields, never derived here).

**Strictly read-only**, as required: no edit form, no service call. Its
"Update status" footer button is visually present but `disabled` with no
`onClick` — the same placeholder pattern `CustomerDetailsPanel`'s
"Deactivate account" button used.

## 8. Component summary

| Component | Mirrors | Difference |
|---|---|---|
| `OrderTable` | `CustomerTable` | "Items" + "Total" columns (via `getOrderItemCount`/`formatCurrency`); `OrderStatusBadge` instead of `StatusBadge` |
| `OrderCard` | `CustomerCard` | Item-count/total summary line instead of contact info |
| `OrderFilters` | `CustomerFilters` | Reads `OrderStatus`/`ORDER_STATUS_FILTER_OPTIONS`, not `RecordStatus` |
| `OrderToolbar` | `CustomerToolbar` | No Add button (§4) |
| `OrderEmptyState` | `CustomerEmptyState` | "No orders yet" — same passive framing |
| `OrderSkeleton` | `CustomerSkeleton` | Identical — reuses `TableSkeleton`/`CardSkeleton` directly |
| `OrderStatusBadge` | — (new) | Order-specific status→badge mapping (§6) |
| `OrderDetailsPanel` | `CustomerDetailsPanel` | Line items + totals instead of contact fields; `SlideOverPanel`'s 2nd consumer |

## 9. Consistency verification performed

- Every new/modified file (icon registry, entity type, config, helpers,
  admin types, 9 components, 2 barrels, 2 READMEs) passed a
  `tsc --noEmit` syntax-only scan — zero `TS1xxx` errors.
- Every cross-file import was checked to resolve to a real file on disk.
- Zero duplicate exported names across `components/common/*.tsx`,
  `config/*.ts`, and `features/admin/components/**`.
- Every icon key used this sprint (`calendar-clock`, `loader`, `truck`,
  `check-circle`, `x-circle`, `refund`, `filter`, `grid`, `table`,
  `shopping-cart`) is registered in the centralized icon registry,
  confirmed via a set-difference check — only `refund` (mapping to
  lucide's `RotateCcw`) was newly added; every other status icon already
  existed from prior sprints.

## 10. Future integration path

Nothing below is built today:

1. **Add an `orders` table and `order_items` table** (a future
   migration) — `order_items` would need `book_id references books(id)`
   plus the snapshotted `book_title`/`unit_price` columns `OrderItem`
   already models.
2. **Build `features/orders/`** following `features/authors/`'s shape —
   `order.repository.ts`/`order.service.ts` would likely need custom
   (not `createSupabaseRepository`-generated) logic, since `Order` has a
   nested `items` array and doesn't fit the flat
   `SimpleCatalogEntity` shape that factory assumes.
3. **Wire `OrderDetailsPanel`'s "Update status" button** to a real
   mutation at that point.
4. **Add a `MANAGE_ORDERS` permission** (Sprint 05's
   `permissions.constants.ts`) and gate `ORDER_BULK_ACTIONS` with it.
5. **Route + guard.** `app/admin/orders/page.tsx`, extending
   `authConfig.adminRoutePrefixes` and adding the
   `getServerAuthUser()`/`hasMinimumRole()` guard, identical wiring to
   every other future admin route this project's docs describe.
6. **Wire the dashboard's placeholders.** Sprint 07's `StatCard` for
   "Orders" becomes real once a page calls a future `listOrders()` for a
   count, the same integration Sprint 10 documented for "Total Books."

## 11. Files added this sprint

```
src/types/order.types.ts                            # Order, OrderItem, OrderStatus
src/config/orderManagement.ts                        # status meta/bulk/view config
src/lib/helpers/order.helpers.ts                     # search/filter/item-count

src/features/admin/types/order-management.types.ts

src/features/admin/components/orders/
├── OrderManagementOverview.tsx
├── OrderToolbar.tsx
├── OrderFilters.tsx
├── OrderTable.tsx
├── OrderCard.tsx
├── OrderDetailsPanel.tsx
├── OrderStatusBadge.tsx
├── OrderEmptyState.tsx
├── OrderSkeleton.tsx
└── index.ts

docs/ORDERS_MANAGEMENT.md                            # this file
```

## 12. Files modified — and why

| File | Why |
|---|---|
| `src/lib/icons.tsx` | Added the `refund` icon key (`RotateCcw`) — the only status icon not already registered from a prior sprint |
| `src/config/index.ts` | Barrel export added for `orderManagement.ts` |
| `src/lib/helpers/index.ts` | Barrel export added for `order.helpers.ts` |
| `src/features/admin/types/index.ts` | Barrel export added for `order-management.types.ts` |
| `src/features/admin/components/index.ts` | Barrel export added for `orders/` |
| `src/features/admin/README.md` | Structure diagram, generic-pieces list, and usage examples updated for Sprint 13 |
| `src/features/README.md` | New note explaining `Order`'s no-top-level-folder pattern and its `BaseEntity` departure |

**Confirmed no other previous-sprint file was touched** —
`SlideOverPanel.tsx` itself (read and reused, not edited),
`StatusBadge.tsx`, every Book/Author/Publisher backend file, both generic
factories, `config/auth.ts`, `src/middleware.ts`, `AdminShell.tsx`,
`permissions.constants.ts`, and every prior SQL migration all verified
untouched.
