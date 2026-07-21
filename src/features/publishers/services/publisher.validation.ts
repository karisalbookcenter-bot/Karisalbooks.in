import { z } from "zod";
import type { PublisherInsert, PublisherUpdate } from "@/types/publisher.types";

/**
 * Publisher Validation — Sprint 11 (Task 6).
 *
 * Mirrors `author.validation.ts` exactly, with `description`/
 * `website_url` in place of `bio`/`photo_url` — see that file's doc
 * comment for why this isn't further generalized into a shared schema.
 */

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const publisherInsertSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(200, "Name is too long."),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .max(200, "Slug is too long.")
    .regex(slugPattern, "Slug must be lowercase letters, numbers, and hyphens only.")
    .optional(),
  description: z.string().max(3000, "Description is too long.").nullable().optional(),
  website_url: z.string().url("Must be a valid URL.").nullable().optional(),
  status: z.enum(["active", "inactive", "archived"]).optional(),
}) satisfies z.ZodType<PublisherInsert, z.ZodTypeDef, unknown>;

export const publisherUpdateSchema = publisherInsertSchema.partial() satisfies z.ZodType<
  PublisherUpdate,
  z.ZodTypeDef,
  unknown
>;

export type PublisherValidationErrors = Partial<Record<keyof PublisherInsert, string>>;

export interface PublisherValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: PublisherValidationErrors;
}

function toFieldErrors(error: z.ZodError): PublisherValidationErrors {
  const errors: PublisherValidationErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as keyof PublisherInsert | undefined;
    if (field && !(field in errors)) errors[field] = issue.message;
  }
  return errors;
}

export function validatePublisherInsert(input: unknown): PublisherValidationResult<PublisherInsert> {
  const result = publisherInsertSchema.safeParse(input);
  if (result.success) return { success: true, data: result.data as PublisherInsert };
  return { success: false, errors: toFieldErrors(result.error) };
}

export function validatePublisherUpdate(input: unknown): PublisherValidationResult<PublisherUpdate> {
  const result = publisherUpdateSchema.safeParse(input);
  if (result.success) return { success: true, data: result.data as PublisherUpdate };
  return { success: false, errors: toFieldErrors(result.error) };
}
