import { createClient } from "@/lib/supabase/client";

/**
 * author-publisher.storefront.ts — Sprint 18 (recreated).
 *
 * `Author`/`Publisher`'s full type shape was never uploaded in this
 * conversation — only their `.name` field is confirmed (via
 * `author.service.ts`'s own doc comment). To avoid asserting an unverified
 * full type, these functions return only `{ id, name }`, which is all the
 * storefront actually needs for display, and all that's actually confirmed
 * to exist.
 */

export interface PublicNameRecord {
  id: string;
  name: string;
}

export async function listPublicAuthorNames(): Promise<PublicNameRecord[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("authors").select("id, name");
  if (error) throw error;
  return (data ?? []) as PublicNameRecord[];
}

export async function listPublicPublisherNames(): Promise<PublicNameRecord[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("publishers").select("id, name");
  if (error) throw error;
  return (data ?? []) as PublicNameRecord[];
}

export async function getPublicAuthorName(id: string): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("authors").select("name").eq("id", id).maybeSingle();
  if (error) throw error;
  return data?.name ?? null;
}

export async function getPublicPublisherName(id: string): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("publishers").select("name").eq("id", id).maybeSingle();
  if (error) throw error;
  return data?.name ?? null;
}
