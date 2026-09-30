import { z } from "zod";

import type {
  MembershipPlanInsert,
  MembershipPlanUpdate,
  MembershipInsert,
  MembershipUpdate,
} from "@/types/membership.types";


const uuid = z.string().uuid({
  message: "Must be a valid id.",
});



/**
 * Membership Plan Validation
 *
 * Standard 15%
 * Premium 25%
 */
export const membershipPlanInsertSchema =
  z.object({

    name: z
      .string()
      .trim()
      .min(1, "Plan name is required.")
      .max(100, "Plan name is too long."),


    price: z
      .number({
        invalid_type_error: "Price must be a number.",
      })
      .min(0, "Price cannot be negative."),



    discount_percentage: z
      .number({
        invalid_type_error:
          "Discount must be a number.",
      })
      .int("Discount must be a whole number.")
      .refine(
        (value) =>
          [5, 10, 15, 20, 25].includes(value),
        {
          message:
            "Discount must be between 5% and 25%.",
        }
      ),



    validity_days: z
      .number({
        invalid_type_error:
          "Validity must be a number.",
      })
      .int("Validity must be a whole number.")
      .positive(
        "Validity days must be greater than zero."
      ),



    status: z
      .enum([
        "active",
        "inactive",
        "archived",
      ])
      .optional(),

  });




export const membershipPlanUpdateSchema =
  membershipPlanInsertSchema.partial();






/**
 * Customer Membership Validation
 */
export const membershipInsertSchema =
  z.object({

    membership_id: z
      .string()
      .trim()
      .min(
        1,
        "Membership ID is required."
      )
      .max(
        50,
        "Membership ID is too long."
      ),



    customer_id: uuid,



    plan_id: uuid,



    payment_amount: z
      .number({
        invalid_type_error:
          "Payment amount must be a number.",
      })
      .min(
        0,
        "Payment amount cannot be negative."
      ),



    payment_status: z
      .enum([
        "pending",
        "paid",
        "failed",
        "refunded",
      ])
      .optional(),



    start_date: z
      .string()
      .min(
        1,
        "Start date is required."
      ),



    expiry_date: z
      .string()
      .min(
        1,
        "Expiry date is required."
      ),



    status: z
      .enum([
        "active",
        "inactive",
        "archived",
      ])
      .optional(),

  });






export const membershipUpdateSchema =
  membershipInsertSchema.partial();







export type MembershipValidationErrors =
  Partial<
    Record<
      keyof MembershipInsert,
      string
    >
  >;





export interface MembershipValidationResult<T> {

  success: boolean;

  data?: T;

  errors?: Record<string, string>;

}





function toFieldErrors(
  error: z.ZodError
) {

  const errors: Record<string, string> = {};


  for (const issue of error.issues) {

    const field =
      issue.path[0] as string | undefined;


    if (
      field &&
      !errors[field]
    ) {

      errors[field] =
        issue.message;

    }

  }


  return errors;

}






/**
 * Validate Plan Create
 */
export function validateMembershipPlanInsert(
  input: unknown
): MembershipValidationResult<MembershipPlanInsert> {


  const result =
    membershipPlanInsertSchema.safeParse(input);


  if (result.success) {

    return {
      success: true,
      data:
        result.data as MembershipPlanInsert,
    };

  }


  return {
    success: false,
    errors:
      toFieldErrors(result.error),
  };

}







/**
 * Validate Plan Update
 */
export function validateMembershipPlanUpdate(
  input: unknown
): MembershipValidationResult<MembershipPlanUpdate> {


  const result =
    membershipPlanUpdateSchema.safeParse(input);


  if (result.success) {

    return {
      success: true,
      data:
        result.data as MembershipPlanUpdate,
    };

  }


  return {
    success: false,
    errors:
      toFieldErrors(result.error),
  };

}








/**
 * Validate Membership Create
 */
export function validateMembershipInsert(
  input: unknown
): MembershipValidationResult<MembershipInsert> {


  const result =
    membershipInsertSchema.safeParse(input);


  if (result.success) {

    return {
      success: true,
      data:
        result.data as MembershipInsert,
    };

  }


  return {
    success: false,
    errors:
      toFieldErrors(result.error),
  };

}








/**
 * Validate Membership Update
 */
export function validateMembershipUpdate(
  input: unknown
): MembershipValidationResult<MembershipUpdate> {


  const result =
    membershipUpdateSchema.safeParse(input);


  if (result.success) {

    return {
      success: true,
      data:
        result.data as MembershipUpdate,
    };

  }


  return {
    success: false,
    errors:
      toFieldErrors(result.error),
  };

}