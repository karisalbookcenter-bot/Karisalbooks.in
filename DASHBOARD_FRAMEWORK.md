# KarisalBooks.in — Admin Dashboard Framework

**Milestone:** Sprint 07 — Admin Dashboard Framework
**Builds on:** Day 1 (Tailwind/shadcn conventions), Day 4 (icon-key
convention on data records), Sprint 05 (roles/permissions), Sprint 06
(`AdminShell`, `PageContainer`, `EmptyState`, `Skeleton`/`CardSkeleton`/
`ListSkeleton`, centralized icon registry)
**Explicitly out of scope today:** CRUD pages, Products, Categories,
Orders, Customers, APIs, database queries, authentication pages, and
charts backed by real data. Every number, status, and activity row in
this framework is a placeholder — nothing here queries Supabase.

---

## 1. Dashboard architecture

The dashboard is a **composition of small, independently reusable
widgets**, not one large page component. `DashboardOverview`
(`src/features/admin/components/dashboard/DashboardOverview.tsx`) is the
top-level piece — the "page architecture" this sprint's task 1 asked
for — but it contains almost no markup of its own: it arranges five
widgets (`WelcomeBanner`, `StatCardGrid`, `QuickActions`, `SystemStatus`,
`RecentActivity`) inside Sprint 06's `PageContainer`, and that's it.

```
DashboardOverview
└── PageContainer (title="Dashboard", Sprint 06)
    ├── WelcomeBanner
    ├── StatCardGrid              → StatCard × 6 (config-driven)
    ├── grid (2 columns on lg+)
    │   ├── QuickActions          (WidgetContainer)
    │   └── SystemStatus          (WidgetContainer)
    └── RecentActivity            (WidgetContainer)
```

No `app/admin/*` route renders this yet. The intended future usage —
documented in `features/admin/README.md` — is:

