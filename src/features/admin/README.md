# `src/features/admin`

Admin Shell (Layout, Sprint 06) + Admin Dashboard Framework (Sprint 07) +
Category Management Framework (Sprint 08) + Subcategory Management
Framework (Sprint 09). The reusable chrome every future admin screen
renders inside, a config-driven dashboard widget system, and reusable,
config-driven category and subcategory table/card UI. No real data, CRUD,
tables (as in Supabase tables), APIs, or business logic live here; this is
layout/framework architecture only.

## Structure

```
admin/
├── components/
│   ├── layout/
│   │   ├── AdminShell.tsx        # Composition root: sidebar + header + drawer + content
│   │   ├── AdminSidebar.tsx      # Desktop/tablet collapsible sidebar
│   │   ├── AdminHeader.tsx       # Top bar: mobile toggle, breadcrumb slot, bell, profile
│   │   ├── MobileNavDrawer.tsx   # Off-canvas nav for < lg viewports
│   │   └── SidebarNavItem.tsx    # Shared nav row, used by both sidebar and drawer
│   ├── skeletons/
│   │   ├── TableSkeleton.tsx
│   │   ├── CardSkeleton.tsx
│   │   └── ListSkeleton.tsx
│   ├── dashboard/                 # Sprint 07
│   │   ├── DashboardOverview.tsx  # Composed dashboard page architecture
│   │   ├── WelcomeBanner.tsx
│   │   ├── StatCard.tsx / StatCardGrid.tsx
│   │   ├── QuickActions.tsx       # UI only — no business logic
│   │   ├── RecentActivity.tsx     # Placeholder only
│   │   ├── SystemStatus.tsx
│   │   ├── DashboardSkeleton.tsx  # Composed from Sprint 06's skeletons
│   │   └── DashboardEmptyState.tsx
│   ├── categories/                 # Sprint 08
│   │   ├── CategoryManagementOverview.tsx  # Composed category page architecture
│   │   ├── CategoryToolbar.tsx     # Search + filters + view switch + Add button
│   │   ├── CategoryFilters.tsx
│   │   ├── CategoryTable.tsx       # Flat view, with Parent Category column
│   │   ├── CategoryTreeView.tsx    # Nested, expand/collapse, unlimited depth
│   │   ├── CategoryTreeRow.tsx     # Recursive row renderer used by CategoryTreeView
│   │   ├── CategoryCard.tsx        # Card presentation of a single category
│   │   ├── CategoryFormLayout.tsx  # Add/Edit form layout — UI only
│   │   ├── CategoryEmptyState.tsx
│   │   └── CategorySkeleton.tsx    # Reuses Sprint 06's TableSkeleton for table view
│   ├── subcategories/               # Sprint 09
│   │   ├── SubcategoryManagementOverview.tsx  # Composed subcategory page architecture
│   │   ├── SubcategoryToolbar.tsx  # Search + filters + view switch + Add button
│   │   ├── SubcategoryFilters.tsx  # Status + Category filters
│   │   ├── SubcategoryTable.tsx    # Sortable columns, Category column
│   │   ├── SubcategoryCard.tsx     # Card presentation of a single subcategory
│   │   ├── SubcategoryFormLayout.tsx  # Add/Edit form layout — UI only
│   │   ├── ParentCategorySelector.tsx  # Indented category picker, reused 3 places
│   │   ├── SubcategoryEmptyState.tsx
│   │   └── SubcategorySkeleton.tsx  # Reuses Sprint 06/07's Table/CardSkeleton
│   ├── UserProfileDropdown.tsx   # UI only — no auth action wired up
│   └── NotificationBell.tsx      # Placeholder — no real notifications
├── hooks/
│   └── useSidebarState.ts        # Desktop collapse + mobile drawer open/close
└── types/
    ├── admin-layout.types.ts
    ├── dashboard.types.ts                 # Sprint 07 — component prop contracts
    ├── category-management.types.ts       # Sprint 08 — component prop contracts
    └── subcategory-management.types.ts    # Sprint 09 — component prop contracts
```

