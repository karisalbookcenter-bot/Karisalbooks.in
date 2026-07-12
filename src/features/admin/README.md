# `src/features/admin`

Admin Shell (Layout, Sprint 06) + Admin Dashboard Framework (Sprint 07).
The reusable chrome (sidebar, header, mobile navigation) every future
admin screen renders inside, plus a reusable, config-driven dashboard
widget system. No real dashboard data, CRUD, tables, charts, or business
logic live here; this is layout/framework architecture only.

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
│   ├── UserProfileDropdown.tsx   # UI only — no auth action wired up
│   └── NotificationBell.tsx      # Placeholder — no real notifications
├── hooks/
│   └── useSidebarState.ts        # Desktop collapse + mobile drawer open/close
└── types/
    ├── admin-layout.types.ts
    └── dashboard.types.ts         # Sprint 07 — component prop contracts
```

Two more generic pieces the dashboard framework relies on were promoted to
`src/components/common/` (not admin-only, same reasoning as `PageContainer`):
`SectionTitle` and `WidgetContainer`. Dashboard *data* (stat card
definitions, quick action definitions, system status rows) lives in
`src/config/dashboard.ts`, matching the `config/adminNavigation.ts` pattern.

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

Nothing above is created this sprint — no `app/admin/*` route exists yet.
This is the intended usage once that route is built.

## What's intentionally not here

- No `app/admin/layout.tsx` or any route — that wiring is a future
  sprint's job once real admin pages exist.
- No `<AuthProvider>`/session check inside `AdminShell` or
  `DashboardOverview` — access control belongs to Sprint 05's middleware
  and page-level `session.service.ts` checks (see
  `docs/AUTH_ARCHITECTURE.md`), not layout/framework components. A future
  sprint wraps the future `app/admin/layout.tsx` in `<AuthProvider>` and
  adds the server-side guard.
- No real notification data, no real signed-in user, no real table data,
  no real stats, no real activity feed, no real system health check — see
  each component's own doc comment for exactly what's a placeholder and
  why.

See `docs/ADMIN_LAYOUT.md` (Sprint 06) and `docs/DASHBOARD_FRAMEWORK.md`
(Sprint 07) for the full explanation of every component.
