import { createClient } from "@/lib/supabase/server";
import { createSupabaseRepository } from "@/services/createSupabaseRepository";
import type { Publisher, PublisherInsert, PublisherUpdate } from "@/types/publisher.types";

/**
 * Publisher Repository — Sprint 11 (Tasks 2, 13).
 *
 * Mirrors `author.repository.ts` exactly — CRUD/search/pagination from
 * the generic `createSupabaseRepository` factory, plus one
 * publisher-specific addition for the Book ↔ Publisher relationship
 * (Task 13), the same reasoning `getBookCountForAuthor` documents.
 */
export const publisherRepository = createSupabaseRepository<Publisher, PublisherInsert, PublisherUpdate>({
  table: "publishers",
  searchableColumns: ["name", "slug", "description"],
});

/** Book ↔ Publisher relationship support (Task 13) — counts books
 *  referencing this publisher (`books.publisher_id`, nullable in
 *  Migration 0002, unlike `author_id`). */
export async function getBookCountForPublisher(publisherId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("books")
    .select("id", { count: "exact", head: true })
    .eq("publisher_id", publisherId);

  if (error) throw new Error(error.message);
  return count ?? 0;
}
