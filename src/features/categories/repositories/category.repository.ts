import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/types/category.types";
import type { PaginatedResult, SortDirection } from "@/types/common.types";

/**
 * category.repository.ts — Sprint 16
 */

export interface CategoryInsert {
  name: string;
  slug: string;
  description?: string | null;
  parent_id?: string | null;
  status?: Category["status"];
}

export type CategoryUpdate = Partial<CategoryInsert>;

export interface ListCategoriesParams {
  search?: string;
  status?: Category["status"];
  sortBy?: string;
  sortDirection?: SortDirection;
  page?: number;
  pageSize?: number;
}

export const categoryRepository = {
  async list(
    params: ListCategoriesParams = {}
  ): Promise<PaginatedResult<Category>> {
    const supabase = createClient();

    const {
      search,
      status,
      sortBy = "name",
      sortDirection = "asc",
      page = 1,
      pageSize = 20,
    } = params;

    let query = supabase
      .from("categories")
      .select("*", { count: "exact" });

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    if (status) {
      query = query.eq("status", status);
    }

    query = query.order(sortBy, {
      ascending: sortDirection === "asc",
    });

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await query.range(from, to);

    if (error) throw error;

    const totalItems = count ?? 0;

    return {
      items: (data ?? []) as Category[],
      page,
      pageSize,
      totalItems,
      totalPages: Math.max(
        1,
        Math.ceil(totalItems / pageSize)
      ),
    };
  },

  async getById(id: string): Promise<Category | null> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;

    return (data as Category | null) ?? null;
  },

  async create(payload: CategoryInsert): Promise<Category> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("categories")
      .insert(payload)
      .select("*")
      .single();

    if (error) throw error;

    return data as Category;
  },

  async update(
    id: string,
    payload: CategoryUpdate
  ): Promise<Category> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("categories")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    return data as Category;
  },

  async remove(id: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async removeMany(ids: string[]): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
      .from("categories")
      .delete()
      .in("id", ids);

    if (error) throw error;
  },

  async updateStatusMany(
    ids: string[],
    status: Category["status"]
  ): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
      .from("categories")
      .update({ status })
      .in("id", ids);

    if (error) throw error;
  },
};