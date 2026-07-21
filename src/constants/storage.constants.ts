/**
 * Supabase Storage bucket names — Sprint 10.
 *
 * Centralized for the same reason `ROUTES` (Day 3) centralizes path
 * strings: no service or component should hardcode a bucket name literal
 * — they import it from here, so renaming a bucket later is a one-line
 * change plus a corresponding SQL migration, not a project-wide find/replace.
 */
export const STORAGE_BUCKETS = {
  BOOK_COVERS: "book-covers",
  /** Added Sprint 11, backing `authors.photo_url` via the same
   *  bucket-parameterized Image Upload Service. */
  AUTHOR_PHOTOS: "author-photos",
} as const;

export type StorageBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

/** Constraints `image-upload.service.ts` validates a file against before
 *  ever calling Supabase Storage — centralized so a future image upload
 *  for a different entity (an author photo, a publisher logo) reuses the
 *  same limits rather than each service inventing its own. */
export const IMAGE_UPLOAD_CONSTRAINTS = {
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
  ALLOWED_MIME_TYPES: ["image/jpeg", "image/png", "image/webp"] as const,
} as const;
