// src/features/customers/hooks/useCustomerForm.ts


"use client";


import {
  useState,
  useCallback,
} from "react";


import * as customerService from "../services/customer.service";


import type {
  Customer,
  CustomerInsert,
  CustomerUpdate,
} from "@/types/customer.types";









interface UseCustomerFormOptions {


  customer?: Customer;


  onSuccess?: (
    customer: Customer
  ) => void;


}









export function useCustomerForm(
  options:UseCustomerFormOptions={}
){


  const {
    customer,
    onSuccess,
  } = options;





  const [loading,setLoading]
    = useState(false);



  const [errors,setErrors]
    = useState<
      Record<string,string>
    >({});





  const [serverError,setServerError]
    = useState<string | null>(null);









  const submit = useCallback(

    async(
      values:
        CustomerInsert | CustomerUpdate
    )=>{


      setLoading(true);


      setErrors({});


      setServerError(null);






      try{



        let result;






        if(customer){



          result =
            await customerService.updateCustomer(

              customer.id,

              values as CustomerUpdate

            );



        }

        else {



          result =
            await customerService.createCustomer(

              values as CustomerInsert

            );


        }







        if(result.error){


          setServerError(
            result.error.message
          );


          return null;

        }







        if(result.data){


          onSuccess?.(
            result.data
          );


          return result.data;


        }






        return null;



      }


      catch(error){



        setServerError(

          error instanceof Error

          ? error.message

          : "Something went wrong."

        );



        return null;



      }



      finally{


        setLoading(false);


      }





    },

    [
      customer,
      onSuccess,
    ]

  );









  const reset = ()=>{


    setErrors({});


    setServerError(null);


  };









  return {


    submit,


    loading,


    errors,


    serverError,


    reset,


    isEdit:
      Boolean(customer),


  };

}