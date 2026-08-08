# KarisalBooks.in — Authentication Foundation

**Milestone:** Sprint 05 — Authentication Foundation
**Builds on:** Day 1 (Supabase clients), Day 3 (Master Architecture,
`createSafeContext`), Day 4 (feature-based CMS foundation)
**Explicitly out of scope today:** login page, register page, forgot
password, OTP, magic link, Google/Facebook login, Admin Dashboard, product
management, cart, orders, payment, any frontend page, and any API route.
Nothing here renders UI or exposes an endpoint — it is the data model,
services, hooks, and middleware that a future login form and future
protected pages will be built on top of.

---

## 1. Why this shape

Authentication touches almost every future milestone (a login page needs
it, an Admin Dashboard needs it, a customer account area needs it, order
history needs it), so it's built once, here, as infrastructure — the same
reasoning Day 3 applied to config/constants/types. Concretely:

- **Roles and permissions are cross-cutting**, so they live in
  `src/constants/roles.constants.ts` and `permissions.constants.ts` (shared
  top-level), not inside `features/auth/` — the Admin Dashboard and Product
  Management milestones will import them directly without depending on the
  auth feature folder itself.
- **Everything else auth-specific** (types, services, hooks, context,
  middleware logic) lives inside `src/features/auth/`, per the folder
  structure this sprint's task explicitly asked for.
- **Client and server auth access are deliberately separate files**
  (`auth.service.ts` vs. `session.service.ts`) because they run against
  different Supabase client contexts (`@/lib/supabase/client` vs.
  `@/lib/supabase/server`, from Day 1) and Next.js enforces that a
  server-only module (one that imports `next/headers`) is never pulled
  into client-bundled code.

## 2. Roles

Four roles, in ascending order of privilege:

| Role          | Hierarchy level |
|---------------|------------------|
| Customer      | 10               |
| Staff         | 20               |
| Admin         | 30               |
| Super Admin   | 40               |

Defined in `src/constants/roles.constants.ts` as `ROLES` (the string
values Supabase will store) and `ROLE_HIERARCHY` (the numeric levels).
`isAtLeastRole(role, minimumRole)` is the one function anything (a hook, a
server check, middleware) should use to ask "is this role senior enough?"
— nothing should compare role strings directly.

**Where a user's role is actually stored:** there is no `profiles` or
`users` database table in this sprint (explicitly out of scope — no
database tables today). Role is read from the Supabase Auth user's
`app_metadata.role` field, which only a trusted server context (never the
end user) can write. Until a role is explicitly set there, every user is
treated as `CUSTOMER` (`DEFAULT_ROLE`). A future milestone will likely add
a `profiles` table (mirroring the Day 2 `categories`-style structure, with
`id` referencing `auth.users.id`) and either keep `app_metadata.role` in
sync via a database trigger, or read the role from `profiles` instead —
that decision is deferred, not made today.

## 3. Permissions

`src/constants/permissions.constants.ts` defines `PERMISSIONS` (e.g.
`MANAGE_PRODUCTS`, `MANAGE_ORDERS`, `ACCESS_ADMIN_DASHBOARD`) and
`ROLE_PERMISSIONS`, a table of which permissions each role holds. `Super
Admin` implicitly holds every permission (checked as a special case in
`hasPermission()`, not by listing all permissions against it), so adding a
new permission later never requires updating the Super Admin row.

Permissions exist so future feature code checks *what a user can do*
(`hasPermission(role, PERMISSIONS.MANAGE_PRODUCTS)`) instead of *who they
are* (`role === "admin"`) — regranting a capability to a different role
later is a one-line change in `ROLE_PERMISSIONS`, not a hunt through every
feature that hardcoded a role check.

## 4. How login will work (future milestone, architecture ready today)

1. A future login page collects an email and password and calls
   `AuthService.signInWithPassword({ email, password })`
   (`features/auth/services/auth.service.ts`).
2. That function calls `supabase.auth.signInWithPassword(...)` — the one
   and only place in the app that talks to the Supabase Auth SDK's sign-in
   method — and returns the app's own `AuthResult<AuthSession>` shape
   (`{ data, error }`) rather than throwing, so the future form can render
   a field-level error either way.
3. On success, Supabase's `@supabase/ssr` browser client
   (`@/lib/supabase/client`, from Day 1) automatically persists the session
   into cookies. No manual token storage is written anywhere in this
   codebase — that persistence is handled by the Supabase SDK.
