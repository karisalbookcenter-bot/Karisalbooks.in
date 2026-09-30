"use client";


import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";


import { useOfferForm } from "@/features/offers/hooks/useOfferForm";

import type { Offer } from "@/types/offer.types";



interface OfferFormLayoutProps {

  mode: "create" | "edit";

  initialOffer?: Offer;

  onSuccess?: () => void;

  onCancel?: () => void;

}




function offerToFormValues(
  offer: Offer
) {

  return {

    title: offer.title,

    description:
      offer.description ?? "",

    couponCode:
      offer.coupon_code ?? "",


    discountPercentage:
      String(offer.discount_percentage),


    startDate:
      offer.start_date
        ? offer.start_date.slice(0,10)
        : "",


    endDate:
      offer.end_date
        ? offer.end_date.slice(0,10)
        : "",


    status:
      offer.status,


  };

}







export function OfferFormLayout({

  mode,

  initialOffer,

  onSuccess,

  onCancel,

}: OfferFormLayoutProps) {



  const {

    values,

    setField,

    submit,

    loading,

    error,

  } = useOfferForm({

    mode,

    offerId:
      initialOffer?.id,


    initialValues:
      initialOffer
        ? offerToFormValues(initialOffer)
        : undefined,


  });








  const handleSave = async () => {


    const result =
      await submit();


    if (!result.error) {

      onSuccess?.();

    }


  };








  return (

    <div className="flex flex-col gap-4">



      <div>

        <Label>
          Offer Title
        </Label>


        <Input

          value={values.title}

          onChange={(e)=>
            setField(
              "title",
              e.target.value
            )
          }

        />

      </div>






      <div>

        <Label>
          Description
        </Label>


        <Textarea

          value={values.description}

          onChange={(e)=>
            setField(
              "description",
              e.target.value
            )
          }

        />

      </div>


      <div>

        <Label htmlFor="offer-coupon-code">
          Coupon Code
        </Label>

        <Input
          id="offer-coupon-code"
          value={values.couponCode}
          maxLength={32}
          placeholder="For example, PONGAL25"
          onChange={(e) =>
            setField("couponCode", e.target.value.toUpperCase())
          }
        />

      </div>







      <div>


        <Label>
          Discount Percentage
        </Label>



        <select

          className="
          border
          rounded-md
          h-10
          px-3
          "

          value={
            values.discountPercentage
          }


          onChange={(e)=>
            setField(
              "discountPercentage",
              e.target.value
            )
          }

        >


          {
            [5,10,15,20,25].map(
              (value)=>(

                <option

                  key={value}

                  value={value}

                >

                  {value}%


                </option>


              )
            )
          }


        </select>


      </div>







      <div className="grid grid-cols-2 gap-4">


        <div>

          <Label>
            Start Date
          </Label>


          <Input

            type="date"


            value={
              values.startDate
            }


            onChange={(e)=>
              setField(
                "startDate",
                e.target.value
              )
            }

          />


        </div>





        <div>

          <Label>
            End Date
          </Label>


          <Input

            type="date"


            value={
              values.endDate
            }


            onChange={(e)=>
              setField(
                "endDate",
                e.target.value
              )
            }

          />


        </div>


      </div>








      <div>


        <Label>
          Status
        </Label>


        <select

          className="
          border
          rounded-md
          h-10
          px-3
          "


          value={
            values.status
          }


          onChange={(e)=>
            setField(
              "status",
              e.target.value as
              "active" | "inactive"
            )
          }


        >

          <option value="active">
            Active
          </option>


          <option value="inactive">
            Inactive
          </option>


        </select>


      </div>







      {
        error && (

          <p className="
          text-sm
          text-destructive
          ">

            {error}

          </p>

        )
      }







      <div className="
      flex
      justify-end
      gap-3
      border-t
      pt-4
      ">


        <Button

          variant="outline"

          onClick={onCancel}

        >

          Cancel

        </Button>





        <Button

          onClick={handleSave}

          disabled={loading}

        >

          {
            loading
            ? "Saving..."
            : mode === "create"
              ? "Add Offer"
              : "Save Changes"
          }


        </Button>



      </div>



    </div>

  );

}