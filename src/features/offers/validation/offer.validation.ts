import { z } from "zod";

import type {
  OfferInsert,
  OfferUpdate,
} from "@/types/offer.types";



export const offerInsertSchema = z.object({

  title: z
    .string()
    .trim()
    .min(1, "Offer title is required."),

  description: z
    .string()
    .nullable()
    .optional(),

  discount_percentage: z
    .number()
    .min(5, "Minimum discount is 5%.")
    .max(25, "Maximum discount is 25%."),

  start_date: z
    .string()
    .min(1, "Start date is required."),

  end_date: z
    .string()
    .min(1, "End date is required."),

  status: z
    .enum([
      "active",
      "inactive",
      "archived",
    ])
    .optional(),

});



export const offerUpdateSchema =
  offerInsertSchema.partial();



export type OfferValidationErrors =
  Partial<Record<keyof OfferInsert, string>>;



function toFieldErrors(
  error: z.ZodError
): OfferValidationErrors {

  const errors: OfferValidationErrors = {};


  for (const issue of error.issues) {

    const field =
      issue.path[0] as keyof OfferInsert;


    if (field && !errors[field]) {

      errors[field] =
        issue.message;

    }

  }


  return errors;

}




export function validateOfferInsert(
  input: unknown
) {

  const result =
    offerInsertSchema.safeParse(input);


  if (result.success) {

    return {
      success: true,
      data: result.data as OfferInsert,
    };

  }


  return {
    success: false,
    errors: toFieldErrors(result.error),
  };

}




export function validateOfferUpdate(
  input: unknown
) {

  const result =
    offerUpdateSchema.safeParse(input);


  if (result.success) {

    return {
      success: true,
      data: result.data as OfferUpdate,
    };

  }


  return {
    success: false,
    errors: toFieldErrors(result.error),
  };

}