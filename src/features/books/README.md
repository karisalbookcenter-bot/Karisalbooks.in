# `src/features/books`

Book catalog, listing, and detail views. Will read from the categories, subcategories, authors, and publishers tables created in the Day 2 migration.

## Convention

Every feature folder follows the same internal shape:

```
books/
├── components/   # UI components used only by this feature
├── hooks/        # Hooks used only by this feature
├── services/     # Data access for this feature (implements BaseService<T>)
└── types/        # TypeScript interfaces specific to this feature
```

This milestone (Day 3) only creates the folder structure above as empty
scaffolding. No components, hooks, services, or pages are implemented yet —
those arrive in this feature's own dedicated milestone.
