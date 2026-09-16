import { createClient } from "@/lib/supabase/client";
import { PUBLIC_VISIBLE_STATUS } from "../constants";
import type { Subcategory } from "@/types/subcategory.types";

export async function listPublicSubcategoriesByCategory(categoryId: string): Promise<Subcategory[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("subcategories")
    .select("*")
    .eq("category_id", categoryId)
    .eq("status", PUBLIC_VISIBLE_STATUS)
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Subcategory[];
}