```tsx
// A future app/admin/page.tsx
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

`DashboardOverview` doesn't render `AdminShell` itself — the same
separation Sprint 06 established between chrome (`AdminShell`) and content
(whatever it wraps). This sprint only builds the content half.

## 2. The widget system

"Widget" here means: **a self-contained component that (a) reads its data
from a config file, not a prop the caller must assemble by hand, (b) is
independently importable and reusable outside the dashboard, and (c) has
an explicit, already-designed loading and/or empty state.** Concretely:

### Data lives in config, not in components

`src/config/dashboard.ts` defines three arrays — `DASHBOARD_STAT_CARDS`,
`DASHBOARD_QUICK_ACTIONS`, `DASHBOARD_SYSTEM_STATUS` — the same
"config-driven" pattern Day 4 established for navigation
(`NavigationItemRecord[]`) and Sprint 06 extended to the admin sidebar
(`ADMIN_NAVIGATION_ITEMS`). Adding a 7th stat card or a 7th quick action
later is a one-line addition to an array, not a component edit — every
widget maps over its config array (`cards.map(...)`,
`actions.map(...)`, `items.map(...)`) rather than hardcoding JSX per item.

### Every widget accepts an override

`StatCardGrid`, `QuickActions`, and `SystemStatus` all default their data
prop to the config array (`cards = DASHBOARD_STAT_CARDS`, etc.) but accept
an override. This is what makes them "fully reusable" per the brief — a
future screen showing a *different* set of stats (e.g. a "This Month"
filtered view) reuses `StatCardGrid` itself, just with a different
`cards` array, instead of a copy-pasted variant.

### Two shared primitives every widget panel uses

- **`WidgetContainer`** (`src/components/common/WidgetContainer.tsx`) —
  the bordered card shell (task 8). Promoted to `components/common/`
  rather than kept inside `features/admin/`, since "a bordered panel with
  a title and a body" has no admin-specific logic — the same reasoning
  Sprint 06 applied to `PageContainer`. `QuickActions`, `RecentActivity`,
  and `SystemStatus` are each just "a `WidgetContainer` with a specific
  body."
- **`SectionTitle`** (`src/components/common/SectionTitle.tsx`) — the
  icon + heading + optional description + optional action row (task 9),
  used internally by `WidgetContainer` whenever a `title` is given, and
  equally usable standalone by any future section that isn't inside a
  `WidgetContainer`.

### Every widget's loading/empty state is explicit, not implicit

- `StatCard`/`StatCardGrid` take a `loading` prop that swaps the value for
  a `Skeleton` bar (Sprint 06's primitive) — and when not loading, still
  shows an honest em-dash placeholder rather than a fabricated number
  (see `StatCard`'s own doc comment for why a dash, not a zero).
- `RecentActivity` takes a `loading` prop that swaps Sprint 06's
  `ListSkeleton` in for Sprint 06's `EmptyState` — this widget's only two
  realistic states *before* real data exists are "loading" and "nothing
  yet," and both are already built.
- `DashboardSkeleton` composes Sprint 06's existing `CardSkeleton`,
  `ListSkeleton`, and base `Skeleton` into a whole-page loading state, so
  a future page can render `<DashboardSkeleton />` while its first fetch
  is in flight and swap to `<DashboardOverview />` once it resolves.
- `DashboardEmptyState` (task 11) wraps Sprint 06's `EmptyState` with
  copy suited to "the whole store has nothing yet," distinct from
  `RecentActivity`'s narrower, section-level empty state.

### Icons stay centralized

Every widget resolves its icon(s) through `getIcon()`
(`src/lib/icons.tsx`, Sprint 06), never importing a `lucide-react`
component directly. This sprint only *extended* that registry (added
`indian-rupee`, `alert-triangle`, `plus`, `check-circle`, `x-circle`,
`help-circle`, `database`, `activity`, `sparkles`) rather than
introducing a second icon-resolution path.

## 3. Component-by-component summary

| Component | Task | What it is |
|---|---|---|
| `DashboardOverview` | 1, 2 | Composed dashboard page architecture / reusable layout |
| `StatCard` / `StatCardGrid` | 3 | Config-driven metric cards, em-dash placeholder values |
| `QuickActions` | 4 | UI-only button grid; `onAction` defaults to a no-op |
| `RecentActivity` | 5 | Placeholder only — `EmptyState` or `ListSkeleton`, no data |
| `SystemStatus` | 6 | Status list; every row is `"unknown"` (no real health check) |
| `WelcomeBanner` | 7 | Greeting strip, placeholder name until a real user is passed |
| `WidgetContainer` | 8 | Generic bordered panel shell (promoted to `components/common/`) |
| `SectionTitle` | 9 | Generic heading row (promoted to `components/common/`) |
| `DashboardSkeleton` | 10 | Whole-page loading state, composed from Sprint 06 skeletons |
| `DashboardEmptyState` | 11 | Whole-store empty state, wraps Sprint 06's `EmptyState` |
| `config/dashboard.ts` | 12 | Stat card / quick action / system status definitions |

## 4. Why Quick Actions and System Status have no real behavior

- **`QuickActions`**: each button calls `onAction?.(action.id)`, which is
  `undefined` by default — clicking any button today does nothing
  observable. This is deliberate: wiring "Add Book" to a real route or
  modal requires that route/modal to exist, and none do yet (Books CRUD
  is explicitly out of scope). The prop is already shaped for that future
  wiring (`onAction={(id) => router.push(...)}`), so the button grid
  itself won't need to change when that sprint arrives.
- **`SystemStatus`**: every status is `"unknown"` ("Not checked"), a
  fourth state added specifically so the widget never claims a system is
  `"operational"` without having verified it — `"unknown"` is the honest
  default, not a stand-in for "operational." The four-state model
  (`operational`/`degraded`/`down`/`unknown`) and its styling are already
  complete; only the actual check is missing.

## 5. Future extension strategy

**Adding a 7th stat card, quick action, or status row:** add one object to
the relevant array in `config/dashboard.ts`. No component changes.

**Wiring real numbers into `StatCard`:** a future service (following the
`BaseService<T>` contract from Day 3) fetches a count, and the page passes
`value={count.toString()}` (or leaves `loading` true while the fetch is
in flight) — `StatCard` already supports both.

**Wiring real Quick Actions:** pass `onAction` from the page:
```tsx
<QuickActions onAction={(id) => {
  if (id === "add-book") router.push(ROUTES.ADMIN_BOOKS + "/new");
  // ...
}} />
```
No change to `QuickActions` itself.

**Wiring a real Recent Activity feed:** replace the `EmptyState` branch in
`RecentActivity` with a mapped list of real activity rows once an
activity/event table and service exist; the `loading` branch
(`ListSkeleton`) already matches the shape that real list will need.

**Wiring real System Status checks:** replace `"unknown"` values in
`config/dashboard.ts` (or better, compute them in a future server
component and pass as a prop) with real `operational`/`degraded`/`down`
results from actual pings to Supabase, storage, and a payments provider.
`SystemStatus`'s rendering logic needs no change — all four states are
already styled.

**Permission-gating stat cards and quick actions:** `StatCardDefinition`
and `QuickActionDefinition` already carry an optional `permission` field
(reusing Sprint 05's `Permission` type), set today wherever an exact
existing permission fits (`MANAGE_PRODUCTS`, `MANAGE_CATEGORIES`,
`VIEW_ORDERS`). Three quick actions — Add Author, Add Publisher, Create
Coupon — have **no** `permission` set, because `permissions.constants.ts`
doesn't yet define `MANAGE_AUTHORS`/`MANAGE_PUBLISHERS`/`MANAGE_COUPONS`
(those features don't exist yet either). The follow-up, once those
features are built: add the three permissions to `PERMISSIONS` in
`permissions.constants.ts`, grant them to the appropriate roles in
`ROLE_PERMISSIONS`, then set them on the corresponding entries here. Once
`AuthProvider` is wired into a real `app/admin/layout.tsx`, a future
`QuickActions`/`StatCardGrid` variant can filter its config array through
`usePermission()` before rendering — deliberately not done today, since no
page currently wraps this framework in `<AuthProvider>` and calling that
hook without a provider throws (see Sprint 05's `createSafeContext`
behavior).

**Turning `DashboardOverview` into the real dashboard route:** create
`app/admin/page.tsx` rendering `<AdminShell><DashboardOverview /></AdminShell>`,
add `"/admin"` to `authConfig.adminRoutePrefixes` (Sprint 05,
`src/config/auth.ts` — currently empty), and add a server-side
`getServerAuthUser()`/`hasMinimumRole()` guard at the top of the page
(the defense-in-depth pattern documented in `docs/AUTH_ARCHITECTURE.md`
§7). None of that is done today — it's the very next sprint's job once
this framework is considered final.

## 6. Files added this sprint

```
src/lib/icons.tsx                                # extended — 9 new icon keys
src/config/dashboard.ts                          # stat cards / quick actions / system status data
src/config/index.ts                              # barrel — export added

src/components/common/SectionTitle.tsx
src/components/common/WidgetContainer.tsx
src/components/common/index.ts                   # barrel — 2 exports added

src/features/admin/types/dashboard.types.ts
src/features/admin/types/index.ts                # barrel — export added

src/features/admin/components/dashboard/
├── DashboardOverview.tsx
├── WelcomeBanner.tsx
├── StatCard.tsx
├── StatCardGrid.tsx
├── QuickActions.tsx
├── RecentActivity.tsx
├── SystemStatus.tsx
├── DashboardSkeleton.tsx
├── DashboardEmptyState.tsx
└── index.ts

src/features/admin/components/index.ts           # barrel — export added
src/features/admin/README.md                     # updated for Sprint 07
src/features/README.md                           # admin/ note updated
docs/DASHBOARD_FRAMEWORK.md                       # this file
```

**Untouched:** everything from Day 1–4 and Sprint 05–06 not listed above,
including `src/config/auth.ts` (`adminRoutePrefixes` stays empty),
`src/middleware.ts`, `src/constants/permissions.constants.ts` (no new
permissions added — see §5), and every product-feature folder.
