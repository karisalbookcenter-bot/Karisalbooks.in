# KarisalBooks.in — Admin Shell (Layout)

**Milestone:** Sprint 06 — Admin Shell (Layout)
**Builds on:** Day 1 (Tailwind/shadcn conventions, Supabase clients),
Day 3 (`createSafeContext`, layout primitives), Day 4 (navigation
architecture, menu helpers, icon-key convention), Sprint 05 (auth
architecture — referenced, not modified)
**Explicitly out of scope today:** login page, real dashboard widgets,
Categories/Products/Orders/Customers CRUD, payment, API routes, database
tables, business logic, and any actual `app/admin/*` route. Every
component below is a reusable building block — nothing is wired into a
page yet.

---

## 1. Why this shape

The brief asked for reusable, config-driven, accessible, responsive,
dark-mode-ready layout architecture — not a page. So this sprint produces
a component library under `src/features/admin/` (plus a couple of
genuinely generic pieces promoted to `src/components/common/`), with nothing
rendered by any route. Three principles guided every decision below:

- **Reuse, don't reinvent, Day 4's navigation architecture.** The admin
  sidebar menu is a `NavigationItemRecord[]` (Day 4's exact model — id,
  title, slug, icon, order, visible, parent), processed with Day 4's own
  `getVisibleItems`/`sortByOrder` helpers. A future admin nav editor could
  manage this list with the same tooling planned for the public menu.
- **State lives at the top, components stay presentational.** Only two
  components hold any state of their own (`AdminShell`, via
  `useSidebarState`; and the two small self-contained widgets
  `NotificationBell`/`UserProfileDropdown`, which own their own open/closed
  state since nothing else needs to know it). Everything else — sidebar,
  header, drawer, nav rows — takes props and renders, which is what makes
  them "fully reusable" rather than each hardwiring its own behavior.
- **No new runtime dependency.** Following Day 1's `components/ui/button.tsx`
  precedent (hand-written with `cva`, not a wrapped Radix primitive), the
  mobile drawer and both dropdown-style widgets are built with plain React
  state + Tailwind, not a `Sheet`/`DropdownMenu` library component.

## 2. Centralized icons (Task: "icons should be centralized")

**`src/lib/icons.tsx`** — a single `ICONS` map from string key (e.g.
`"book-open"`, `"dashboard"`) to a `lucide-react` component, plus
`getIcon(name)` which falls back to a neutral `circle` icon for an
unknown/`null` key instead of throwing. This is the file that finally
*consumes* the `icon: string | null` field Day 4's `NavigationItemRecord`
defined back in the CMS foundation sprint — until now nothing rendered it.
Every icon anywhere in the admin shell (and, if adopted later, the public
nav) resolves through this one file, so swapping icon libraries later is a
one-file change.

## 3. Admin Sidebar Navigation configuration (Task 5)

