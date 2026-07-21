import { createClient } from "@/lib/supabase/server";
import { createSupabaseRepository } from "@/services/createSupabaseRepository";
import type { Author, AuthorInsert, AuthorUpdate } from "@/types/author.types";

/**
 * Author Repository — Sprint 11 (Tasks 1, 12).
 *
 * `getById`/`getBySlug`/`list`/`create`/`update`/`remove`/
 * `bulkUpdateStatus`/`bulkRemove` all come from the generic
 * `createSupabaseRepository` factory (this sprint) — see that file's own
 * doc comment for why hand-writing these again here would be duplicate
 * code. This file adds exactly one thing the factory doesn't know how to
 * do generically: querying a *different* table (`books`) for the
 * Book ↔ Author relationship (Task 12).
 */
export const authorRepository = createSupabaseRepository<Author, AuthorInsert, AuthorUpdate>({
  table: "authors",
  searchableColumns: ["name", "slug", "bio"],
});

/**
 * Book ↔ Author relationship support (Task 12).
 *
 * Counts how many books reference this author (`books.author_id`,
 * Sprint 10's Migration 0002) — the figure a future `AuthorCard`/
 * `AuthorTable` shows (mirroring how Sprint 08's `CategoryCard` shows a
 * subcategory count via `countDescendants`). Uses `{ count: "exact",
 * head: true }` so Supabase returns only the count, not the rows
 * themselves — this never needs to fetch a single book to answer "how
 * many."
 *
 * Deliberately implemented here, in `features/authors/`, rather than by
 * modifying `book.repository.ts` (Sprint 10) — `listBooks({ authorId })`
 * already exists there and is reused directly wherever the actual book
 * rows are needed (e.g. a future "Books by this author" screen); this
 * function only adds the *count*, which `book.repository.ts` has no
 * existing method for and which belongs conceptually to "what does an
 * author page need to show," not to the Book repository itself.
 */
export async function getBookCountForAuthor(authorId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("books")
    .select("id", { count: "exact", head: true })
    .eq("author_id", authorId);

  if (error) throw new Error(error.message);
  return count ?? 0;
}
