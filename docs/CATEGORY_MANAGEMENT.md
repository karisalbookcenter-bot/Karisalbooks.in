# KarisalBooks.in — Category Management Framework

**Milestone:** Sprint 08 — Category Management Framework
**Builds on:** Day 2 (`categories` SQL table), Day 3 (`BaseEntity`, Day 3
folder conventions), Day 4 (adjacency-list tree pattern, icon-key
convention), Sprint 05 (`MANAGE_CATEGORIES` permission), Sprint 06
(`AdminShell`, `PageContainer`, `Skeleton`/`TableSkeleton`, icon registry),
Sprint 07 (`WidgetContainer`/`SectionTitle`, config-driven widget pattern,
`DashboardOverview`'s page-architecture shape)
**Explicitly out of scope today:** database queries, CRUD logic, API
routes, Supabase integration, authentication pages, Products, Orders,
Customers. Every component here operates on data passed in as props —
nothing fetches, persists, or calls Supabase.

---

## 1. Category architecture

Like Sprint 07's dashboard, this is a **composition of small, independently
reusable widgets**, not one large page component. The entry point,
`CategoryManagementOverview`
(`src/features/admin/components/categories/CategoryManagementOverview.tsx`),
is the "page architecture" task 1 asked for, and — following the exact
precedent `DashboardOverview` set — contains almost no markup of its own:
it owns four pieces of UI state (search text, status filter, table/tree
view mode, bulk selection) and arranges widgets around them inside
Sprint 06's `PageContainer`.

```
CategoryManagementOverview
└── PageContainer (title="Categories")
    ├── CategoryToolbar          (search + filters + view switch + Add button)
    ├── BulkActionBar            (shown only once count > 0)
    └── CategoryTable  ⇄  CategoryTreeView     (whichever `view` is active)
```

No `app/admin/*` route renders this yet. The intended future usage,
mirroring `features/admin/README.md`'s existing dashboard example:

```tsx
// A future app/admin/categories/page.tsx
import { AdminShell } from "@/features/admin/components/layout";
import { CategoryManagementOverview } from "@/features/admin/components/categories";

export default function AdminCategoriesPage() {
  return (
    <AdminShell>
      <CategoryManagementOverview categories={realCategories} />
    </AdminShell>
  );
}
```

### Where each type lives, and why

- **`src/types/category.types.ts`** (top-level, not inside
  `features/admin/`) defines `Category` and `CategoryTreeNode`. Promoted
  to the shared layer for the same reason Day 4's `NavigationItemRecord`
  is top-level: a category is a core domain entity a future *public*
  catalog feature will also need (browsing books by category), not an
  admin-only concept — per the Day 3 rule, "used by two or more features →
  shared top-level."
- **`src/config/categoryManagement.ts`** owns config *data*: status filter
  options, bulk action definitions, view-switcher options — the same
  "data lives in config" philosophy as `config/dashboard.ts`.
- **`src/features/admin/types/category-management.types.ts`** owns
  *component* prop contracts (`CategoryTableProps`, `CategoryTreeViewProps`,
  etc.) built on top of both — the same three-way layering Sprint 07
  established (entity/data types → config → component prop types).

### Component-by-component summary

| Component | Task | What it is |
|---|---|---|
| `CategoryManagementOverview` | 1 | Composed page architecture |
| `CategoryTable` | 2 | Flat rows, Parent Category column, status badges |
| `CategoryTreeView` (+ `CategoryTreeRow`) | 3 | Nested, expand/collapse, unlimited depth |
| `CategoryCard` | 4 | Single-category card, alternate to a table row |
| `CategoryFormLayout` | 5 | Add/Edit form layout — UI only, no submit |
| `CategoryFilters` | 6 | Status filter dropdown |
| `SearchBar` (common) | 7 | Generic search input, reused beyond categories |
| `CategoryToolbar` | 8 | Combines search + filters + view switch + Add button |
| `BulkActionBar` (common) | 9 | UI-only bulk action row |
| `CategoryEmptyState` | 10 | "No categories yet" / "No results" variants |
| `CategorySkeleton` | 11 | Table (reuses `TableSkeleton`) / tree loading states |
| `config/categoryManagement.ts` | 12 | Status filter / bulk action / view-mode data |

Two components (`SearchBar`, `BulkActionBar`) were promoted to
`components/common/` rather than kept category-specific, for the same
reason `PageContainer`/`WidgetContainer` were promoted: neither has any
category-specific logic, and every future selectable/searchable admin
list (Products, Orders, Authors, Publishers) will want the exact same
pieces. `StatusBadge` was promoted likewise, mapping the shared
`RecordStatus` type to a colored badge for any `BaseEntity`-derived table,
not just categories.

## 2. Tree structure

`Category` mirrors the Day 2 `categories` table column-for-column
(`id`, `parent_id`, `name`, `slug`, `description`, `status`, `created_at`,
`updated_at`), including the self-referencing `parent_id` — the same
adjacency-list model Day 4 used for `NavigationItemRecord.parent`. This is
what makes "unlimited nested categories" possible: nothing in the schema
or the type limits depth.

`buildCategoryTree` (`src/lib/helpers/category.helpers.ts`) assembles a
flat `Category[]` into `CategoryTreeNode[]` — grouping by `parent_id`,
recursing to unlimited depth, sorting alphabetically by `name` at each
level, and computing `depth` (root = 0) along the way so `CategoryTreeRow`
never has to recalculate indentation itself.

**Why not just reuse `buildNavigationTree` from Day 4?** It's typed
specifically to `NavigationItemRecord`, which has `order`/`visible`/
`title` fields a `Category` row doesn't have (categories sort by `name`
and have no visibility flag, only `status`). Bolting fields a category
doesn't have onto it just to satisfy an existing typed function's
signature would be worse than writing a small, correctly-typed sibling
function — so `buildCategoryTree` reimplements the same *algorithm*
(recursive adjacency-list grouping) against the *right* shape. This is
the one deliberate exception to "reuse everything," and it's a narrow,
well-justified one: the pattern is reused, the exact function isn't.

