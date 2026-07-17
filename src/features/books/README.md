# `src/features/books`

Book catalog data layer — Sprint 10 (Book CRUD + Supabase Integration).
Reads from and writes to the `books` table (Migration 0002, this sprint),
and links to the `categories`, `subcategories`, `authors`, and
`publishers` tables from the Day 2 migration.

**No UI lives here yet.** This sprint is deliberately scoped to the data
layer only — repository, service, validation, form state, and image
upload — matching Sprint 10's task list, which (unlike Sprint 08/09's
Category/Subcategory frameworks) never asks for a `BookTable`/`BookCard`/
`BookFormLayout` component. A future UI sprint builds those, following
the exact patterns Sprints 08–09 established for Category/Subcategory,
and consumes the layer described below rather than talking to Supabase
directly.

## Structure

```
books/
├── services/
│   ├── book.repository.ts    # The only file that calls supabase.from("books")
│   ├── book.service.ts       # Callable layer: validates, calls the repository,
│   │                          # returns ApiResponse<T> — never throws
│   ├── book.validation.ts    # zod schemas + validateBookInsert/validateBookUpdate
│   └── image-upload.service.ts  # Supabase Storage upload for cover images
├── hooks/
│   └── useBookForm.ts        # Form state management — no UI, ready for a
│                               # future BookFormLayout to consume
├── types/
│   └── book-form.types.ts    # BookFormValues (camelCase, form-ergonomic)
└── components/                # Still empty — intentionally, this sprint
```

The `Book`/`BookInsert`/`BookUpdate` entity types themselves live in
shared, top-level `src/types/book.types.ts` — not here — mirroring where
`Category` (Sprint 08) and `Subcategory` (Sprint 09) live, since a future
public storefront feature will need the same entity type this admin-side
service layer uses.

**No combined `services/index.ts` barrel**, deliberately — the same
decision Sprint 05 made for `features/auth/services/`. `book.repository.ts`
and `book.service.ts` are server-only (they transitively import
`next/headers` via `@/lib/supabase/server`); `image-upload.service.ts` is
client-only (`@/lib/supabase/client`). Barrel-exporting both together
would risk a Client Component accidentally pulling server-only code into
the browser bundle. Each file is imported directly instead.

## How a future admin page/UI will use this

```tsx
// A future Server Component (e.g. app/admin/books/page.tsx)
import { listBooks } from "@/features/books/services/book.service";

export default async function AdminBooksPage() {
  const { data, error } = await listBooks({ page: 1, pageSize: 20 });
  // ... pass `data.items` into a future BookTable, mirroring
  // CategoryManagementOverview/SubcategoryManagementOverview
}
```

```tsx
// A future BookFormLayout Client Component
"use client";
import { useBookForm } from "@/features/books/hooks/useBookForm";

export function BookFormLayout() {
  const form = useBookForm({ mode: "create" });
  // form.values, form.errors, form.setField, form.submit, ...
}
```

See `docs/BOOK_CRUD_FOUNDATION.md` for the full architecture explanation.
