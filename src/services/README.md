# `src/services`

Cross-feature service contracts and shared service infrastructure live here.

- `base.service.ts` defines the `BaseService<T>` interface every future
  data service implements (a thin repository layer over Supabase).
- Feature-specific services (e.g. `BooksService`, `AuthorsService`) do
  **not** live here — they belong inside their own feature folder at
  `src/features/<feature>/services/`, and implement `BaseService<T>`.

No real API/database calls are implemented in this milestone. This folder
only defines the pattern that future feature services will follow.
