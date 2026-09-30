"use client";


import { useCallback, useState } from "react";
import {
  createOfferAction,
  updateOfferAction,
} from "@/features/offers/actions/offer.actions";

import type { Offer } from "@/types/offer.types";



export interface OfferFormValues {

  title: string;

  description: string;

  couponCode: string;

  discountPercentage: string;

  startDate: string;

  endDate: string;

  status: "active" | "inactive" |"expired";


}





interface UseOfferFormOptions {

  mode?: "create" | "edit";

  offerId?: string;

  initialValues?: Partial<OfferFormValues>;

}





export function useOfferForm(
  options: UseOfferFormOptions = {}
) {


  const {
    mode = "create",
    offerId,
  } = options;



  const [values, setValues] =
    useState<OfferFormValues>({

      title:
        options.initialValues?.title ?? "",

      description:
        options.initialValues?.description ?? "",

      couponCode:
        options.initialValues?.couponCode ?? "",


      discountPercentage:
        options.initialValues?.discountPercentage ?? "5",


      startDate:
        options.initialValues?.startDate ?? "",


      endDate:
        options.initialValues?.endDate ?? "",


      status:
        options.initialValues?.status ?? "active",

    });




  const [loading,setLoading] =
    useState(false);



  const [error,setError] =
    useState<string | null>(null);






  const setField = useCallback(
    <K extends keyof OfferFormValues>(
      field: K,
      value: OfferFormValues[K]
    ) => {


      setValues(prev => ({

        ...prev,

        [field]: value,

      }));


    },
    []
  );







  const reset = () => {

    setValues({

      title:"",
      description:"",
      couponCode:"",
      discountPercentage:"5",
      startDate:"",
      endDate:"",
      status:"active",

    });


    setError(null);

  };








  const submit = async () => {


    setLoading(true);

    setError(null);



    try {


      const payload = {


        title: values.title,

        description:
          values.description || null,

        coupon_code:
          values.couponCode.trim().toUpperCase() || null,

        offer_type: "percentage" as const,

        special_day: null,

        discount_percentage:
          Number(values.discountPercentage),


        start_date:
          values.startDate,


        end_date:
          values.endDate,


        status:
          values.status,

      };





      let result;



      if (
        mode === "edit"
        &&
        offerId
      ) {


        result =
          await updateOfferAction(
            offerId,
            payload
          );


      } else {


        result =
          await createOfferAction(
            payload
          );


      }





      if (result.error) {

        setError(
          result.error.message
        );

      }



      return result;



    } catch(err) {


      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );


      return {
        data:null,
        error:{
          message:"Something went wrong"
        }
      };


    }

    finally {

      setLoading(false);

    }


  };






  return {


    values,

    setField,

    loading,

    error,

    reset,

    submit,


  };


}