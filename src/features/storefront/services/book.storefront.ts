import { createClient } from "@/lib/supabase/client";
import { PUBLIC_VISIBLE_STATUS } from "../constants";
import { listPublicCategories } from "./category.storefront";
import type { Book } from "@/types/book.types";
import type { PaginatedResult } from "@/types/common.types";

let categoryNamesPromise: Promise<Map<string, string>> | null = null;

async function addCategoryNames(books: Book[]) {
  if (!categoryNamesPromise) {
    categoryNamesPromise = listPublicCategories()
      .then((categories) => new Map(categories.map((category) => [category.id, category.name])))
      .catch((error) => {
        categoryNamesPromise = null;
        throw error;
      });
  }

  const categoryNames = await categoryNamesPromise;
  return books.map((book) => ({ ...book, category_name: categoryNames.get(book.category_id) }));
}

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
  authorId?: string;
  publisherId?: string;
  availability?: "all" | "in-stock" | "out-of-stock";
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "newest" | "title" | "price-asc" | "price-desc";
  page?: number;
  pageSize?: number;
}

function isMissingPrebookingSchema(error: { code?: string; message?: string }) {
  return error.code === "42703" && Boolean(error.message?.includes("prebooking_"));
}

export async function listPublicBooks(
  params: ListPublicBooksParams
): Promise<PaginatedResult<Book>> {
  const supabase = createClient();

  const {
    search,
    categoryId,
    subcategoryId,
    authorId,
    publisherId,
    availability = "all",
    minPrice,
    maxPrice,
    sortBy = "newest",
    page = 1,
    pageSize = 12,
  } = params;

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const buildQuery = (filterPrebookings: boolean) => {
    let query = supabase
      .from("books")
      .select("*", { count: "exact" })
      .eq("status", PUBLIC_VISIBLE_STATUS);
    if (filterPrebookings) query = query.or(`prebooking_enabled.eq.false,prebooking_end_at.lte.${new Date().toISOString()}`);
    if (search?.trim()) query = query.ilike("title", `%${search.trim()}%`);
    if (categoryId) query = query.eq("category_id", categoryId);
    if (subcategoryId) query = query.eq("subcategory_id", subcategoryId);
    if (authorId) query = query.eq("author_id", authorId);
    if (publisherId) query = query.eq("publisher_id", publisherId);
    if (availability === "in-stock") query = query.gt("stock_quantity", 0);
    if (availability === "out-of-stock") query = query.eq("stock_quantity", 0);
    if (minPrice !== undefined) query = query.gte("price", minPrice);
    if (maxPrice !== undefined) query = query.lte("price", maxPrice);
    return query;
  };

  const sortColumn = sortBy === "title" ? "title" : sortBy.startsWith("price") ? "price" : "created_at";
  const ascending = sortBy === "title" || sortBy === "price-asc";
  let result = await buildQuery(true)
    .order(sortColumn, { ascending })
    .range(from, to);
  if (result.error && isMissingPrebookingSchema(result.error)) {
    result = await buildQuery(false).order(sortColumn, { ascending }).range(from, to);
  }

  if (result.error) throw result.error;

  const totalItems = result.count ?? 0;

 return {
  items: await addCategoryNames((result.data ?? []) as Book[]),
  page,
  pageSize,
  totalItems,
  totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
};
}

export async function getPublicBookBySlug(slug: string): Promise<Book | null> {
  const supabase = createClient();
  const findBook = (filterPrebookings: boolean) => {
    let query = supabase.from("books").select("*").eq("slug", slug).eq("status", PUBLIC_VISIBLE_STATUS);
    if (filterPrebookings) query = query.or(`prebooking_enabled.eq.false,prebooking_end_at.lte.${new Date().toISOString()}`);
    return query.maybeSingle();
  };
  let result = await findBook(true);
  if (result.error && isMissingPrebookingSchema(result.error)) result = await findBook(false);
  if (result.error) throw result.error;
  if (!result.data) return null;
  return (await addCategoryNames([result.data as Book]))[0];
}
