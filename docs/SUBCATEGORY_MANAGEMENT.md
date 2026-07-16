# KarisalBooks.in — Subcategory Management Framework

**Milestone:** Sprint 09 — Subcategory Management Framework
**Builds on:** Day 2 (`subcategories` SQL table), Day 3 (`BaseEntity`,
`PaginatedResult<T>`, `paginate()`), Sprint 05 (`MANAGE_CATEGORIES`
permission), Sprint 06 (`AdminShell`, `PageContainer`,
`TableSkeleton`/`CardSkeleton`, icon registry), Sprint 07 (config-driven
widget pattern), Sprint 08 (`CategoryManagementOverview`'s page-architecture
shape, `StatusBadge`/`SearchBar`/`BulkActionBar`, all five `components/ui`
form primitives, `Category` type, `category.helpers.ts`)
**Explicitly out of scope today:** CRUD logic, API routes, database
queries, Supabase calls, Products, Orders, Customers, authentication
pages. Every component operates on props — nothing fetches or persists.

---

## 1. Subcategory architecture

Same composed-widget shape as Sprint 08's `CategoryManagementOverview`
and Sprint 07's `DashboardOverview`: `SubcategoryManagementOverview`
(`src/features/admin/components/subcategories/SubcategoryManagementOverview.tsx`)
is the "page architecture" task 1 asked for, owning UI state and
delegating rendering to smaller widgets.

```
SubcategoryManagementOverview
└── PageContainer (title="Subcategories")
    ├── SubcategoryToolbar   (search + status/category filters + view switch + Add button)
    ├── BulkActionBar        (reused directly from Sprint 08 — shown only once count > 0)
    ├── SubcategoryTable  <->  SubcategoryCard grid   (whichever `view` is active)
    └── Pagination           (new this sprint)
```

```tsx
// A future app/admin/subcategories/page.tsx
import { AdminShell } from "@/features/admin/components/layout";
import { SubcategoryManagementOverview } from "@/features/admin/components/subcategories";

export default function AdminSubcategoriesPage() {
  return (
    <AdminShell>
      <SubcategoryManagementOverview
        subcategories={realSubcategories}
        categories={realCategories}
      />
    </AdminShell>
  );
}
```

### What's reused verbatim from Sprint 08 (no duplication)

- **`BulkActionBar`, `SearchBar`, `StatusBadge`, `PageContainer`** —
  imported directly, zero changes. Task 8 is explicitly titled "Bulk
  Action Bar **integration**," not creation, for exactly this reason.
- **`Input`, `Label`, `Textarea`, `Select`, `Button`** — all five
  `components/ui` primitives `SubcategoryFormLayout` needs already existed
  from Sprint 08. No sixth primitive was added.
- **`CATEGORY_STATUS_FILTER_OPTIONS`** — re-exported as
  `SUBCATEGORY_STATUS_FILTER_OPTIONS` (`config/subcategoryManagement.ts`)
  rather than redefined, since `RecordStatus` options aren't actually
  category-specific.
- **`findCategoryById`, `getCategoryOptionList`** (the latter added this
  sprint to `category.helpers.ts`) — power `getSubcategoryCategoryName`
  and `ParentCategorySelector` respectively, rather than a second
  category-lookup implementation.

### What's new this sprint

| Component | Task | What it is |
|---|---|---|
| `SubcategoryManagementOverview` | 1 | Composed page architecture |
| `SubcategoryTable` | 2 | Sortable columns, Category column, reuses `StatusBadge` |
| `ParentCategorySelector` | 3 | Indented category picker — reused in form + filter |
| `SubcategoryCard` | 4 | Card view, no descendant count (subcategories don't nest) |
| `SubcategoryFormLayout` | 5 | Add/Edit form layout — UI only, `ParentCategorySelector` required |
| `SubcategoryFilters` | 6 | Status **and** category filters |
| `SubcategoryToolbar` | 7 | Combines search + filters + view switch + Add button |
| `BulkActionBar` integration | 8 | Sprint 08's component, wired with `SUBCATEGORY_BULK_ACTIONS` |
| `SubcategoryEmptyState` | 9 | "No subcategories yet" / "No results" variants |
| `SubcategorySkeleton` | 10 | Reuses Sprint 06/07's `TableSkeleton`/`CardSkeleton` directly |
| `config/subcategoryManagement.ts` | 12 | Status/bulk/view/sort config + pagination defaults |
| `Pagination` (common) | — | Generic, new — needed for this sprint's "Pagination" requirement |

`Pagination` and the new `sortByKey` helper (`array.helpers.ts`) are
generic, not subcategory-specific, so they're positioned for immediate
reuse — a future Products/Orders list, or even a Category pagination
upgrade, uses the exact same pieces.

## 2. Parent-child relationship

This is the one place Sprint 09 is **structurally simpler** than
Sprint 08, not just "the same pattern again." Compare the two Day 2
tables directly:

| | `categories` | `subcategories` |
|---|---|---|
| Self-reference | `parent_id uuid references categories(id)`, **nullable** | *(none)* |
| Cross-reference | *(none)* | `category_id uuid not null references categories(id)` |
| Nesting | Unlimited depth (adjacency list) | None — one fixed layer |
| Can be a root/top-level? | Yes (`parent_id IS NULL`) | No — `category_id` is `not null` |

A category's `parent_id` is **optional and self-referencing** (nesting);
a subcategory's `category_id` is **required and cross-referencing** (a
single fixed link, never nesting). This is why:

- `Subcategory` (`src/types/subcategory.types.ts`) has no `CategoryTreeNode`
  counterpart, and there is no `SubcategoryTreeView`. There's nothing to
  build a tree out of.
- `category_id: string` (not `string | null`) on `Subcategory` — a
  subcategory literally cannot exist without a category, so the type
  doesn't allow representing one that lacks one.
- `ParentCategorySelector`'s `allowAll` prop distinguishes its two call
  sites precisely along this line: `SubcategoryFormLayout` sets it
  `false` (a real category is mandatory), `SubcategoryFilters` sets it
  `true` (filtering by "any category" is meaningful, persisting a
  subcategory without one is not).

## 3. Category linkage strategy

Every subcategory component that displays or edits linkage needs the
*full* category list, not just the one subcategory's data — three
concrete places this shows up:

1. **Display:** `getSubcategoryCategoryName(subcategory, categories)`
   (`@/lib/helpers/subcategory.helpers`) resolves `category_id` to a
   display name for `SubcategoryTable`/`SubcategoryCard`. This is why
   `SubcategoryTableProps` and `SubcategoryManagementOverviewProps` both
   require `categories`, not just `subcategories` — the identical
   reasoning `CategoryTableProps.allCategories` (Sprint 08) already
   established for resolving a category's *own* parent name.
2. **Selection:** `ParentCategorySelector` needs every category (via
   `getCategoryOptionList`, new this sprint) to populate its dropdown,
   indented by depth so a nested category like "Fiction -> Fantasy" reads
   clearly against a top-level one — reusing `buildCategoryTree`
   (Sprint 08) rather than a second tree-walk.
3. **Filtering:** `SubcategoryFilters`' category dimension is
   `ParentCategorySelector` again (`allowAll`), so "filter by category"
   and "assign a category" are guaranteed to offer the identical option
   list/ordering — no risk of the two drifting apart because they're
   built from two different implementations.

**No cycle-prevention logic exists in `ParentCategorySelector` for
subcategories**, unlike the note in `CategoryFormLayout`'s parent picker
(which must exclude a category's own descendants to prevent a
self-referential loop). A subcategory can never become a category, so
there is no cycle to prevent — every category is always a valid choice.

## 4. Future CRUD integration

Nothing below is built today — the intended path once a future sprint
adds real data access:

1. **Fetching real data.** A future service (`BaseService<T>` contract,
   Day 3) queries both `subcategories` and `categories` — a subcategory
   screen always needs both, per §3 — and a future
   `app/admin/subcategories/page.tsx` (Server Component) passes both
   arrays straight into `<SubcategoryManagementOverview subcategories={...} categories={...} />`.
   No prop shape changes needed, since `Subcategory` already mirrors the
   table exactly.
2. **Loading state.** Pass `loading` from a future
   `useSubcategories()` hook — `SubcategoryTable`, the card grid branch,
   and `SubcategorySkeleton` already handle it.