`flattenCategoryTree` is the inverse (tree → flat list, dropping the
computed `children`/`depth` fields) — useful for a future form/table
editor that needs to round-trip a tree back into rows to persist.
`countDescendants` walks a node's subtree to produce the small
"N subcategories" badge shown in `CategoryTreeRow` and available to
`CategoryCard` via its `childCount` prop.

## 3. Expandable hierarchy strategy

`CategoryTreeView` renders `CategoryTreeNode[]` with per-node expand/
collapse, managed via `useState<Set<string>>` (`expandedIds`) *inside*
`CategoryTreeView` itself — deliberately uncontrolled, unlike, say,
`AdminSidebar`'s collapse state (owned externally by `AdminShell` via
`useSidebarState`). The difference: a sidebar has exactly one collapse
state a parent legitimately needs to coordinate with other UI (the
header's toggle button); a category tree has an arbitrarily large,
growing *set* of independently-expandable node ids that no parent
component has a real reason to own or persist across renders. Seeding
`expandedIds` from an optional `defaultExpandedIds` prop covers the one
case a caller might care about (e.g. expand the first level by default).

Accessibility follows the standard ARIA tree pattern: `role="tree"` on
the root list, `role="treeitem"` + `aria-expanded` + `aria-level` on each
row (`CategoryTreeRow`), `role="group"` on a node's children list. **Not
implemented:** a full roving-tabindex keyboard scheme (arrow keys moving
focus between visible nodes) — noted here as a deliberate, scoped gap,
the same kind of follow-up Sprint 06 flagged for `MobileNavDrawer`'s
missing focus trap, rather than silently shipped as "done."

### Why Table view is searched/filtered but Tree view isn't (yet)

`CategoryManagementOverview` applies `searchCategories`/
`filterCategoriesByStatus` before handing rows to `CategoryTable`, but
always builds `CategoryTreeView`'s tree from the *complete, unfiltered*
`categories` array. This is deliberate, not an oversight:

Naively filtering a flat list *before* building a tree can orphan a
category that matches the search/filter but whose *parent* doesn't — the
matching child's `parent_id` would point to an id no longer present in
the filtered array, so `buildCategoryTree` would neither place it as a
root (its `parent_id` isn't `null`) nor find it while recursing into its
(missing) parent. The node would silently vanish from the tree entirely,
which is worse than not filtering at all.

Correctly filtering a tree means "keep every match, plus every ancestor
of every match, so the path to each result stays visible" — genuine
business logic (a graph-search problem), which this sprint's "UI
architecture only, no business logic" boundary excludes. Rather than ship
an incorrect version, Table view (where filtering a flat list has no such
edge case) gets the real filtering, and Tree view's search/filter gap is
documented here as the specific, scoped follow-up:

**Future follow-up:** implement `filterCategoryTreePreservingAncestors(tree, predicate)`
in `category.helpers.ts` — walk the tree once, keep a node if it matches
`predicate` OR any descendant matches, and pass the *result* to
`CategoryTreeView` instead of the unfiltered tree. `CategoryTreeView`
itself needs no change; only `CategoryManagementOverview`'s data
preparation does.

## 4. Future CRUD integration

Nothing below is built today — this is the intended integration path once
a future sprint adds real data access:

1. **Fetching real categories.** A future service (following the
   `BaseService<T>` contract from Day 3, likely `CategoriesService`
   living in a new `src/features/categories/services/` or reusing this
   admin folder) queries Supabase's `categories` table and returns
   `Category[]`. A future `app/admin/categories/page.tsx` (a Server
   Component) awaits that call and passes the result straight into
   `<CategoryManagementOverview categories={data} />` — no prop shape
   changes needed, since `Category` already mirrors the table exactly.
2. **Loading state.** Pass `loading` down from a client-side fetch
   (e.g. via a future `useCategories()` hook) — `CategoryTable`,
   `CategoryTreeView`, and `CategorySkeleton` already handle it.
3. **Wiring "Add Category."** `CategoryToolbar`'s `onAddCategory` and
   `CategoryFormLayout` are ready: a future sprint opens
   `CategoryFormLayout` in a modal/route, replaces its Save button's
   no-op with a real submit calling a new `createCategory()` service
   method, and on success re-fetches (or optimistically updates) the
   `categories` array passed to `CategoryManagementOverview`.
4. **Wiring Edit/Delete.** `CategoryTable`'s `onEdit`/`onDelete` and
   `CategoryTreeView`'s equivalents already receive the full `Category`/
   `CategoryTreeNode` for the clicked row — a future sprint passes real
   handlers (open `CategoryFormLayout` pre-filled via `defaultValues`;
   call a `deleteCategory()` service method) instead of leaving them
   `undefined`.
5. **Wiring Bulk Actions.** `BulkActionBar`'s `onAction(actionId)` receives
   `CATEGORY_BULK_ACTIONS`' ids (`"activate"`, `"deactivate"`, `"archive"`,
   `"delete"`) — a future sprint switches on `actionId` and calls the
   matching bulk-update/bulk-delete service method against
   `selectedIds`, using the exact selection state
   `CategoryManagementOverview` already tracks.
6. **Preventing a self-referential parent.** `CategoryFormLayout`'s
   `parentOptions` prop is a plain `Category[]` — the caller is
   responsible for excluding the category being edited *and* all of its
   own descendants (using `buildCategoryTree` + a subtree walk) before
   passing the list in, so a category can never become its own ancestor.
   This validation doesn't exist yet; it's a future CRUD sprint's job,
   flagged here rather than silently assumed.
7. **Permission enforcement.** `CATEGORY_BULK_ACTIONS` entries and the
   config already carry a `permission: PERMISSIONS.MANAGE_CATEGORIES`
   field (reusing Sprint 05's permission constants), but no component
   calls `usePermission()` yet — the same reasoning Sprint 07 documented
   for the dashboard: no page currently wraps this framework in
   `<AuthProvider>`, and calling that hook without a provider throws. Once
   a real `app/admin/layout.tsx` wraps admin routes in `<AuthProvider>`,
   `CategoryToolbar`'s "Add Category" button and `BulkActionBar`'s actions
   can each check `usePermission(PERMISSIONS.MANAGE_CATEGORIES)` before
   rendering/enabling.
8. **Route + guard.** Create `app/admin/categories/page.tsx`, add
   `ROUTES.ADMIN_CATEGORIES` (already defined, Sprint 06) to
   `authConfig.adminRoutePrefixes` if not already covered by `"/admin"`,
   and add the `getServerAuthUser()`/`hasMinimumRole()` guard documented
   in `docs/AUTH_ARCHITECTURE.md` §7 — identical to the wiring
   `docs/DASHBOARD_FRAMEWORK.md` describes for the dashboard route.

## 5. Files added this sprint

```
src/types/category.types.ts                       # Category, CategoryTreeNode
src/lib/helpers/category.helpers.ts                # tree/search/filter pure functions
src/lib/helpers/index.ts                           # barrel — export added
src/lib/icons.tsx                                  # extended — table/filter/loader/search icons
src/config/categoryManagement.ts                   # status filters / bulk actions / view options
src/config/index.ts                                # barrel — export added

src/components/ui/badge.tsx
src/components/ui/input.tsx
src/components/ui/label.tsx
src/components/ui/textarea.tsx
src/components/ui/select.tsx

src/components/common/StatusBadge.tsx
src/components/common/SearchBar.tsx
src/components/common/BulkActionBar.tsx
src/components/common/index.ts                     # barrel — 3 exports added

src/features/admin/types/category-management.types.ts
src/features/admin/types/index.ts                  # barrel — export added

src/features/admin/components/categories/
├── CategoryManagementOverview.tsx
├── CategoryToolbar.tsx
├── CategoryFilters.tsx
├── CategoryTable.tsx
├── CategoryTreeView.tsx
├── CategoryTreeRow.tsx
├── CategoryCard.tsx
├── CategoryFormLayout.tsx
├── CategoryEmptyState.tsx
├── CategorySkeleton.tsx
└── index.ts

src/features/admin/components/index.ts             # barrel — export added
src/features/admin/README.md                       # updated for Sprint 08
src/features/README.md                              # admin/ note updated
docs/CATEGORY_MANAGEMENT.md                          # this file
```

**Untouched:** everything from Day 1–4 and Sprint 05–07 not listed above,
including `src/config/auth.ts`, `src/middleware.ts`,
`src/constants/permissions.constants.ts` (no new permissions added —
`MANAGE_CATEGORIES` already existed), the Day 2 SQL migration, and every
product-feature folder (`books`, `competitive-exams`, etc.).
