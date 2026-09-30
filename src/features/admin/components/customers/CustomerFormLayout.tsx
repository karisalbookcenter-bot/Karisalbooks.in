// src/features/admin/components/customers/CustomerFormLayout.tsx

"use client";


import {
  useState,
} from "react";


import {
  useCustomerForm,
} from "@/features/customers/hooks/useCustomerForm";


import type {
  Customer,
} from "@/types/customer.types";








interface CustomerFormLayoutProps {


  mode:
    | "create"
    | "edit";


  initialCustomer?: Customer;


  onCancel:()=>void;


  onSuccess:(
    customer:Customer
  )=>void;


}









export function CustomerFormLayout({

  mode,

  initialCustomer,

  onCancel,

  onSuccess,

}:CustomerFormLayoutProps){





  const {
    submit,
    loading,
    errors,
    serverError,
  } =
    useCustomerForm({

      customer:
        initialCustomer,


      onSuccess,

    });








  const [form,setForm] =
    useState({


      name:
        initialCustomer?.name ?? "",


      email:
        initialCustomer?.email ?? "",


      phone:
        initialCustomer?.phone ?? "",


      address:
        initialCustomer?.address ?? "",


      city:
        initialCustomer?.city ?? "",


      state:
        initialCustomer?.state ?? "",


      pincode:
        initialCustomer?.pincode ?? "",


    });








  const updateField = (
    key:keyof typeof form,
    value:string
  )=>{


    setForm(prev=>({

      ...prev,

      [key]:value,

    }));


  };









  async function handleSubmit(
    e:React.FormEvent
  ){


    e.preventDefault();



    await submit(form);


  }









  return (

    <form

      onSubmit={handleSubmit}

      className="
        space-y-4
      "

    >



      <h2 className="
        text-lg
        font-semibold
      ">

        {
          mode==="create"
          ? "Add Customer"
          : "Edit Customer"
        }

      </h2>








      {
        serverError && (

          <div className="
            rounded
            bg-destructive/10
            p-3
            text-sm
            text-destructive
          ">

            {serverError}

          </div>

        )
      }








      <div>

        <label className="text-sm">

          Name

        </label>


        <input

          className="
            w-full
            rounded-md
            border
            px-3
            py-2
          "


          value={form.name}


          onChange={(e)=>
            updateField(
              "name",
              e.target.value
            )
          }

        />


        {
          errors.name && (

            <p className="
              text-sm
              text-destructive
            ">

              {errors.name}

            </p>

          )
        }

      </div>









      <div>

        <label className="text-sm">

          Email

        </label>


        <input

          type="email"

          className="
            w-full
            rounded-md
            border
            px-3
            py-2
          "


          value={form.email}


          onChange={(e)=>
            updateField(
              "email",
              e.target.value
            )
          }

        />


      </div>









      <div>

        <label className="text-sm">

          Phone

        </label>


        <input


          className="
            w-full
            rounded-md
            border
            px-3
            py-2
          "


          value={form.phone}


          onChange={(e)=>
            updateField(
              "phone",
              e.target.value
            )
          }

        />

      </div>









      <div>

        <label className="text-sm">

          Address

        </label>


        <textarea

          className="
            w-full
            rounded-md
            border
            px-3
            py-2
          "


          value={form.address}


          onChange={(e)=>
            updateField(
              "address",
              e.target.value
            )
          }

        />

      </div>









      <div className="
        grid
        grid-cols-1
        gap-3
        md:grid-cols-3
      ">


        <input

          placeholder="City"

          className="
            rounded-md
            border
            px-3
            py-2
          "

          value={form.city}

          onChange={(e)=>
            updateField(
              "city",
              e.target.value
            )
          }

        />



        <input

          placeholder="State"

          className="
            rounded-md
            border
            px-3
            py-2
          "

          value={form.state}

          onChange={(e)=>
            updateField(
              "state",
              e.target.value
            )
          }

        />



        <input

          placeholder="Pincode"

          className="
            rounded-md
            border
            px-3
            py-2
          "

          value={form.pincode}

          onChange={(e)=>
            updateField(
              "pincode",
              e.target.value
            )
          }

        />


      </div>









      <div className="
        flex
        justify-end
        gap-3
      ">


        <button

          type="button"

          onClick={onCancel}

          className="
            rounded-md
            border
            px-4
            py-2
          "

        >

          Cancel

        </button>





        <button

          type="submit"

          disabled={loading}

          className="
            rounded-md
            bg-primary
            px-4
            py-2
            text-primary-foreground
          "

        >

          {
            loading
            ? "Saving..."
            : "Save Customer"
          }


        </button>


      </div>





    </form>

  );

}