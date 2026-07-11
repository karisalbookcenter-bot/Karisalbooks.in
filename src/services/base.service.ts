import type { BaseEntity } from "@/types/common.types";

/**
 * Defines the *shape* every future data service will follow (the
 * repository pattern): a thin layer between a feature and Supabase, so
 * feature code never calls `supabase.from(...)` directly.
 *
 * No method here is implemented — this milestone only establishes the
 * contract. A future service (e.g. a `BooksService`) will implement this
 * interface using `@/lib/supabase/client` or `@/lib/supabase/server`,
 * once the Books feature/API milestone begins.
 */
export interface BaseService<T extends BaseEntity> {
  getById(id: string): Promise<T | null>;
  list(): Promise<T[]>;
}
