import { createClient } from "@/lib/supabase/client";
import { PUBLIC_VISIBLE_STATUS } from "../constants";
import type { Book } from "@/types/book.types";
import type { PaginatedResult } from "@/types/common.types";

/**
 * book.storefront.ts — Sprint 18 (recreated).
 *
 * Deliberately NOT importing or calling `@/features/books/services/book.repository.ts`
 * or `book.service.ts` — the admin book repository uses the SERVER
 * Supabase client (`@/lib/supabase/server`, confirmed via project grep),
 * which cannot run inside a `"use client"` page. Rather than modify that
 * admin file (explicitly out of scope) or risk another server/client
 * mismatch, this is a completely separate, storefront-owned read path
 * against the SAME `books` table, using ONLY the browser client
 * (`@/lib/supabase/client`) — safe to call directly from any
 * `"use client"` page.
 *
 * Only reads `Book`'s type shape (already confirmed from your uploaded
 * `book.types.ts`) — no admin code path is touched or depended on at
 * runtime.
 */

export interface ListPublicBooksParams {
  search?: string;
  categoryId?: string;
  subcategoryId?: string;
  page?: number;
  pageSize?: number;
}

export async function listPublicBooks(
  params: ListPublicBooksParams
): Promise<PaginatedResult<Book>> {
  const supabase = createClient();

  const {
    page = 1,
    pageSize = 12,
  } = params;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await supabase
    .from("books")
    .select("*", { count: "exact" })
    .range(from, to);

  if (error) throw error;

  const totalItems = count ?? 0;

 return {
  items: (data ?? []) as Book[],
  page,
  pageSize,
  totalItems,
  totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
};
}

export async function getPublicBookBySlug(slug: string): Promise<Book | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("slug", slug)
    .eq("status", PUBLIC_VISIBLE_STATUS)
    .maybeSingle();
  if (error) throw error;
  return (data as Book | null) ?? null;
}
