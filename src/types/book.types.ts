import type { BaseEntity } from "./common.types";

/**
 * Book entity types — Sprint 10 (Book CRUD + Supabase Integration).
 *
 * Placed in shared, top-level `src/types/` for the same reason `Category`
 * (Sprint 08) and `Subcategory` (Sprint 09) are — a core domain entity a
 * future public storefront will also need, not an admin-only concept.
 *
 * Mirrors Migration 0002's `books` table column-for-column.
 */
export interface Book extends BaseEntity {
  category_id: string;
  /** Nullable — a book may not yet have a specific subcategory assigned,
   *  mirroring the column's nullable `references subcategories(id)`. */
  subcategory_id: string | null;
  author_id: string;
  /** Nullable — a book may not yet have a recorded publisher. */
  publisher_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  isbn: string | null;
  /** Stored as `numeric(10,2)` in Postgres; the Supabase JS client returns
   *  numeric columns as strings to avoid floating-point precision loss, so
   *  the repository layer parses this to `number` before returning a
   *  `Book` — see `book.repository.ts`'s `mapRow` for where that happens. */
  price: number;
  stock_quantity: number;
  cover_image_url: string | null;
}

/**
 * Shape for creating a book. Omits every server-generated/computed field
 * (`id`, `created_at`, `updated_at`) and makes `slug`, `status`, and every
 * optional/defaulted column optional — the service layer auto-generates
 * `slug` from `title` via `slugify()` (Day 3) when omitted, and defaults
 * `status` to `"active"` and numeric fields to `0`, matching Migration
 * 0002's own column defaults so behavior stays identical whether a value
 * came from this app or a direct SQL insert.
 */
export interface BookInsert {
  category_id: string;
  subcategory_id?: string | null;
  author_id: string;
  publisher_id?: string | null;
  title: string;
  slug?: string;
  description?: string | null;
  isbn?: string | null;
  price?: number;
  stock_quantity?: number;
  cover_image_url?: string | null;
  status?: Book["status"];
}

/**
 * Shape for updating a book. Every field optional (a partial patch) except
 * that identity/foreign-key fields, once present, must still be valid —
 * validated by `book.validation.ts` before `book.service.ts` calls the
 * repository, not by this type alone.
 */
export type BookUpdate = Partial<BookInsert>;
