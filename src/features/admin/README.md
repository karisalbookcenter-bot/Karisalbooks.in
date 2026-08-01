# `src/features/admin`

Admin Shell (Layout, Sprint 06) + Admin Dashboard Framework (Sprint 07) +
Category Management Framework (Sprint 08) + Subcategory Management
Framework (Sprint 09) + Author & Publisher Management UI (Sprint 11) +
Customer Management Framework (Sprint 12). The reusable chrome every
future admin screen renders inside, a config-driven dashboard widget
system, and reusable, config-driven table/card UI for five entities. No
business logic beyond what Sprint 10/11's real backend (see
`features/books/`, `features/authors/`, `features/publishers/`) supplies
via props — `Customer` (Sprint 12) is pure UI architecture, like
Category/Subcategory were before their own backend existed.

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
│   ├── authors/                      # Sprint 11 — mirrors categories/'s flat shape
│   │   ├── AuthorManagementOverview.tsx
│   │   ├── AuthorToolbar.tsx / AuthorFilters.tsx
│   │   ├── AuthorTable.tsx           # Optional "Books" column (Book ↔ Author relationship)
│   │   ├── AuthorCard.tsx            # Shows photo_url or a placeholder icon
│   │   ├── AuthorFormLayout.tsx      # Wired to real useAuthorForm submission
│   │   ├── AuthorEmptyState.tsx / AuthorSkeleton.tsx
│   ├── publishers/                   # Sprint 11 — mirrors authors/ exactly
│   │   └── (same set: PublisherManagementOverview, PublisherToolbar, ...)
│   ├── customers/                     # Sprint 12 — UI architecture only
│   │   ├── CustomerManagementOverview.tsx
│   │   ├── CustomerToolbar.tsx / CustomerFilters.tsx  # No "Add Customer" — no CRUD this sprint
│   │   ├── CustomerTable.tsx           # Contact column, "View details" action
│   │   ├── CustomerCard.tsx
│   │   ├── CustomerDetailsPanel.tsx    # NEW pattern: right-anchored slide-over, UI only
│   │   ├── CustomerEmptyState.tsx / CustomerSkeleton.tsx
│   ├── UserProfileDropdown.tsx   # UI only — no auth action wired up
│   └── NotificationBell.tsx      # Placeholder — no real notifications
├── hooks/
│   └── useSidebarState.ts        # Desktop collapse + mobile drawer open/close
└── types/
    ├── admin-layout.types.ts
    ├── dashboard.types.ts                 # Sprint 07 — component prop contracts
    ├── category-management.types.ts       # Sprint 08 — component prop contracts
    ├── subcategory-management.types.ts    # Sprint 09 — component prop contracts
    ├── author-management.types.ts         # Sprint 11 — component prop contracts
    ├── publisher-management.types.ts      # Sprint 11 — component prop contracts
    └── customer-management.types.ts       # Sprint 12 — component prop contracts
```

Generic pieces promoted to `src/components/common/` (not admin-only, same
reasoning as `PageContainer`): `SectionTitle`, `WidgetContainer` (Sprint 07),
`StatusBadge`, `SearchBar`, `BulkActionBar` (Sprint 08), `Pagination`
(Sprint 09), and `SlideOverPanel` (Sprint 12) — a new, right-anchored
off-canvas panel shell (distinct from `MobileNavDrawer`'s left-anchored
navigation drawer), whose first consumer is `CustomerDetailsPanel` but
which any future "view one record's details without leaving the list"
flow can reuse. Five small shadcn-style primitives live in
`src/components/ui/` (added Sprint 08) — `Badge`, `Input`, `Label`,
`Textarea`, `Select` — following Day 1's `button.tsx` pattern; Sprint 12
introduces no new UI primitive, reusing all five again.

The shared `Category`/`CategoryTreeNode` (Sprint 08), `Subcategory`
(Sprint 09), `Book` (Sprint 10), `Author`/`Publisher` (Sprint 11), and
`Customer` (Sprint 12) entity types all live in `src/types/` (top-level,
not admin-only — mirrors `NavigationItemRecord`'s placement from Day 4).
Sprint 11's `Author`/`Publisher` repositories are built on two new
generic factories (`src/services/createSupabaseRepository.ts`,
`createEntityService.ts`) rather than hand-writing CRUD/search/pagination
logic a third time — see `docs/AUTHOR_PUBLISHER_MANAGEMENT.md` for why.
`Customer` has no repository at all this sprint — see
`docs/CUSTOMER_MANAGEMENT.md`. Widget *data* (bulk actions, status filter
options, view options, sort options) lives in
`src/config/categoryManagement.ts`, `subcategoryManagement.ts`,
`authorManagement.ts`, `publisherManagement.ts`, and
`customerManagement.ts`, matching the `config/dashboard.ts` pattern.

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
        {/* a future Books table/CRUD UI goes here — Sprint 10 built the
            backend (book.service.ts), not the admin table/form UI itself */}
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

```tsx
// A future app/admin/authors/page.tsx (Sprint 11 — real backend, no route yet)
import { AdminShell } from "@/features/admin/components/layout";
import { AuthorManagementOverview } from "@/features/admin/components/authors";
import { authorService } from "@/features/authors/services/author.service";
import { getBookCountForAuthor } from "@/features/authors/services/author.repository";

