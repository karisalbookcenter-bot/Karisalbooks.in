import { z } from "zod";
import type { AuthorInsert, AuthorUpdate } from "@/types/author.types";

/**
 * Author Validation — Sprint 11 (Task 5).
 *
 * Same `zod`-based approach `book.validation.ts` (Sprint 10) established
 * — not generalized into a shared schema factory, unlike the repository/
 * service layers. `Author` and `Publisher` differ enough in field names
 * (`bio`/`photo_url` vs. `description`/`website_url`) that a generic
 * validation factory would mostly be indirection around two field
 * declarations; the real duplication risk was in the *query logic*
 * (fully solved by `createSupabaseRepository`/`createEntityService`), not
 * in declaring "this field is an optional URL."
 */

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const authorInsertSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(200, "Name is too long."),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .max(200, "Slug is too long.")
    .regex(slugPattern, "Slug must be lowercase letters, numbers, and hyphens only.")
    .optional(),
  bio: z.string().max(3000, "Bio is too long.").nullable().optional(),
  photo_url: z.string().url("Must be a valid URL.").nullable().optional(),
  status: z.enum(["active", "inactive", "archived"]).optional(),
}) satisfies z.ZodType<AuthorInsert, z.ZodTypeDef, unknown>;

export const authorUpdateSchema = authorInsertSchema.partial() satisfies z.ZodType<
  AuthorUpdate,
  z.ZodTypeDef,
  unknown
>;

export type AuthorValidationErrors = Partial<Record<keyof AuthorInsert, string>>;

export interface AuthorValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: AuthorValidationErrors;
}

function toFieldErrors(error: z.ZodError): AuthorValidationErrors {
  const errors: AuthorValidationErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as keyof AuthorInsert | undefined;
    if (field && !(field in errors)) errors[field] = issue.message;
  }
  return errors;
}

export function validateAuthorInsert(input: unknown): AuthorValidationResult<AuthorInsert> {
  const result = authorInsertSchema.safeParse(input);
  if (result.success) return { success: true, data: result.data as AuthorInsert };
  return { success: false, errors: toFieldErrors(result.error) };
}

export function validateAuthorUpdate(input: unknown): AuthorValidationResult<AuthorUpdate> {
  const result = authorUpdateSchema.safeParse(input);
  if (result.success) return { success: true, data: result.data as AuthorUpdate };
  return { success: false, errors: toFieldErrors(result.error) };
}
