# Sprint 14 — Activate Admin System

## New files (full, verified content)
- `app/admin/layout.tsx` — mounts AuthProvider + AdminShell, server-side
  auth/role guard per AUTH_ARCHITECTURE.md §7-8
- `app/admin/page.tsx` — renders Sprint 07's DashboardOverview

## Modified files (patch only — see patches/)
- `src/config/auth.ts` — ONE line changed: `adminRoutePrefixes: []` →
  `adminRoutePrefixes: ["/admin"]`. Provided as a patch instruction
  (`patches/auth.config.patch.md`), not a full-file replacement, since this
  file's complete current contents weren't independently re-fetched for this
  package — apply the single-line change to your real file rather than
  trusting a reconstructed copy.

## Explicitly not touched
AdminShell.tsx, AuthProvider.tsx, session.service.ts, middleware.ts, and
every feature's admin components — Sprint 14 only connects wiring Sprints
05–13 already built.

## Verification checklist
- [ ] `/admin` while logged out → redirects to login with `?redirectTo=/admin`
- [ ] `/admin` while logged in below minimumAdminRole → redirects to unauthorized route
- [ ] `/admin` as Staff/Admin/Super Admin → renders AdminShell + DashboardOverview
- [ ] Sidebar links to not-yet-built routes (`/admin/books`, etc.) 404 — expected
- [ ] `usePermission()`/`useAuth()` no longer throw inside dashboard widgets
