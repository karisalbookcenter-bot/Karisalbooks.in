import { createClient } from "@/lib/supabase/client";
import { PUBLIC_VISIBLE_STATUS } from "../constants";
import type { Category } from "@/types/category.types";

/**
 * category.storefront.ts — Sprint 18 (recreated). Same reasoning as
 * book.storefront.ts: independent of any admin category service/repository,
 * browser client only.
 */

export async function listPublicCategories(): Promise<Category[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("status", PUBLIC_VISIBLE_STATUS)
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Category[];
}

export async function getPublicCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .eq("status", PUBLIC_VISIBLE_STATUS)
    .maybeSingle();
  if (error) throw error;
  return (data as Category | null) ?? null;
}
