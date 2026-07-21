# `src/features/authors`

Author data layer — Sprint 11 (Author & Publisher Management). Reads from
and writes to the `authors` table (Day 2 migration). Mirrors
`src/features/books/` (Sprint 10)'s layered shape, built on two new
generic factories (`@/services/createSupabaseRepository`,
`@/services/createEntityService`) rather than hand-writing repository/
service boilerplate a second time.

## Structure

```
authors/
├── services/
│   ├── author.repository.ts   # createSupabaseRepository("authors", ...) + getBookCountForAuthor
│   ├── author.service.ts      # createEntityService(authorRepository, ...)
│   └── author.validation.ts   # zod schemas + validateAuthorInsert/validateAuthorUpdate
├── hooks/
│   └── useAuthorForm.ts       # Form state; reuses Sprint 10's Image Upload Service
├── types/
│   └── author-form.types.ts   # AuthorFormValues (camelCase, form-ergonomic)
└── components/                 # Empty — UI lives in features/admin/components/authors/
```

The `Author`/`AuthorInsert`/`AuthorUpdate` entity types live in shared,
top-level `src/types/author.types.ts`, mirroring `Book`'s placement
(Sprint 10). Admin UI (`AuthorTable`, `AuthorCard`, `AuthorFormLayout`,
etc.) lives in `src/features/admin/components/authors/` — the same split
`features/books/` vs. a future `features/admin/components/books/` was set
up for, except this sprint actually builds the Author admin UI (Task 14),
unlike Sprint 10's Book scope.

No combined `services/index.ts` barrel — the same decision Sprint 05
(`features/auth/services/`) and Sprint 10 (`features/books/services/`)
already made, since `author.repository.ts`/`author.service.ts` are
server-only.

See `docs/AUTHOR_PUBLISHER_MANAGEMENT.md` for the full architecture
explanation, including why the repository/service layers were generalized
into shared factories while validation and UI were not.