**`src/config/adminNavigation.ts`** — `ADMIN_NAVIGATION_ITEMS`, all 15
required entries (Dashboard, Books, Categories, Authors, Publishers,
Competitive Exams, Publication Services, Orders, Customers, Coupons, Offer
Zone, Pre Booking, Shipping, Reports, Settings), each a `NavigationItemRecord`
with a stable `id`, `title`, a `slug` drawn from newly added `ROUTES.ADMIN_*`
constants (`src/constants/routes.constants.ts`), an `icon` key resolved via
`getIcon`, an `order`, `visible: true`, and `parent: null` (all top-level
today — nothing stops a future item from gaining children, since the
model supports unlimited nesting, exactly like Day 4's public menu).

No `/admin/*` route actually exists at any of these paths yet — that's
future work. This file only centralizes where the sidebar *would* link.

## 4. Components created

### `AdminShell` (Task 1 — reusable Admin Layout architecture)
`src/features/admin/components/layout/AdminShell.tsx`. The composition
root: owns `useSidebarState()` and passes the resulting state down as
props to `AdminSidebar`, `MobileNavDrawer`, and `AdminHeader`, then renders
`children` in a `<main>` region. This is the one component a future admin
page actually imports and wraps its content in.

### `AdminSidebar` (Tasks 2, 6 — Sidebar, Collapsible)
`src/features/admin/components/layout/AdminSidebar.tsx`. Desktop/tablet
persistent nav rail (`hidden lg:flex` — invisible below the `lg`
breakpoint, where `MobileNavDrawer` takes over instead). Renders
`ADMIN_NAVIGATION_ITEMS` by default (overridable via an `items` prop for
reuse/testing) through `SidebarNavItem` rows. **Collapsible** behavior
(task 6) is implemented as this component's own `collapsed` prop —
narrowing to a 72px icon-only rail — rather than as a separate component,
because a collapsible sidebar is still one sidebar with a mode, not two
different components; the collapse toggle button sits at the sidebar's
own foot. `collapsed`/`onToggleCollapse` are supplied by `AdminShell`
(via `useSidebarState`), keeping `AdminSidebar` itself a pure,
presentational, reusable component.

### `AdminHeader` (Task 3)
`src/features/admin/components/layout/AdminHeader.tsx`. The persistent
top bar: a mobile-only hamburger button (`lg:hidden`, opens
`MobileNavDrawer`), a flexible slot for a `breadcrumb` prop (typically a
`<Breadcrumb>`), and the right-aligned `NotificationBell` +
`UserProfileDropdown`. Sticky-positioned with a translucent/blurred
background, matching the existing public-site `Header` pattern from Day 1.

### `Breadcrumb` (Task 4)
`src/components/common/Breadcrumb.tsx` — promoted to the shared
`components/common/` folder rather than kept admin-only, since a trail
component has no admin-specific logic (it takes a plain `items: { label,
href? }[]` prop) and is equally useful on a future customer-facing page.
Renders a `<nav aria-label="Breadcrumb">` with the current page marked
`aria-current="page"` and shown as text, not a link.

### `MobileNavDrawer` (Task 7)
`src/features/admin/components/layout/MobileNavDrawer.tsx`. Off-canvas
panel for viewports below `lg`, rendering the same nav items as
`AdminSidebar` through the same `SidebarNavItem`. Implements its own
accessibility rather than inheriting it from a library: `role="dialog"` +
`aria-modal`, Escape-to-close, body-scroll lock while open, and a real
`<button>` scrim (so the backdrop is keyboard/screen-reader reachable, not
just a click target). Navigating closes the drawer automatically via
`SidebarNavItem`'s `onNavigate` callback. (A full focus trap is *not*
implemented — noted as a follow-up in §6, since this sprint intentionally
avoids introducing a general-purpose dialog/focus-trap library.)

### `SidebarNavItem`
`src/features/admin/components/layout/SidebarNavItem.tsx`. The shared row
renderer used by both `AdminSidebar` and `MobileNavDrawer`, so the two
never drift apart visually. Resolves its icon via `getIcon`, shows only
the icon (with a native `title` tooltip and screen-reader-only label) when
`collapsed`, and marks the active route with `aria-current="page"` plus a
tinted background — the caller (sidebar/drawer) determines "active" by
comparing `usePathname()` to the item's `slug`.

### `UserProfileDropdown` (Task 8 — UI only, no auth actions)
`src/features/admin/components/UserProfileDropdown.tsx`. Shows a
placeholder identity (`PLACEHOLDER_USER`) until a real `user` prop is
passed in from a future sprint's session data. Click-outside and
Escape-to-close are implemented; "Profile" and "Account settings" close
the menu; **"Sign out" is a deliberate no-op**, marked with a comment
showing exactly where `AuthService.signOut()` (Sprint 05) plugs in later.
No session/auth dependency exists in this component today, by design.

### `NotificationBell` (Task 9 — placeholder)
`src/features/admin/components/NotificationBell.tsx`. A bell icon with an
optional numeric badge (`count` prop, default `0` = no badge) that opens a
small panel. The panel's body is this sprint's own `EmptyState` component
rendering "You're all caught up" — there is no real notification system to
show data from yet, so the placeholder is honest about that rather than
faking sample data.

### `PageContainer` (Task 10)
`src/components/common/PageContainer.tsx` — also promoted to shared
`components/common/`, not admin-only. Provides the standard content-page
header pattern (optional `breadcrumb` slot, `title` + `description`, a
right-aligned `actions` slot) plus a body. Distinct from Day 3's
`src/layouts/*` primitives (`PageWrapper`, `SectionWrapper`,
`ContentContainer`), which are pure structural shells with no opinion
about headings — `PageContainer` is a specific, reusable *pattern* one
level above those, and a page can use either or both together.

### `EmptyState` (Task 11)
`src/components/common/EmptyState.tsx` — icon + title + optional
description + optional single action button, in a dashed-border box. One
shared "nothing here yet" pattern so a future empty Books table, empty
Orders list, and this sprint's own `NotificationBell` panel all look and
read consistently, following the frontend-design principle that emptiness
should read as direction ("here's what to do next"), not an apology.