4. `AuthProvider` (see §5) is already subscribed to
   `AuthService.onAuthStateChange`, so the moment sign-in succeeds, every
   component using `useAuth()` / `useSession()` re-renders with the new
   session automatically — the future login page does not need to
   manually redirect *and* manually update global state; it only needs to
   redirect (to `authConfig.routes.afterLogin`).

Only email/password sign-in is wired up this sprint. OTP, magic link, and
social providers are unimplemented by design.

## 5. How session works

Three layers, each with a distinct job:

- **`AuthProvider` + `useAuth()`/`useSession()`/`useRole()`/`usePermission()`**
  (`features/auth/context/AuthProvider.tsx`, `features/auth/hooks/`) —
  client-side, reactive state for Client Components. Hydrates the current
  session on mount via `AuthService.getCurrentSession()`, then stays in
  sync via `AuthService.onAuthStateChange`. Built on the `createSafeContext`
  factory from Day 3 rather than a hand-rolled Context. **Not yet wired
  into the root layout** — no `<AuthProvider>` wraps `<RootLayout>` yet,
  since doing so is only useful once a page actually consumes auth state.
  A future milestone adds that one line.
- **`session.service.ts`** — server-side, for Server Components, Server
  Actions, and Route Handlers. `getServerAuthUser()` calls
  `supabase.auth.getUser()` (not `getSession()`) because `getUser()`
  revalidates the token against Supabase Auth itself instead of trusting
  a cookie's contents — the correct call whenever a server context is
  about to make an authorization decision. `isAuthenticated()`,
  `hasMinimumRole()`, and `hasServerPermission()` are convenience wrappers
  around it.
- **`createMiddlewareClient()`** (`lib/supabase/middleware.ts`) — a third
  Supabase client context, specifically for `middleware.ts`, since
  middleware reads/writes cookies through a `NextRequest`/`NextResponse`
  pair rather than the `next/headers` store the other two contexts use.
  This is what keeps the session cookie refreshed on every request before
  it ever reaches a page.

All three read the same underlying Supabase-issued session; they exist
separately because Next.js requires a different cookie-access mechanism in
each runtime context, not because the session itself is different.

## 6. How middleware works

`src/middleware.ts` is the Next.js entry point (kept deliberately thin —
it just calls `handleAuthMiddleware` from
`features/auth/middleware/auth.middleware.ts`). Its `matcher` runs on
almost every request (excluding static assets and Next internals), for one
reason: to keep the Supabase session cookie refreshed on every navigation,
regardless of whether the route is protected.

On each matched request, `handleAuthMiddleware`:

1. Creates a middleware-scoped Supabase client and calls
   `supabase.auth.getUser()` (refreshing the session cookie as a side
   effect if needed).
2. Checks the request path against `authConfig.protectedRoutePrefixes` and
   `authConfig.adminRoutePrefixes` (`src/config/auth.ts`).
3. If the path requires auth (or admin) and there is no user, redirects to
   `authConfig.routes.login` with a `redirectTo` query param so the future
   login page can send the user back where they came from after signing in.
4. If the path requires admin and the user's role (from
   `app_metadata.role`) isn't at least `authConfig.minimumAdminRole`,
   redirects to `authConfig.routes.unauthorized`.
5. Otherwise returns the refreshed response, letting the request continue.

**Both prefix lists are empty today.** No page in the app currently
requires auth, so step 2 never matches on a real request yet — but the
enforcement logic is complete. Adding the first protected page later is a
one-line addition to `authConfig.protectedRoutePrefixes` (or
`adminRoutePrefixes`), not new middleware code.

## 7. How protected routes will work (once pages exist)

Defense happens at two levels, matching standard Next.js + Supabase
practice:

- **Middleware (network edge, first line of defense).** Once a route
  prefix is added to `authConfig`, middleware redirects unauthenticated/
  under-privileged requests before the page's own code ever runs.
- **Page-level check (defense in depth).** Middleware can be bypassed by
  direct data-layer access in some edge cases (e.g. a cached response), so
  every future protected Server Component should *also* call
  `getServerAuthUser()` / `hasMinimumRole()` from `session.service.ts` at
  the top of the page and redirect or render a "not authorized" state
  itself. This mirrors why Supabase's own guidance is "never trust
  middleware alone" — a page should be secure even if middleware were
  somehow skipped.
