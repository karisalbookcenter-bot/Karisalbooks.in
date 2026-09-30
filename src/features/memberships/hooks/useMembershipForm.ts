"use client";

import { useCallback, useState } from "react";

import {
  validateMembershipInsert,
  validateMembershipUpdate,
} from "../validation/membership.validation";

import * as membershipService from "../services/membership.service";

import type {
  Membership,
  MembershipInsert,
} from "@/types/membership.types";

import type {
  ApiResponse,
} from "@/types/common.types";



export interface MembershipFormValues {

  user_id: string;

  membership_type:
    | "standard"
    | "premium";

  discount_percentage: number;

  start_date: string;

  end_date: string;

  status:
    | "active"
    | "inactive";

}



const DEFAULT_VALUES: MembershipFormValues = {

  user_id: "",

  membership_type: "standard",

  discount_percentage: 15,

  start_date: "",

  end_date: "",

  status: "active",

};



export interface UseMembershipFormResult {


  values: MembershipFormValues;


  errors: Record<string,string>;


  isSubmitting: boolean;


  submitError: string | null;


  setField: <K extends keyof MembershipFormValues>(
    field: K,
    value: MembershipFormValues[K]
  ) => void;


  reset:()=>void;


  submit:()=>Promise<ApiResponse<Membership>>;

}



export interface UseMembershipFormOptions {

  mode?:
    | "create"
    | "edit";


  membershipId?:string;


  initialValues?:
    Partial<MembershipFormValues>;

}




function toPayload(
 values:MembershipFormValues
):MembershipInsert {


 return {

    user_id:
      values.user_id,


    membership_type:
      values.membership_type,


    discount_percentage:
      Number(values.discount_percentage),


    start_date:
      values.start_date,


    end_date:
      values.end_date || null,


    status:
      values.status,

 };

}





export function useMembershipForm(
 options:UseMembershipFormOptions={}
):UseMembershipFormResult {


 const {
   mode="create",
   membershipId,
 } = options;



 const [values,setValues]=useState<MembershipFormValues>({
   ...DEFAULT_VALUES,
   ...options.initialValues,
 });



 const [errors,setErrors]=useState<Record<string,string>>({});


 const [isSubmitting,setIsSubmitting]
 =
 useState(false);



 const [submitError,setSubmitError]
 =
 useState<string|null>(null);





 const setField = useCallback(

 (field,value)=>{


 setValues(prev=>({

   ...prev,

   [field]:value,

 }));


 setErrors(prev=>{

   const next={...prev};

   delete next[field];

   return next;

 });


 },

 []

 );





 const reset = useCallback(()=>{


 setValues({

   ...DEFAULT_VALUES,

   ...options.initialValues,

 });


 setErrors({});


 setSubmitError(null);


 },[options.initialValues]);






 const submit = useCallback(
 async()=>{


 setIsSubmitting(true);

 setSubmitError(null);



 const payload =
 toPayload(values);



 const validation =
 mode==="create"

 ? validateMembershipInsert(payload)

 : validateMembershipUpdate(payload);



 if(!validation.success){


 setErrors(
   validation.errors ?? {}
 );


 setIsSubmitting(false);


 return {

   data:null,

   error:{
     message:"Validation failed",
     code:"VALIDATION_ERROR"
   }

 };


 }





 let result;



 if(
   mode==="edit"
   &&
   membershipId
 ){

 result =
 await membershipService.updateMembership(
   membershipId,
   validation.data!
 );


 }
 else{


 result =
 await membershipService.createMembership(
   validation.data!
 );


 }




 setIsSubmitting(false);



 if(result.error){

   setSubmitError(
     result.error.message
   );

 }



 return result;



 },

 [
 values,
 mode,
 membershipId
 ]

 );







 return {

 values,

 errors,

 isSubmitting,

 submitError,

 setField,

 reset,

 submit,

 };


}