import { z } from "zod";
import type { BookInsert, BookUpdate } from "@/types/book.types";

/**
 * Book validation — Sprint 10 (Task 3).
 *
 * The project's first schema-based validation layer, using `zod` (added
 * this sprint — see `package.json`). Every prior form
 * (`CategoryFormLayout`, `SubcategoryFormLayout`, Sprints 08–09) was
 * explicitly "UI only" with no validation to speak of; Sprint 10 is where
 * real persistence begins, so real validation begins here too. Future
 * entities (Category/Subcategory CRUD, once built) can adopt the same
 * `zod` pattern rather than each inventing its own hand-rolled checks.
 *
 * Mirrors Migration 0002's own constraints (`price >= 0`,
 * `stock_quantity >= 0`, `title`/`category_id`/`author_id` required) so a
 * value that fails here would also fail the database's own `check`
 * constraints — validation exists to give a fast, field-level error
 * message before ever reaching Supabase, not to enforce a different rule
 * set than the schema does.
 */

const uuid = z.string().uuid({ message: "Must be a valid id." });

/** Slug pattern: lowercase letters, numbers, and hyphens only — the same
 *  shape `slugify()` (`@/lib/helpers/string.helpers`, Day 3) produces, so
 *  a hand-typed slug is held to the same standard an auto-generated one
 *  already meets. */
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const bookInsertSchema = z.object({
  category_id: uuid,
  subcategory_id: uuid.nullable().optional(),
  author_id: uuid,
  publisher_id: uuid.nullable().optional(),
  title: z.string().trim().min(1, "Title is required.").max(300, "Title is too long."),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .max(300, "Slug is too long.")
    .regex(slugPattern, "Slug must be lowercase letters, numbers, and hyphens only.")
    .optional(),
  description: z.string().max(5000, "Description is too long.").nullable().optional(),
  isbn: z
    .string()
    .trim()
    .regex(/^[0-9-]{10,17}$/, "ISBN must be 10–13 digits, hyphens allowed.")
    .nullable()
    .optional()
    .or(z.literal("")),
  price: z.number({ invalid_type_error: "Price must be a number." }).min(0, "Price cannot be negative."),
  stock_quantity: z
    .number({ invalid_type_error: "Stock quantity must be a number." })
    .int("Stock quantity must be a whole number.")
    .min(0, "Stock quantity cannot be negative."),
  cover_image_url: z.string().url("Must be a valid URL.").nullable().optional(),
  status: z.enum(["active", "inactive", "archived"]).optional(),
}) satisfies z.ZodType<BookInsert, z.ZodTypeDef, unknown>;

export const bookUpdateSchema = bookInsertSchema.partial() satisfies z.ZodType<
  BookUpdate,
  z.ZodTypeDef,
  unknown
>;

/** Field-level validation errors, keyed by field name — the shape a
 *  future form component (and `useBookForm`, this sprint's hook) reads
 *  directly to show inline error text under each input. */
export type BookValidationErrors = Partial<Record<keyof BookInsert, string>>;

export interface BookValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: BookValidationErrors;
}

function toFieldErrors(error: z.ZodError): BookValidationErrors {
  const errors: BookValidationErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as keyof BookInsert | undefined;
    if (field && !(field in errors)) {
      errors[field] = issue.message;
    }
  }
  return errors;
}

/** Validates a full create payload. Used by `book.service.ts`'s `create()`
 *  before any repository/Supabase call is made. */
export function validateBookInsert(input: unknown): BookValidationResult<BookInsert> {
  const result = bookInsertSchema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data as BookInsert };
  }
  return { success: false, errors: toFieldErrors(result.error) };
}

/** Validates a partial update payload. Used by `book.service.ts`'s
 *  `update()` — every field optional, but any field present must still be
 *  valid (e.g. a supplied `price` still can't be negative). */
export function validateBookUpdate(input: unknown): BookValidationResult<BookUpdate> {
  const result = bookUpdateSchema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data as BookUpdate };
  }
  return { success: false, errors: toFieldErrors(result.error) };
}
