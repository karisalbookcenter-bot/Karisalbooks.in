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

**`books/` (real services added Sprint 10), `authors/` and `publishers/`
(added Sprint 11)** are where each entity's actual repository/service/
validation/hooks live — real Supabase-backed CRUD, unlike the mostly-empty
Day 3 scaffolding every other product feature still has. `authors/` and
`publishers/` are built on two new shared factories,
`src/services/createSupabaseRepository.ts` and `createEntityService.ts`,
so their repository/service files are thin config calls rather than
hand-written duplicates of `books/`'s Sprint 10 code. Each still has an
empty `components/` folder — their admin UI lives under
`features/admin/components/{books,authors,publishers}/` instead (only
`authors/` and `publishers/` have that UI built so far, Sprint 11's
Tasks 14–15; Books' admin UI remains a future sprint). See each folder's
own `README.md`, `docs/BOOK_CRUD_FOUNDATION.md` (Sprint 10), and
`docs/AUTHOR_PUBLISHER_MANAGEMENT.md` (Sprint 11).

**`admin/` (added Sprint 06, extended Sprint 07, 08, 09, and 11)** is also
cross-cutting: the reusable admin shell (sidebar, header, mobile nav), a
config-driven dashboard widget framework, and config-driven catalog
management UI for four entities (tables, cards, forms, filters,
pagination). It has `components/` (with `layout/`, `skeletons/`,
`dashboard/`, `categories/`, `subcategories/`, `authors/`, and
`publishers/` subfolders), `hooks/`, and `types/`, but no `services/` —
still layout/framework only; the real data access lives in each entity's
own top-level feature folder above.
See `features/admin/README.md`, `docs/ADMIN_LAYOUT.md`,
`docs/DASHBOARD_FRAMEWORK.md`, `docs/CATEGORY_MANAGEMENT.md`,
`docs/SUBCATEGORY_MANAGEMENT.md`, and `docs/AUTHOR_PUBLISHER_MANAGEMENT.md`
for details.
