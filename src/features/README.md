# `src/features`

Feature-based modules. Each subfolder is a self-contained slice of the
product (Books, Competitive Exams, Publication Services, Offer Zone,
Pre Booking, Contact, About), and each one follows the same internal shape:

```
<feature>/
├── components/   # UI components used only by this feature
├── hooks/        # Hooks used only by this feature
├── services/     # Data access for this feature (implements BaseService<T>)
├── types/        # TypeScript interfaces specific to this feature
└── README.md     # What this feature is, in one or two sentences
```

**Rule of thumb:** if something is only ever used by one feature, it lives
inside that feature's folder. If it's used by two or more features, it's
promoted to the shared top-level folder instead (`src/components`,
`src/hooks`, `src/services`, `src/types`).

This milestone (Day 3) creates the folder scaffolding only — no components,
pages, hooks, or services are implemented inside any feature yet.

**`auth/` (added Sprint 05)** is a cross-cutting feature rather than a
product-facing one, and extends the standard shape with two extra
subfolders: `context/` (the `AuthProvider` client state) and `middleware/`
(request-level route protection logic used by the root `src/middleware.ts`).
See `features/auth/README.md` and `docs/AUTH_ARCHITECTURE.md` for details.

**`admin/` (added Sprint 06, extended Sprint 07, 08, and 09)** is also
cross-cutting: the reusable admin shell (sidebar, header, mobile nav), a
config-driven dashboard widget framework, and config-driven category and
subcategory management UI frameworks (tables, cards, forms, filters,
pagination), all rendered inside by every future admin screen. It has
`components/` (with `layout/`, `skeletons/`, `dashboard/`, `categories/`,
and `subcategories/` subfolders), `hooks/`, and `types/`, but no
`services/` — still layout/framework only, with no real data access yet.
See `features/admin/README.md`, `docs/ADMIN_LAYOUT.md`,
`docs/DASHBOARD_FRAMEWORK.md`, `docs/CATEGORY_MANAGEMENT.md`, and
`docs/SUBCATEGORY_MANAGEMENT.md` for details.
