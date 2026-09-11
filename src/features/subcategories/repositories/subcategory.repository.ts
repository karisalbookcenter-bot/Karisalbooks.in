import { createClient } from "@/lib/supabase/client";
import type { Subcategory } from "@/types/subcategory.types";
import type { PaginatedResult, SortDirection } from "@/types/common.types";

/**
 * subcategory.repository.ts — Sprint 16 (fix pass v2, verified against
 * real subcategory.types.ts). Same fix as category.repository.ts:
 * subcategory.types.ts exports only `Subcategory`, no Insert/Update
 * types — defined locally here instead.
 */

export interface SubcategoryInsert {
  category_id: string;
  name: string;
  slug: string;
  description?: string | null;
  status?: Subcategory["status"];
}

export type SubcategoryUpdate = Partial<SubcategoryInsert>;

export interface ListSubcategoriesParams {
  categoryId?: string;
  search?: string;
  status?: Subcategory["status"];
  sortBy?: string;
  sortDirection?: SortDirection;
  page?: number;
  pageSize?: number;
}

export const subcategoryRepository = {
  async list(params: ListSubcategoriesParams = {}): Promise<PaginatedResult<Subcategory>> {
    const supabase = createClient();
    const {
      categoryId,
      search,
      status,
      sortBy = "name",
      sortDirection = "asc",
      page = 1,
      pageSize = 20,
    } = params;

    let query = supabase.from("subcategories").select("*", { count: "exact" });
    if (categoryId) query = query.eq("category_id", categoryId);
    if (search) query = query.ilike("name", `%${search}%`);
    if (status) query = query.eq("status", status);
    query = query.order(sortBy, { ascending: sortDirection === "asc" });

    const from = (page - 1) * pageSize;
    const { data, count, error } = await query.range(from, from + pageSize - 1);
    if (error) throw error;

    return { items: (data ?? []) as Subcategory[], total: count ?? 0, page, pageSize };
  },

  async getById(id: string): Promise<Subcategory | null> {
    const supabase = createClient();
    const { data, error } = await supabase.from("subcategories").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as Subcategory | null) ?? null;
  },

  async create(payload: SubcategoryInsert): Promise<Subcategory> {
    const supabase = createClient();
    const { data, error } = await supabase.from("subcategories").insert(payload).select("*").single();
    if (error) throw error;
    return data as Subcategory;
  },

  async update(id: string, payload: SubcategoryUpdate): Promise<Subcategory> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("subcategories")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return data as Subcategory;
  },

  async remove(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("subcategories").delete().eq("id", id);
    if (error) throw error;
  },

  async removeMany(ids: string[]): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("subcategories").delete().in("id", ids);
    if (error) throw error;
  },

  async updateStatusMany(ids: string[], status: Subcategory["status"]): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("subcategories").update({ status }).in("id", ids);
    if (error) throw error;
  },
};