export default async function AdminAuthorsPage() {
  const { data } = await authorService.list({ pageSize: 100 });
  const authors = data?.items ?? [];
  const bookCounts = Object.fromEntries(
    await Promise.all(authors.map(async (a) => [a.id, await getBookCountForAuthor(a.id)] as const))
  );

  return (
    <AdminShell>
      <AuthorManagementOverview authors={authors} bookCounts={bookCounts} />
    </AdminShell>
  );
}
```

`app/admin/publishers/page.tsx` follows identically, using
`publisherService`/`getBookCountForPublisher` and
`PublisherManagementOverview`.

```tsx
// A future app/admin/customers/page.tsx (Sprint 12 — UI architecture
// only; a future backend sprint would supply `customers` the same way
// Sprint 10/11 did for Book/Author/Publisher)
import { AdminShell } from "@/features/admin/components/layout";
import { CustomerManagementOverview } from "@/features/admin/components/customers";

export default function AdminCustomersPage() {
  return (
    <AdminShell>
      <CustomerManagementOverview customers={realCustomers} />
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
  `DashboardOverview`, `CategoryManagementOverview`,
  `SubcategoryManagementOverview`, `AuthorManagementOverview`,
  `PublisherManagementOverview`, or `CustomerManagementOverview` — access
  control belongs to Sprint 05's middleware and page-level
  `session.service.ts` checks (see `docs/AUTH_ARCHITECTURE.md`), not
  layout/framework components. A future sprint wraps the future
  `app/admin/layout.tsx` in `<AuthProvider>` and adds the server-side
  guard.
- No real notification data, no real signed-in user — see each
  component's own doc comment for exactly what's a placeholder and why.
  Author/Publisher data *is* real this sprint (Sprint 11 built the actual
  Supabase-backed service layer) — only the routing/auth wiring to serve
  it through a real page is what's missing. `Customer` data is *not*
  real yet — this sprint is pure UI architecture, the same stage
  Category/Subcategory were at before their own backend existed.
- Category Tree View's search/filter applies only to Table view (Sprint 08);
  Subcategory/Author/Publisher/Customer Table and Card views share
  identical filtering, since none of those have a tree-orphaning concern
  to work around.
- `CustomerDetailsPanel` has no edit form and no wired actions — it is a
  strictly read-only view, per Sprint 12's "No CRUD implementation" scope.

See `docs/ADMIN_LAYOUT.md` (Sprint 06), `docs/DASHBOARD_FRAMEWORK.md`
(Sprint 07), `docs/CATEGORY_MANAGEMENT.md` (Sprint 08),
`docs/SUBCATEGORY_MANAGEMENT.md` (Sprint 09),
`docs/BOOK_CRUD_FOUNDATION.md` (Sprint 10),
`docs/AUTHOR_PUBLISHER_MANAGEMENT.md` (Sprint 11), and
`docs/CUSTOMER_MANAGEMENT.md` (Sprint 12) for the full explanation of
every component.
