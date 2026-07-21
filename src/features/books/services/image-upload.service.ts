import { createClient } from "@/lib/supabase/client";
import { STORAGE_BUCKETS, IMAGE_UPLOAD_CONSTRAINTS, type StorageBucket } from "@/constants/storage.constants";
import { slugify } from "@/lib/helpers/string.helpers";
import type { ApiResponse } from "@/types/common.types";

/**
 * Image Upload Service — Sprint 10 (Task 11), generalized Sprint 11.
 *
 * Uploads images to Supabase Storage. Uses `@/lib/supabase/client` (Day 1's
 * browser client), not the server client the repositories use — a file
 * upload originates from a browser file input, the same reasoning that
 * keeps `AuthService` (Sprint 05) on the browser client too.
 *
 * Returns the app-wide `ApiResponse<T>` contract (Day 3) — never throws.
 *
 * **Sprint 11 update:** Requirements explicitly call for reusing this
 * service for `authors.photo_url` rather than writing a second, near-
 * identical upload service. The upload/delete logic is now extracted into
 * bucket-parameterized internal helpers (`uploadToBucket`/
 * `deleteFromBucket`); `uploadBookCoverImage`/`deleteBookCoverImage` keep
 * their exact original Sprint 10 signatures and behavior (calling the
 * helpers with `STORAGE_BUCKETS.BOOK_COVERS`), and the new
 * `uploadAuthorPhoto`/`deleteAuthorPhoto` call the same helpers with
 * `STORAGE_BUCKETS.AUTHOR_PHOTOS` (Migration 0003, this sprint). No
 * existing call site needed to change.
 */

export interface UploadedImage {
  path: string;
  publicUrl: string;
}

/** Validates a file against `IMAGE_UPLOAD_CONSTRAINTS`
 *  (`@/constants/storage.constants`) before ever calling Supabase — the
 *  same "validate before the network call" discipline
 *  `book.validation.ts` applies to form data. Shared by every image type
 *  this service handles — the constraints (allowed types, max size)
 *  aren't book-specific. */
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
 *  slugified filename, optionally namespaced under an owning record's id
 *  so its images stay grouped together in the bucket once it has a real
 *  id (a new record being created doesn't have one yet — falls back to
 *  `"unassigned"`, so a create form's image picker works before the
 *  record is persisted). Generic over what that owning record is (a
 *  book, an author, ...) — it only ever needed an id and a file. */
function buildStoragePath(file: File, ownerId?: string): string {
  const extension = file.name.split(".").pop() ?? "jpg";
  const base = slugify(file.name.replace(/\.[^/.]+$/, "")) || "image";
  const filename = `${Date.now()}-${base}.${extension}`;
  return `${ownerId ?? "unassigned"}/${filename}`;
}

/** Generic upload, parameterized by bucket — the shared implementation
 *  behind every specific `upload*Image`/`upload*Photo` function below. */
async function uploadToBucket(
  bucket: StorageBucket,
  file: File,
  ownerId?: string
): Promise<ApiResponse<UploadedImage>> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    return { data: null, error: { message: validation.error!, code: "INVALID_FILE" } };
  }

  const supabase = createClient();
  const path = buildStoragePath(file, ownerId);

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: false, contentType: file.type });

  if (uploadError) {
    return { data: null, error: { message: uploadError.message } };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);

  return { data: { path, publicUrl }, error: null };
}

/** Generic delete, parameterized by bucket. */
async function deleteFromBucket(bucket: StorageBucket, path: string): Promise<ApiResponse<null>> {
  const supabase = createClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    return { data: null, error: { message: error.message } };
  }
  return { data: null, error: null };
}

/** Uploads a book cover image. Unchanged from Sprint 10 — same signature,
 *  same behavior, now implemented via the shared `uploadToBucket` helper. */
export function uploadBookCoverImage(file: File, bookId?: string): Promise<ApiResponse<UploadedImage>> {
  return uploadToBucket(STORAGE_BUCKETS.BOOK_COVERS, file, bookId);
}

/** Deletes a previously-uploaded cover image by its storage path (not its
 *  public URL) — used when a book's cover is replaced or the book itself
 *  is deleted, so orphaned files don't accumulate in the bucket.
 *  Unchanged from Sprint 10. */
export function deleteBookCoverImage(path: string): Promise<ApiResponse<null>> {
  return deleteFromBucket(STORAGE_BUCKETS.BOOK_COVERS, path);
}

/** Uploads an author photo (Sprint 11) — reuses the exact same validation,
 *  path-building, and upload logic as book covers, into the
 *  `author-photos` bucket (Migration 0003) instead. */
export function uploadAuthorPhoto(file: File, authorId?: string): Promise<ApiResponse<UploadedImage>> {
  return uploadToBucket(STORAGE_BUCKETS.AUTHOR_PHOTOS, file, authorId);
}

export function deleteAuthorPhoto(path: string): Promise<ApiResponse<null>> {
  return deleteFromBucket(STORAGE_BUCKETS.AUTHOR_PHOTOS, path);
}
