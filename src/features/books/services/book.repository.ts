import { createClient } from "@/lib/supabase/server";
import type { Book, BookInsert, BookUpdate } from "@/types/book.types";
import type { PaginatedResult, RecordStatus, SortDirection } from "@/types/common.types";
import { slugify } from "@/lib/helpers/string.helpers";

/**
 * Book Repository — Sprint 10 (Task 1).
 *
 * The only file in the project that calls `supabase.from("books")`. Every
 * other Book-related module (service, hooks, a future UI) goes through
 * this layer rather than importing a Supabase client directly — the same
 * separation `docs/AUTH_ARCHITECTURE.md` describes for `auth.service.ts`/
 * `session.service.ts` vs. raw `supabase.auth` calls.
 *
 * Uses `@/lib/supabase/server` (Day 1) — the server-side client — since
 * every write here (create/update/delete) is an admin-privileged
 * operation with no reason to ever run in the browser. `list`/`getById`
 * use the same server client for consistency; a future public storefront
 * read path would use `@/lib/supabase/client` instead, in a separate,
 * public-facing repository/service, not this admin one.
 *
 * Functions throw a plain `Error` on failure rather than returning a
 * result object — `book.service.ts` is the layer responsible for catching
 * and shaping errors into the app's `ApiResponse<T>` contract (Day 3).
 * Keeping this layer "throw on failure" is what lets it stay a thin,
 * literal translation of Supabase calls, with no error-shaping logic of
 * its own to keep in sync with the service layer's.
 */

export interface ListBooksParams {
  page: number;
  pageSize: number;
  search?: string;
  categoryId?: string | null;
  subcategoryId?: string | null;
  authorId?: string | null;
  publisherId?: string | null;
  statuses?: RecordStatus[];
  sortBy?: keyof Book;
  sortDirection?: SortDirection;
}

/** Supabase's JS client returns `numeric` columns as strings to avoid
 *  silent floating-point precision loss — this is the one place that
 *  string is parsed into the `number` the app-wide `Book` type promises. */
function mapRow(row: Record<string, unknown>): Book {
  return {
    ...(row as unknown as Book),
    price: typeof row.price === "string" ? parseFloat(row.price) : (row.price as number),
  };
}

export async function getBookById(id: string): Promise<Book | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("books").select("*").eq("id", id).maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapRow(data) : null;
}

export async function getBookBySlug(slug: string): Promise<Book | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("books").select("*").eq("slug", slug).maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapRow(data) : null;
}

/**
 * Lists books with search, filtering, sorting, and pagination applied
 * server-side — the real, Supabase-backed counterpart to the client-side,
 * in-memory `searchCategories`/`filterCategoriesByStatus`/`sortByKey`/
 * `paginate` pipeline Sprints 08–09 used (appropriate there, since those
 * frameworks had no database to query yet). `{ count: "exact" }` gets an
 * accurate `totalItems` for the same `PaginatedResult<T>` shape (Day 3)
 * every paginated list in this app already returns, so a future
 * `BookTable`/`Pagination` pairing (mirroring Sprint 09's
 * `SubcategoryTable`/`Pagination`) needs no new prop shape to consume this.
 */
export async function listBooks(params: ListBooksParams): Promise<PaginatedResult<Book>> {
  const {
    page,
    pageSize,
    search,
    categoryId,
    subcategoryId,
    authorId,
    publisherId,
    statuses,
    sortBy = "created_at",
    sortDirection = "desc",
  } = params;

  const supabase = await createClient();
  let query = supabase.from("books").select("*", { count: "exact" });

  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    query = query.or(`title.ilike.${term},description.ilike.${term},isbn.ilike.${term}`);
  }
  if (categoryId) query = query.eq("category_id", categoryId);
  if (subcategoryId) query = query.eq("subcategory_id", subcategoryId);
  if (authorId) query = query.eq("author_id", authorId);
  if (publisherId) query = query.eq("publisher_id", publisherId);
  if (statuses && statuses.length > 0) query = query.in("status", statuses);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query
    .order(sortBy, { ascending: sortDirection === "asc" })
    .range(from, to);

  if (error) throw new Error(error.message);

  const totalItems = count ?? 0;

  return {
    items: (data ?? []).map(mapRow),
    page,
    pageSize,
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
  };
}

/** Inserts a book. Auto-generates `slug` from `title` via `slugify()`
 *  (Day 3) when the caller didn't supply one — the same auto-slug UX
 *  `CategoryFormLayout`/`SubcategoryFormLayout` give client-side
 *  (Sprints 08–09), enforced here too since a direct service/repository
 *  call (e.g. a future seed script) might skip the form entirely. */
export async function createBook(input: BookInsert): Promise<Book> {
  const supabase = await createClient();
  const payload = {
    ...input,
    slug: input.slug?.trim() || slugify(input.title),
  };

  const { data, error } = await supabase.from("books").insert(payload).select().single();

  if (error) throw new Error(error.message);
  return mapRow(data);
}

export async function updateBook(id: string, input: BookUpdate): Promise<Book> {
  const supabase = await createClient();
  const payload = {
    ...input,
    ...(input.title && !input.slug ? { slug: slugify(input.title) } : {}),
  };

  const { data, error } = await supabase.from("books").update(payload).eq("id", id).select().single();

  if (error) throw new Error(error.message);
  return mapRow(data);
}

export async function deleteBook(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("books").delete().eq("id", id);

  if (error) throw new Error(error.message);
}

/** Bulk status update — the repository-layer counterpart to the bulk
 *  action *ids* `BulkActionBar` (Sprint 08) already reports; a future
 *  admin Book screen's "Activate"/"Deactivate"/"Archive" bulk actions
 *  would call this once wired up (not done this sprint — no UI exists
 *  yet, per Sprint 10's scope). */
export async function updateBooksStatus(ids: string[], status: RecordStatus): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("books").update({ status }).in("id", ids);

  if (error) throw new Error(error.message);
}

export async function deleteBooks(ids: string[]): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("books").delete().in("id", ids);

  if (error) throw new Error(error.message);
}
