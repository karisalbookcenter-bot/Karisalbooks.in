// src/features/customers/validation/customer.validation.ts

import { z } from "zod";

import type {
  CustomerInsert,
  CustomerUpdate,
} from "@/types/customer.types";



export const customerInsertSchema =
z.object({

  name:
    z
    .string()
    .trim()
    .min(
      2,
      "Customer name required"
    ),


  email:
    z.union([
      z.string().trim().email("Invalid email"),
      z.literal(""),
    ]).nullable().optional().transform((value) => value || null),


  phone:
    z
    .string()
    .nullable()
    .optional(),


  address: z.string().nullable().optional(),

  city: z.string().nullable().optional(),

  state: z.string().nullable().optional(),

  pincode: z.string().nullable().optional(),

  membership_id: z.string().nullable().optional(),

  user_id: z.string().nullable().optional(),

  status: z.enum(["active", "inactive", "archived"]).optional(),


});





export const customerUpdateSchema =
customerInsertSchema.partial();







export function validateCustomerInsert(
 input: CustomerInsert
){

 return customerInsertSchema.safeParse(input);

}







export function validateCustomerUpdate(
 input: CustomerUpdate
){

 return customerUpdateSchema.safeParse(input);

}