// src/features/customers/validation/customer.validation.ts

import { z } from "zod";

import type {
  CustomerInsert,
  CustomerUpdate,
} from "@/types/customer.types";





const uuidSchema = z
  .string()
  .uuid("Invalid ID format.")
  .nullable()
  .optional();






export const customerInsertSchema = z.object({

  user_id:
    uuidSchema,


  name:
    z
      .string()
      .trim()
      .min(2, "Customer name is required.")
      .max(200, "Name is too long."),



  email:
    z
      .string()
      .email("Invalid email address.")
      .nullable()
      .optional(),



  phone:
    z
      .string()
      .trim()
      .min(10, "Phone number must contain at least 10 digits.")
      .max(15, "Phone number is too long.")
      .nullable()
      .optional(),



  address:
    z
      .string()
      .max(500, "Address is too long.")
      .nullable()
      .optional(),



  city:
    z
      .string()
      .max(100, "City name is too long.")
      .nullable()
      .optional(),



  state:
    z
      .string()
      .max(100, "State name is too long.")
      .nullable()
      .optional(),



  pincode:
    z
      .string()
      .regex(
        /^[0-9]{6}$/,
        "Pincode must be 6 digits."
      )
      .nullable()
      .optional(),



  membership_id:
    uuidSchema,



  status:
    z
      .enum([
        "active",
        "inactive",
        "archived",
      ])
      .optional(),


}) satisfies z.ZodType<CustomerInsert>;









export const customerUpdateSchema =
  customerInsertSchema.partial()
  satisfies z.ZodType<CustomerUpdate>;









export type CustomerValidationErrors =
  Partial<
    Record<
      keyof CustomerInsert,
      string
    >
  >;








export interface CustomerValidationResult<T>{

  success:boolean;

  data?:T;

  errors?:CustomerValidationErrors;

}









function formatErrors(
  error:z.ZodError
):CustomerValidationErrors{


  const errors:CustomerValidationErrors={};


  for(const issue of error.issues){


    const field =
      issue.path[0]
      as keyof CustomerInsert;


    if(field && !errors[field]){

      errors[field]=issue.message;

    }

  }


  return errors;

}









export function validateCustomerInsert(
  input:unknown
):CustomerValidationResult<CustomerInsert>{


  const result =
    customerInsertSchema.safeParse(input);



  if(result.success){

    return {

      success:true,

      data:
        result.data as CustomerInsert,

    };

  }



  return {

    success:false,

    errors:
      formatErrors(result.error),

  };

}









export function validateCustomerUpdate(
  input:unknown
):CustomerValidationResult<CustomerUpdate>{


  const result =
    customerUpdateSchema.safeParse(input);



  if(result.success){

    return {

      success:true,

      data:
        result.data as CustomerUpdate,

    };

  }



  return {

    success:false,

    errors:
      formatErrors(result.error),

  };

}