import { createClient } from "@/lib/supabase/server";
import type { BaseEntity, PaginatedResult, RecordStatus, SortDirection } from "@/types/common.types";
import { slugify } from "@/lib/helpers/string.helpers";

/**
 * Generic Supabase repository factory — Sprint 11.
 *
 * Sprint 10's `book.repository.ts` established the repository pattern
 * (thin, literal Supabase calls; throw on failure; `book.service.ts`
 * shapes errors) by hand, for one entity. Sprint 11 needs the *identical*
 * logic for two more entities (`authors`, `publishers`) that are
 * structurally simple and nearly identical to each other (`id`, `name`,
 * `slug`, one optional detail field, one optional link field, `status`,
 * timestamps — no self-reference, no required foreign key, unlike
 * `Category`'s `parent_id` or `Book`'s required `category_id`/`author_id`).
 * Hand-writing `author.repository.ts` and `publisher.repository.ts` as
 * two more near-identical copies of `book.repository.ts` would be exactly
 * the "duplicate code" this sprint's rules explicitly forbid — so this
 * factory extracts the identical *shape* once, and `author.repository.ts`/
 * `publisher.repository.ts` (this sprint) call it with just their table
 * name and searchable columns.
 *
 * `book.repository.ts` itself is deliberately **not** refactored to use
 * this factory — that would be modifying completed Sprint 10 architecture
 * without a Sprint 11 task asking for it. This factory exists for new
 * consumers; retrofitting Book onto it is a future sprint's call, not
 * this one's.
 */

export interface SimpleCatalogEntity extends BaseEntity {
  name: string;
  slug: string;
}

export interface SimpleCatalogInsert {
  name: string;
  slug?: string;
  status?: RecordStatus;
  [key: string]: unknown;
}

export type SimpleCatalogUpdate = Partial<SimpleCatalogInsert>;

export interface ListParams {
  page: number;
  pageSize: number;
  search?: string;
  statuses?: RecordStatus[];
  sortBy?: string;
  sortDirection?: SortDirection;
}

export interface SupabaseRepositoryConfig {
  /** The Postgres table name, e.g. `"authors"`. */
  table: string;
  /** Columns `ilike`-searched when `list()` is called with `search` —
   *  e.g. `["name", "slug", "bio"]` for authors. */
  searchableColumns: string[];
  /** Column `list()` sorts by when no `sortBy` is given. Defaults to
   *  `"created_at"`, matching `book.repository.ts`'s own default. */
  defaultSortBy?: string;
}

export interface SupabaseRepository<
  T extends SimpleCatalogEntity,
  TInsert extends SimpleCatalogInsert,
  TUpdate extends SimpleCatalogUpdate,
> {
  getById(id: string): Promise<T | null>;
  getBySlug(slug: string): Promise<T | null>;
  list(params: ListParams): Promise<PaginatedResult<T>>;
  create(input: TInsert): Promise<T>;
  update(id: string, input: TUpdate): Promise<T>;
  remove(id: string): Promise<void>;
  bulkUpdateStatus(ids: string[], status: RecordStatus): Promise<void>;
  bulkRemove(ids: string[]): Promise<void>;
}

/**
 * Builds a full repository for one table. Every method matches
 * `book.repository.ts`'s equivalent function 1:1 in behavior (same
 * `.or()` search construction, same `.range()` + `{ count: "exact" }`
 * pagination, same auto-slug-from-name on create, same "throw a plain
 * Error, let the service layer shape it" contract) — just generic over
 * table/entity instead of hardcoded to `"books"`.
 */
export function createSupabaseRepository<
  T extends SimpleCatalogEntity,
  TInsert extends SimpleCatalogInsert,
  TUpdate extends SimpleCatalogUpdate,
>(config: SupabaseRepositoryConfig): SupabaseRepository<T, TInsert, TUpdate> {
  const { table, searchableColumns, defaultSortBy = "created_at" } = config;

  async function getById(id: string): Promise<T | null> {
    const supabase = await createClient();
    const { data, error } = await supabase.from(table).select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return (data as T | null) ?? null;
  }

  async function getBySlug(slug: string): Promise<T | null> {
    const supabase = await createClient();
    const { data, error } = await supabase.from(table).select("*").eq("slug", slug).maybeSingle();
    if (error) throw new Error(error.message);
    return (data as T | null) ?? null;
  }

  async function list(params: ListParams): Promise<PaginatedResult<T>> {
    const { page, pageSize, search, statuses, sortBy = defaultSortBy, sortDirection = "desc" } = params;

    const supabase = await createClient();
    let query = supabase.from(table).select("*", { count: "exact" });

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query = query.or(searchableColumns.map((column) => `${column}.ilike.${term}`).join(","));
    }
    if (statuses && statuses.length > 0) {
      query = query.in("status", statuses);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query
      .order(sortBy, { ascending: sortDirection === "asc" })
      .range(from, to);

    if (error) throw new Error(error.message);

    const totalItems = count ?? 0;

    return {
      items: (data ?? []) as T[],
      page,
      pageSize,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
    };
  }

  async function create(input: TInsert): Promise<T> {
    const supabase = await createClient();
    const payload = { ...input, slug: input.slug?.trim() || slugify(input.name) };

    const { data, error } = await supabase.from(table).insert(payload).select().single();
    if (error) throw new Error(error.message);
    return data as T;
  }

  async function update(id: string, input: TUpdate): Promise<T> {
    const supabase = await createClient();
    const payload = {
      ...input,
      ...(input.name && !input.slug ? { slug: slugify(input.name as string) } : {}),
    };

    const { data, error } = await supabase.from(table).update(payload).eq("id", id).select().single();
    if (error) throw new Error(error.message);
    return data as T;
  }

  async function remove(id: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  async function bulkUpdateStatus(ids: string[], status: RecordStatus): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase.from(table).update({ status }).in("id", ids);
    if (error) throw new Error(error.message);
  }

  async function bulkRemove(ids: string[]): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase.from(table).delete().in("id", ids);
    if (error) throw new Error(error.message);
  }

  return { getById, getBySlug, list, create, update, remove, bulkUpdateStatus, bulkRemove };
}