3. **Wiring "Add Subcategory."** `SubcategoryToolbar`'s `onAddSubcategory`
   and `SubcategoryFormLayout` are ready: open the form in a modal/route,
   replace the no-op Save button with a real `createSubcategory()` call
   requiring a `category_id` (already enforced at the type level via
   `ParentCategorySelector`'s `allowAll={false}`), then re-fetch or
   optimistically update.
4. **Wiring Edit/Delete/Bulk Actions.** Identical pattern to Sprint 08's
   Category integration plan — `onEdit`/`onDelete` already receive the
   full `Subcategory`; `BulkActionBar`'s `onAction(actionId)` receives
   `SUBCATEGORY_BULK_ACTIONS`' ids against the already-tracked
   `selectedIds`.
5. **Sorting and pagination going server-side.** `sortByKey`/`paginate`
   are client-side, in-memory operations, fine for a moderate subcategory
   count. If a store grows large enough that fetching every subcategory
   client-side becomes impractical, a future sprint moves `sort`/`page`/
   `pageSize` state into query parameters and has the Supabase query
   apply `.order()`/`.range()` directly — `SubcategoryTable` and
   `Pagination` don't need to change; only where
   `SubcategoryManagementOverview` gets its `subcategories` array from
   does (a prop, either way).
6. **Permission enforcement.** `SUBCATEGORY_BULK_ACTIONS` already carries
   `permission: PERMISSIONS.MANAGE_CATEGORIES` (reused, not a new
   permission — see `config/subcategoryManagement.ts`'s doc comment for
   why no `MANAGE_SUBCATEGORIES` was added). Once a real
   `app/admin/layout.tsx` wraps admin routes in `<AuthProvider>` (Sprint 05),
   `SubcategoryToolbar`'s "Add Subcategory" and `BulkActionBar`'s actions
   can check `usePermission(PERMISSIONS.MANAGE_CATEGORIES)` before
   rendering/enabling — identical integration point to Sprint 08's.
7. **Route + guard.** Create `app/admin/subcategories/page.tsx`, extend
   `authConfig.adminRoutePrefixes` if not already covered by `"/admin"`,
   and add the `getServerAuthUser()`/`hasMinimumRole()` guard documented
   in `docs/AUTH_ARCHITECTURE.md` §7 — identical wiring to the Category
   and Dashboard routes' plans.

## 5. Files added this sprint

```
src/types/subcategory.types.ts                     # Subcategory entity type
src/lib/helpers/subcategory.helpers.ts              # search/filter/lookup pure functions
src/lib/helpers/index.ts                            # barrel — export added
src/lib/helpers/array.helpers.ts                    # extended — sortByKey added
src/lib/helpers/category.helpers.ts                 # extended — getCategoryOptionList added
src/types/common.types.ts                           # extended — SortDirection type added
src/lib/icons.tsx                                   # extended — chevron-up/grid icons
src/config/subcategoryManagement.ts                 # status/bulk/view/sort config
src/config/index.ts                                 # barrel — export added

src/components/common/Pagination.tsx                # new generic component
src/components/common/index.ts                      # barrel — export added

src/features/admin/types/subcategory-management.types.ts
src/features/admin/types/index.ts                   # barrel — export added

src/features/admin/components/subcategories/
├── SubcategoryManagementOverview.tsx
├── SubcategoryToolbar.tsx
├── SubcategoryFilters.tsx
├── SubcategoryTable.tsx
├── SubcategoryCard.tsx
├── SubcategoryFormLayout.tsx
├── ParentCategorySelector.tsx
├── SubcategoryEmptyState.tsx
├── SubcategorySkeleton.tsx
└── index.ts

src/features/admin/components/index.ts              # barrel — export added
src/features/admin/README.md                        # updated for Sprint 09
src/features/README.md                               # admin/ note updated
docs/SUBCATEGORY_MANAGEMENT.md                        # this file
```

**Why `common.types.ts`, `array.helpers.ts`, and `category.helpers.ts`
(all prior-sprint files) were touched:** each received exactly one new,
additive export (`SortDirection`, `sortByKey`, `getCategoryOptionList`)
directly required by this sprint's explicit "Sorting" requirement and by
`ParentCategorySelector`'s reuse of the existing tree-building logic.
Nothing already in any of these three files was changed or removed.

**Untouched:** everything else from Day 1–4 and Sprint 05–08, including
`src/config/auth.ts`, `src/middleware.ts`,
`src/constants/permissions.constants.ts` (no new permission added —
`MANAGE_CATEGORIES` reused), the Day 2 SQL migration,
`CategoryTable.tsx`/`CategoryTreeView.tsx`/`CategoryFormLayout.tsx` and
every other Sprint 08 category component, and every product-feature
folder.
