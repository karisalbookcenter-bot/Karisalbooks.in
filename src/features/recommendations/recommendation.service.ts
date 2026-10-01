import { createClient } from "@/lib/supabase/client";
import type { Book } from "@/types/book.types";
import type { Category } from "@/types/category.types";

export interface RecommendationShelf {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  variety_tag: string | null;
  category_id: string | null;
  category_name?: string | null;
  status: "active" | "inactive" | "archived";
  sort_order: number;
  books: Book[];
}

export interface RecommendationShelfInput {
  id?: string;
  title: string;
  description: string;
  varietyTag: string;
  categoryId: string;
  status: "active" | "inactive";
  bookIds: string[];
}

interface ShelfRow extends Omit<RecommendationShelf, "books"> {}

function makeSlug(title: string) {
  const slug = title.trim().toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || `shelf-${Date.now()}`;
}

export async function listRecommendationBooks() {
  const supabase = createClient();
  const [booksResult, categoriesResult] = await Promise.all([
    supabase.from("books").select("id, title, price, status, category_id").eq("status", "active").order("title"),
    supabase.from("categories").select("id, name").eq("status", "active").order("name"),
  ]);
  if (booksResult.error) throw booksResult.error;
  if (categoriesResult.error) throw categoriesResult.error;
  const categoryNames = new Map((categoriesResult.data ?? []).map((category) => [category.id, category.name]));
  return {
    books: (booksResult.data ?? []).map((book) => ({
      ...book,
      categoryName: categoryNames.get(book.category_id) ?? "Uncategorized",
    })),
    categories: (categoriesResult.data ?? []) as Pick<Category, "id" | "name">[],
  };
}

export async function listRecommendationShelves(includeInactive = true): Promise<RecommendationShelf[]> {
  const supabase = createClient();
  let query = supabase.from("recommendation_shelves").select("*").order("sort_order").order("title");
  if (!includeInactive) query = query.eq("status", "active");
  const { data: rows, error } = await query;
  if (error) throw error;
  const shelves = (rows ?? []) as ShelfRow[];
  if (!shelves.length) return [];

  const { data: links, error: linksError } = await supabase
    .from("recommendation_shelf_books")
    .select("shelf_id, book_id, position")
    .in("shelf_id", shelves.map((shelf) => shelf.id))
    .order("position");
  if (linksError) throw linksError;

  const bookIds = [...new Set((links ?? []).map((link) => link.book_id))];
  if (!bookIds.length) return shelves.map((shelf) => ({ ...shelf, books: [] }));

  const [{ data: rowsWithCategories, error: booksError }, { data: categories, error: categoriesError }] = await Promise.all([
    supabase.from("books").select("*").in("id", bookIds).eq("status", "active"),
    supabase.from("categories").select("id, name"),
  ]);
  if (booksError) throw booksError;
  if (categoriesError) throw categoriesError;

  const categoryNames = new Map((categories ?? []).map((category) => [category.id, category.name]));
  const booksById = new Map((rowsWithCategories ?? []).map((row) => [
    row.id,
    { ...row, category_name: categoryNames.get(row.category_id) } as Book,
  ]));
  const linksByShelf = new Map<string, string[]>();
  for (const link of links ?? []) {
    const shelfBooks = linksByShelf.get(link.shelf_id) ?? [];
    shelfBooks.push(link.book_id);
    linksByShelf.set(link.shelf_id, shelfBooks);
  }

  return shelves.map((shelf) => ({
    ...shelf,
    category_name: shelf.category_id ? categoryNames.get(shelf.category_id) ?? null : null,
    books: (linksByShelf.get(shelf.id) ?? []).flatMap((id) => {
      const book = booksById.get(id);
      return book ? [book] : [];
    }),
  }));
}

export async function saveRecommendationShelf(input: RecommendationShelfInput) {
  const supabase = createClient();
  const payload = {
    title: input.title.trim(),
    slug: makeSlug(input.title),
    description: input.description.trim() || null,
    variety_tag: input.varietyTag.trim() || null,
    category_id: input.categoryId || null,
    status: input.status,
  };
  const shelfResult = input.id
    ? await supabase.from("recommendation_shelves").update(payload).eq("id", input.id).select("id").single()
    : await supabase.from("recommendation_shelves").insert(payload).select("id").single();
  if (shelfResult.error) throw shelfResult.error;

  const shelfId = shelfResult.data.id;
  const { error: deleteError } = await supabase.from("recommendation_shelf_books").delete().eq("shelf_id", shelfId);
  if (deleteError) throw deleteError;
  const uniqueBookIds = [...new Set(input.bookIds)];
  if (uniqueBookIds.length) {
    const { error } = await supabase.from("recommendation_shelf_books").insert(
      uniqueBookIds.map((bookId, position) => ({ shelf_id: shelfId, book_id: bookId, position }))
    );
    if (error) throw error;
  }
}

export async function deleteRecommendationShelf(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("recommendation_shelves").delete().eq("id", id);
  if (error) throw error;
}