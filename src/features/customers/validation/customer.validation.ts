// src/features/customers/validation/customer.validation.ts

import { z } from "zod";

import type {
  CustomerInsert,
  CustomerUpdate,
} from "@/types/customer.types";



export const customerInsertSchema =
z.object({

  full_name:
    z
    .string()
    .min(
      2,
      "Customer name required"
    ),


  email:
    z
    .string()
    .email(
      "Invalid email"
    ),


  phone:
    z
    .string()
    .nullable()
    .optional(),


  avatar_url:
    z
    .string()
    .nullable()
    .optional(),


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