- **Client-side gating** for *conditionally rendering* UI (e.g. hiding an
  "Edit" button from a Customer) uses `useHasMinimumRole()` /
  `usePermission()` from the hooks — but this is a UX nicety, never the
  actual security boundary, since client-side JavaScript can always be
  inspected or disabled. The real boundary is always the server-side check
  above.

## 8. How a future Admin Dashboard will use this

Nothing below is built today — this is the intended usage once that
milestone starts:

1. **Route protection.** Add the dashboard's route (once it exists) to
   `authConfig.adminRoutePrefixes`, e.g. `["/admin"]`, and set
   `minimumAdminRole` to whichever role should gate the whole section
   (currently defaulted to `ROLES.STAFF`, so Staff and above pass, but
   individual actions within the dashboard still differ by permission —
   see next point).
2. **Server-side page guard.** Each admin Server Component starts with
   `const user = await getServerAuthUser(); if (!user) redirect(...)`, the
   same defense-in-depth pattern as §7.
3. **Fine-grained action checks.** A single admin page often mixes actions
   different roles can't all do (e.g. Staff can view orders but not manage
   staff accounts). Rather than branching on role name, each action checks
   its specific permission: `hasServerPermission(PERMISSIONS.MANAGE_STAFF)`
   on the server before executing a mutation, and
   `usePermission(PERMISSIONS.MANAGE_STAFF)` client-side to decide whether
   to render the corresponding button at all.
4. **Managing navigation dynamically.** Day 4's CMS foundation
   (`navigation_items`-shaped records, `resolveNavigationTree`) is designed
   to be edited by exactly this kind of admin screen. The dashboard's
   navigation editor would check
   `hasPermission(role, PERMISSIONS.MANAGE_NAVIGATION)` before allowing
   create/edit/reorder/delete on a nav item — that permission already
   exists in `ROLE_PERMISSIONS`, granted to `Admin` and implicitly
   `Super Admin`.
5. **Managing roles themselves.** Assigning a role to a user (writing
   `app_metadata.role`) requires Supabase's service-role key, which must
   never reach the browser — that action can only ever run in a trusted
   server context (a future Server Action or Route Handler), gated by
   `hasServerPermission(PERMISSIONS.MANAGE_USERS)` and likely restricted
   further to `Super Admin` only at the call site.

## 9. Files added this sprint

```
src/constants/roles.constants.ts          # ROLES, ROLE_HIERARCHY, isAtLeastRole, DEFAULT_ROLE
src/constants/permissions.constants.ts    # PERMISSIONS, ROLE_PERMISSIONS, hasPermission
src/constants/index.ts                    # barrel — updated to export the two files above

src/config/auth.ts                        # authConfig: routes, protected/admin prefixes, minimumAdminRole
src/config/index.ts                       # barrel — updated to export auth.ts

src/lib/supabase/middleware.ts            # createMiddlewareClient — 3rd Supabase client context

src/features/auth/
├── types/auth.types.ts                   # AuthUser, AuthSession, AuthState, AuthResult, SignInCredentials
├── types/index.ts
├── services/auth.service.ts              # client-side: signInWithPassword, signOut, getCurrentSession, onAuthStateChange
├── services/session.service.ts           # server-side: getServerAuthUser, isAuthenticated, hasMinimumRole, hasServerPermission
├── context/AuthProvider.tsx              # client auth state, built on Day 3's createSafeContext
├── context/index.ts
├── hooks/useAuth.ts, useSession.ts, useRole.ts, usePermission.ts
├── hooks/index.ts
├── middleware/auth.middleware.ts         # handleAuthMiddleware, used by root middleware.ts
├── components/ (empty — no UI this sprint)
└── README.md

src/middleware.ts                         # Next.js root middleware entry point
docs/AUTH_ARCHITECTURE.md                 # this file
```

**Note:** `features/auth/services/` deliberately has no barrel
(`index.ts`). `auth.service.ts` (browser) and `session.service.ts`
(server, imports `next/headers` transitively via `@/lib/supabase/server`)
must never be re-exported from one combined file — doing so risks a
Client Component importing the barrel and accidentally pulling
server-only code into the browser bundle. Each is imported directly from
its own file instead.

**Untouched:** everything else from Day 1–4, including
`src/config/settings.ts` (its earlier, overlapping `features` flags
object) and all product-feature folders (`books`, `competitive-exams`,
etc.).