### Loading Skeletons (Task 12)
- **`src/components/ui/skeleton.tsx`** — the base primitive (a pulsing
  rounded `<div>`), added to `components/ui/` alongside Day 1's `button.tsx`
  since it's a generic shadcn-style building block, not admin-specific.
- **`src/features/admin/components/skeletons/TableSkeleton.tsx`** — header
  row + N body rows of pulsing bars, for a future data table's loading state.
- **`CardSkeleton.tsx`** — a responsive grid of card-shaped placeholders,
  for a future dashboard's summary cards.
- **`ListSkeleton.tsx`** — N rows of avatar-circle + two text lines, for a
  future simple list (e.g. notifications, activity feed).

None of these render real data or connect to Supabase — they are shapes
only, ready for a future feature to show while its real query resolves.

## 5. Responsiveness, dark mode, and accessibility

- **Responsive:** a single Tailwind breakpoint (`lg`, 1024px) is the only
  cutoff — `AdminSidebar` is `hidden lg:flex`, `MobileNavDrawer` only
  mounts when `open` (and is itself `lg:hidden`), and `AdminHeader`'s
  hamburger button is `lg:hidden`. This means desktop and tablet share the
  persistent sidebar (matching the brief's "Desktop + Tablet" grouping),
  and only phone-width viewports get the drawer.
- **Dark mode:** every component uses the semantic color tokens already
  defined in Day 1's `globals.css` (`bg-background`, `text-foreground`,
  `bg-card`, `border-border`, `bg-muted`, `bg-destructive`, etc.), which
  already has a complete `.dark` variant. No admin component defines its
  own colors, so the whole shell is dark-mode-ready with zero additional
  styling.
- **Accessible:** landmark roles/labels throughout (`aria-label` on both
  navs, `role="dialog"`/`aria-modal` on the mobile drawer, `aria-current="page"`
  on active nav items and the current breadcrumb, `aria-haspopup`/`aria-expanded`
  on both dropdown-style widgets, visible `focus-visible` rings on every
  interactive element, `sr-only` labels for icon-only collapsed nav items).

## 6. Known, intentional gaps (for the next sprint that touches this)

- **No focus trap** in `MobileNavDrawer` or the two dropdown widgets — Tab
  can currently escape into the page behind them. Adding one is
  straightforward but was left out to avoid quietly introducing a
  general-purpose focus-trap dependency inside a layout-only sprint;
  flagged here so it isn't forgotten.
- **`AdminShell` is not wrapped in `<AuthProvider>`**, and no page-level
  session check exists inside it. Per Sprint 05's docs, that wiring (plus
  `authConfig.adminRoutePrefixes` gaining `["/admin"]`) belongs to whichever
  sprint first creates a real `app/admin/*` route — access control is
  deliberately not layout's responsibility.
- **`UserProfileDropdown` and `NotificationBell` show placeholder data.**
  Both accept props for real data (`user`, `count`) and are ready to be
  fed real values the moment auth/notifications exist.

## 7. Files added this sprint

```
src/lib/icons.tsx                                   # centralized icon registry
src/config/adminNavigation.ts                       # ADMIN_NAVIGATION_ITEMS
src/config/index.ts                                 # barrel — export added
src/constants/routes.constants.ts                   # ROUTES.ADMIN_* added

src/components/ui/skeleton.tsx                      # base Skeleton primitive
src/components/common/Breadcrumb.tsx
src/components/common/EmptyState.tsx
src/components/common/PageContainer.tsx
src/components/common/index.ts

src/features/admin/
├── components/
│   ├── layout/
│   │   ├── AdminShell.tsx
│   │   ├── AdminSidebar.tsx
│   │   ├── AdminHeader.tsx
│   │   ├── MobileNavDrawer.tsx
│   │   ├── SidebarNavItem.tsx
│   │   └── index.ts
│   ├── skeletons/
│   │   ├── TableSkeleton.tsx
│   │   ├── CardSkeleton.tsx
│   │   ├── ListSkeleton.tsx
│   │   └── index.ts
│   ├── UserProfileDropdown.tsx
│   ├── NotificationBell.tsx
│   └── index.ts
├── hooks/useSidebarState.ts, index.ts
├── types/admin-layout.types.ts, index.ts
└── README.md

src/features/README.md                              # note about admin/ added
docs/ADMIN_LAYOUT.md                                # this file
```

**Untouched:** everything from Day 1–4 and Sprint 05, including
`src/config/auth.ts` (`adminRoutePrefixes` stays empty until a real admin
route exists), `src/middleware.ts`, and every product-feature folder.
