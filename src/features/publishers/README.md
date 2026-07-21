# `src/features/publishers`

Publisher data layer — Sprint 11 (Author & Publisher Management). Mirrors
`src/features/authors/` exactly (same generic factories, same layered
shape), with `description`/`website_url` in place of `bio`/`photo_url`
and no image upload step (`Publisher` has no image field).

## Structure

```
publishers/
├── services/
│   ├── publisher.repository.ts   # createSupabaseRepository("publishers", ...) + getBookCountForPublisher
│   ├── publisher.service.ts      # createEntityService(publisherRepository, ...)
│   └── publisher.validation.ts   # zod schemas
├── hooks/
│   └── usePublisherForm.ts       # Form state — no upload step
├── types/
│   └── publisher-form.types.ts   # PublisherFormValues
└── components/                    # Empty — UI lives in features/admin/components/publishers/
```

See `src/features/authors/README.md` and
`docs/AUTHOR_PUBLISHER_MANAGEMENT.md` for the full explanation — the two
features share essentially all of their architecture.
