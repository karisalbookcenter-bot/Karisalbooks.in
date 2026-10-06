import { z } from "zod";
import type { BookInsert, BookUpdate } from "@/types/book.types";

/**
 * Book validation.
 */

const uuid = z.string().uuid({ message: "Must be a valid id." });

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const bookInsertSchema = z.object({
  category_id: uuid,

  subcategory_id: uuid.nullable().optional(),

  author_id: uuid,

  publisher_id: uuid.nullable().optional(),

  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(300, "Title is too long."),

  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .max(300, "Slug is too long.")
    .regex(
      slugPattern,
      "Slug must be lowercase letters, numbers, and hyphens only."
    )
    .optional(),

  description: z
    .string()
    .max(5000, "Description is too long.")
    .nullable()
    .optional(),

  isbn: z
    .string()
    .trim()
    .regex(
      /^[0-9-]{10,17}$/,
      "ISBN must be 10–13 digits, hyphens allowed."
    )
    .nullable()
    .optional()
    .or(z.literal("")),

  price: z
    .number({
      invalid_type_error: "Price must be a number.",
    })
    .min(0, "Price cannot be negative."),

  stock_quantity: z
    .number({
      invalid_type_error: "Stock quantity must be a number.",
    })
    .int("Stock quantity must be a whole number.")
    .min(0, "Stock quantity cannot be negative."),

  /**
   * Book weight in kilograms.
   *
   * Decimal values are allowed:
   * 0.25, 0.5, 1, 1.5, 4 etc.
   */
  weight_kg: z
    .number({
      invalid_type_error: "Weight must be a number.",
    })
    .min(0, "Weight cannot be negative."),

  cover_image_url: z
    .string()
    .url("Must be a valid URL.")
    .nullable()
    .optional(),

  status: z
    .enum(["active", "inactive", "archived"])
    .optional(),
});

export const bookUpdateSchema =
  bookInsertSchema.partial() satisfies z.ZodType<
    BookUpdate,
    z.ZodTypeDef,
    unknown
  >;

export type BookValidationErrors = Partial<
  Record<keyof BookInsert, string>
>;

export interface BookValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: BookValidationErrors;
}

function toFieldErrors(
  error: z.ZodError
): BookValidationErrors {
  const errors: BookValidationErrors = {};

  for (const issue of error.issues) {
    const field =
      issue.path[0] as keyof BookInsert | undefined;

    if (field && !(field in errors)) {
      errors[field] = issue.message;
    }
  }

  return errors;
}

export function validateBookInsert(
  input: unknown
): BookValidationResult<BookInsert> {
  const result = bookInsertSchema.safeParse(input);

  if (result.success) {
    return {
      success: true,
      data: result.data as BookInsert,
    };
  }

  return {
    success: false,
    errors: toFieldErrors(result.error),
  };
}

export function validateBookUpdate(
  input: unknown
): BookValidationResult<BookUpdate> {
  const result = bookUpdateSchema.safeParse(input);

  if (result.success) {
    return {
      success: true,
      data: result.data as BookUpdate,
    };
  }

  return {
    success: false,
    errors: toFieldErrors(result.error),
  };
}