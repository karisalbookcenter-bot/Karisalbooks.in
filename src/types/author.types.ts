import type { BaseEntity } from "./common.types";

/**
 * Author entity types — Sprint 11 (Author & Publisher Management).
 *
 * Placed in shared, top-level `src/types/` for the same reason `Book`
 * (Sprint 10), `Category` (Sprint 08), and `Subcategory` (Sprint 09) are —
 * a core domain entity a future public storefront will also need.
 *
 * Mirrors the Day 2 SQL migration's `authors` table column-for-column.
 * Structurally simple compared to `Category`/`Book`: no self-reference,
 * no required foreign key — just `name`, `slug`, an optional `bio`, and
 * an optional `photo_url`, which is exactly why `author.repository.ts`
 * builds on the generic `createSupabaseRepository` factory (Sprint 11)
 * instead of hand-writing the same CRUD/search/pagination logic
 * `book.repository.ts` already wrote by hand for a more complex entity.
 */
export interface Author extends BaseEntity {
  name: string;
  slug: string;
  bio: string | null;
  photo_url: string | null;
}

/** Shape for creating an author. `slug` optional — auto-generated from
 *  `name` by the repository factory when omitted, the same behavior
 *  `book.repository.ts`'s `createBook` already established. */
export interface AuthorInsert {
  name: string;
  slug?: string;
  bio?: string | null;
  photo_url?: string | null;
  status?: Author["status"];
}

export type AuthorUpdate = Partial<AuthorInsert>;
