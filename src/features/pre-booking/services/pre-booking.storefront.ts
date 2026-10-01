import { createClient } from "@/lib/supabase/client";
import type { Book } from "@/types/book.types";

export async function listOpenPreBookings(): Promise<Book[]> {
  const supabase = createClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("status", "active")
    .eq("prebooking_enabled", true)
    .lte("prebooking_start_at", now)
    .gte("prebooking_end_at", now)
    .order("prebooking_end_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Book[];
}