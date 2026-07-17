import { createClient } from "@/lib/supabase/client";
import { STORAGE_BUCKETS, IMAGE_UPLOAD_CONSTRAINTS } from "@/constants/storage.constants";
import { slugify } from "@/lib/helpers/string.helpers";
import type { ApiResponse } from "@/types/common.types";

/**
 * Image Upload Service — Sprint 10 (Task 11).
 *
 * Uploads book cover images to the `book-covers` Supabase Storage bucket
 * (created by Migration 0002, this sprint). Uses `@/lib/supabase/client`
 * (Day 1's browser client), not the server client `book.repository.ts`
 * uses — a file upload originates from a browser file input in whatever
 * future admin form uses this, so it belongs in the same client-side
 * context `AuthService` (Sprint 05) already establishes for
 * browser-originated Supabase calls.
 *
 * Returns the app-wide `ApiResponse<T>` contract (Day 3), the same
 * "never throws, always a consistent shape" choice `book.service.ts`
 * makes — a future `useBookForm` (this sprint) or form component checks
 * `.error` rather than wrapping every call in try/catch.
 */

export interface UploadedImage {
  path: string;
  publicUrl: string;
}

/** Validates a file against `IMAGE_UPLOAD_CONSTRAINTS`
 *  (`@/constants/storage.constants`) before ever calling Supabase — the
 *  same "validate before the network call" discipline
 *  `book.validation.ts` applies to form data. */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!IMAGE_UPLOAD_CONSTRAINTS.ALLOWED_MIME_TYPES.includes(file.type as never)) {
    return { valid: false, error: "Only JPEG, PNG, or WEBP images are allowed." };
  }
  if (file.size > IMAGE_UPLOAD_CONSTRAINTS.MAX_FILE_SIZE_BYTES) {
    const maxMb = IMAGE_UPLOAD_CONSTRAINTS.MAX_FILE_SIZE_BYTES / (1024 * 1024);
    return { valid: false, error: `Image must be smaller than ${maxMb}MB.` };
  }
  return { valid: true };
}

/** Builds a collision-resistant storage path: a timestamp plus a
 *  slugified filename, optionally namespaced under a book id so a book's
 *  covers stay grouped together in the bucket once it has a real id
 *  (a new book being created doesn't have one yet — falls back to
 *  `"unassigned"`, matching this service's "usable before a book row
 *  exists" requirement for a create form's image picker). */
function buildStoragePath(file: File, bookId?: string): string {
  const extension = file.name.split(".").pop() ?? "jpg";
  const base = slugify(file.name.replace(/\.[^/.]+$/, "")) || "cover";
  const filename = `${Date.now()}-${base}.${extension}`;
  return `${bookId ?? "unassigned"}/${filename}`;
}

export async function uploadBookCoverImage(
  file: File,
  bookId?: string
): Promise<ApiResponse<UploadedImage>> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    return { data: null, error: { message: validation.error!, code: "INVALID_FILE" } };
  }

  const supabase = createClient();
  const path = buildStoragePath(file, bookId);

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKETS.BOOK_COVERS)
    .upload(path, file, { upsert: false, contentType: file.type });

  if (uploadError) {
    return { data: null, error: { message: uploadError.message } };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(STORAGE_BUCKETS.BOOK_COVERS).getPublicUrl(path);

  return { data: { path, publicUrl }, error: null };
}

/** Deletes a previously-uploaded cover image by its storage path (not its
 *  public URL) — used when a book's cover is replaced or the book itself
 *  is deleted, so orphaned files don't accumulate in the bucket. */
export async function deleteBookCoverImage(path: string): Promise<ApiResponse<null>> {
  const supabase = createClient();
  const { error } = await supabase.storage.from(STORAGE_BUCKETS.BOOK_COVERS).remove([path]);

  if (error) {
    return { data: null, error: { message: error.message } };
  }
  return { data: null, error: null };
}