Generic pieces promoted to `src/components/common/` (not admin-only, same
reasoning as `PageContainer`): `SectionTitle`, `WidgetContainer` (Sprint 07),
`StatusBadge`, `SearchBar`, `BulkActionBar` (Sprint 08), and `Pagination`
(Sprint 09). Four small shadcn-style primitives were added to
`src/components/ui/` in Sprint 08 — `Badge`, `Input`, `Label`, `Textarea`,
`Select` — following Day 1's `button.tsx` pattern (hand-written, no new
dependency); Sprint 09 introduces no new UI primitive, reusing all five.

The shared `Category`/`CategoryTreeNode` (Sprint 08) and `Subcategory`
(Sprint 09) entity types live in `src/types/` (top-level, not admin-only —
mirrors `NavigationItemRecord`'s placement from Day 4), and the pure
tree/filter/search helpers built on them live in
`src/lib/helpers/category.helpers.ts` and `subcategory.helpers.ts`.
Widget *data* (bulk actions, status filter options, view options, sort
options) lives in `src/config/categoryManagement.ts` and
`subcategoryManagement.ts`, matching the `config/dashboard.ts` pattern.

## How a future admin page uses this

```tsx
import { AdminShell } from "@/features/admin/components/layout";
import { DashboardOverview } from "@/features/admin/components/dashboard";

export default function AdminDashboardPage() {
  return (
    <AdminShell>
      <DashboardOverview />
    </AdminShell>
  );
}
```

```tsx
// Any other future admin page (Books, Orders, ...) still composes this way:
import { AdminShell } from "@/features/admin/components/layout";
import { Breadcrumb, PageContainer } from "@/components/common";

export default function AdminBooksPage() {
  return (
    <AdminShell
      breadcrumb={
        <Breadcrumb items={[{ label: "Dashboard", href: "/admin" }, { label: "Books" }]} />
      }
    >
      <PageContainer title="Books" description="Manage your catalog.">
        {/* a future Books table/CRUD goes here — not built this sprint */}
      </PageContainer>
    </AdminShell>
  );
}
```

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

```tsx
// Any other future admin page (Books, Orders, ...) still composes this way:
import { AdminShell } from "@/features/admin/components/layout";
import { Breadcrumb, PageContainer } from "@/components/common";

export default function AdminBooksPage() {
  return (
    <AdminShell
      breadcrumb={
        <Breadcrumb items={[{ label: "Dashboard", href: "/admin" }, { label: "Books" }]} />
      }
    >
      <PageContainer title="Books" description="Manage your catalog.">
        {/* a future Books table/CRUD goes here — not built this sprint */}
      </PageContainer>
    </AdminShell>
  );
}
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

Nothing above is created this sprint — no `app/admin/*` route exists yet.
This is the intended usage once that route is built.

## What's intentionally not here

- No `app/admin/layout.tsx` or any route — that wiring is a future
  sprint's job once real admin pages exist.
- No `<AuthProvider>`/session check inside `AdminShell`,
  `DashboardOverview`, `CategoryManagementOverview`, or
  `SubcategoryManagementOverview` — access control belongs to Sprint 05's
  middleware and page-level `session.service.ts` checks (see
  `docs/AUTH_ARCHITECTURE.md`), not layout/framework components. A future
  sprint wraps the future `app/admin/layout.tsx` in `<AuthProvider>` and
  adds the server-side guard.
- No real notification data, no real signed-in user, no real table data,
  no real stats, no real activity feed, no real system health check, no
  real category/subcategory data, no CRUD, no API, no database query —
  see each component's own doc comment for exactly what's a placeholder
  and why.
- Category Tree View's search/filter applies only to Table view (Sprint 08);
  Subcategory Table and Card views share identical filtering, since
  subcategories have no tree-orphaning concern to work around.

See `docs/ADMIN_LAYOUT.md` (Sprint 06), `docs/DASHBOARD_FRAMEWORK.md`
(Sprint 07), `docs/CATEGORY_MANAGEMENT.md` (Sprint 08), and
`docs/SUBCATEGORY_MANAGEMENT.md` (Sprint 09) for the full explanation of
every component.
