import { createClient } from "@/lib/supabase/client";
import type {
  Book,
  BookInsert,
  BookUpdate,
} from "@/types/book.types";

import type {
  PaginatedResult,
  RecordStatus,
  SortDirection,
} from "@/types/common.types";

import { slugify } from "@/lib/helpers/string.helpers";
import { isUniqueSlugViolation, saveWithUniqueSlug } from "@/lib/helpers/unique-slug.helpers";



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





function mapRow(
  row: Record<string, unknown>
): Book {

  return {

    ...(row as unknown as Book),

    price:
      typeof row.price === "string"
        ? Number(row.price)
        : (row.price as number),

  };

}







export async function getBookById(
  id: string
): Promise<Book | null> {


  const supabase =
    await createClient();


  const {
    data,
    error,
  } =
    await supabase
      .from("books")
      .select("*")
      .eq("id", id)
      .maybeSingle();



  if (error) {

    throw new Error(
      error.message
    );

  }


  return data
    ? mapRow(data)
    : null;

}








export async function getBookBySlug(
  slug: string
): Promise<Book | null> {


  const supabase =
    await createClient();


  const {
    data,
    error,
  } =
    await supabase
      .from("books")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();



  if (error) {

    throw new Error(
      error.message
    );

  }


  return data
    ? mapRow(data)
    : null;

}









export async function listBooks(
  params: ListBooksParams
): Promise<PaginatedResult<Book>> {


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




  const supabase =
    await createClient();



  let query =
    supabase
      .from("books")
      .select("*", {
        count: "exact",
      });





  if (
    search &&
    search.trim()
  ) {


    const term =
      `%${search.trim()}%`;


    query =
      query.or(
        `title.ilike.${term},description.ilike.${term},isbn.ilike.${term}`
      );

  }






  if (categoryId) {

    query =
      query.eq(
        "category_id",
        categoryId
      );

  }



  if (subcategoryId) {

    query =
      query.eq(
        "subcategory_id",
        subcategoryId
      );

  }



  if (authorId) {

    query =
      query.eq(
        "author_id",
        authorId
      );

  }



  if (publisherId) {

    query =
      query.eq(
        "publisher_id",
        publisherId
      );

  }



  if (
    statuses &&
    statuses.length > 0
  ) {

    query =
      query.in(
        "status",
        statuses
      );

  }






  const from =
    (page - 1) * pageSize;


  const to =
    from + pageSize - 1;




  const {

    data,

    error,

    count,

  } =
    await query
      .order(
        sortBy,
        {
          ascending:
            sortDirection === "asc",
        }
      )
      .range(
        from,
        to
      );




  if (error) {

    throw new Error(
      error.message
    );

  }



  return {

    items:
      (data ?? [])
        .map(mapRow),


    page,


    pageSize,


    totalItems:
      count ?? 0,


    totalPages:
      Math.max(
        1,
        Math.ceil(
          (count ?? 0) / pageSize
        )
      ),

  };

}









export async function createBook(
  input: BookInsert
): Promise<Book> {
  const supabase =
    await createClient();
  const baseSlug = input.slug?.trim() || slugify(input.title);

  return saveWithUniqueSlug({
    baseSlug,
    fallbackSlug: "book",
    exists: async (slug) => {
      const { data, error } = await supabase.from("books").select("id").eq("slug", slug).maybeSingle();
      if (error) throw new Error(error.message);
      return Boolean(data);
    },
    save: async (slug) => {
      const { data, error } = await supabase.from("books").insert({ ...input, slug }).select().single();
      if (error) throw error;
      return mapRow(data);
    },
    isSlugConflict: (error) => isUniqueSlugViolation(error, "books"),
  });
}









export async function updateBook(
  id: string,
  input: BookUpdate
): Promise<Book> {


  const supabase =
    await createClient();



  const baseSlug = input.slug?.trim() || (input.title ? slugify(input.title) : "");

  if (!baseSlug) {
    const { data, error } = await supabase.from("books").update(input).eq("id", id).select("*");
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) throw new Error("Book update failed. No record returned.");
    return mapRow(data[0]);
  }

  return saveWithUniqueSlug({
    baseSlug,
    fallbackSlug: "book",
    excludeId: id,
    exists: async (slug) => {
      const { data, error } = await supabase.from("books").select("id").eq("slug", slug).neq("id", id).maybeSingle();
      if (error) throw new Error(error.message);
      return Boolean(data);
    },
    save: async (slug) => {
      const { data, error } = await supabase.from("books").update({ ...input, slug }).eq("id", id).select("*");
      if (error) throw error;
      if (!data || data.length === 0) throw new Error("Book update failed. No record returned.");
      return mapRow(data[0]);
    },
    isSlugConflict: (error) => isUniqueSlugViolation(error, "books"),
  });
}

export async function deleteBook(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("books").delete().eq("id", id);
  if (error) throw new Error(error.message);
}









export async function updateBooksStatus(
  ids: string[],
  status: RecordStatus
): Promise<void> {


  const supabase =
    await createClient();



  const {
    error,
  } =
    await supabase
      .from("books")
      .update({
        status,
      })
      .in(
        "id",
        ids
      );



  if (error) {

    throw new Error(
      error.message
    );

  }

}









export async function deleteBooks(
  ids: string[]
): Promise<void> {

  const supabase = await createClient();
  const { error } = await supabase.from("books").delete().in("id", ids);
  if (error) throw new Error(error.message);
}