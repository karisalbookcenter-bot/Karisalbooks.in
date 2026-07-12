# `src/features/admin`

Admin Shell (Layout) — Sprint 06. The reusable chrome (sidebar, header,
mobile navigation, and supporting UI primitives) every future admin
screen — Books, Categories, Orders, Reports, and so on — will render
inside. No real dashboard, CRUD, tables, charts, or business logic live
here; this is layout architecture only.

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
│   ├── UserProfileDropdown.tsx   # UI only — no auth action wired up
│   └── NotificationBell.tsx      # Placeholder — no real notifications
├── hooks/
│   └── useSidebarState.ts        # Desktop collapse + mobile drawer open/close
└── types/
    └── admin-layout.types.ts
```

## How a future admin page uses this

```tsx
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
- No `<AuthProvider>`/session check inside `AdminShell` — access control
  belongs to Sprint 05's middleware and page-level `session.service.ts`
  checks (see `docs/AUTH_ARCHITECTURE.md`), not the layout component
  itself. A future sprint wraps the future `app/admin/layout.tsx` in
  `<AuthProvider>` and adds the server-side guard.
- No real notification data, no real signed-in user, no real table data —
  see the doc comments in `NotificationBell.tsx` and
  `UserProfileDropdown.tsx` for exactly what's a placeholder and why.

See `docs/ADMIN_LAYOUT.md` for the full explanation of every component.
