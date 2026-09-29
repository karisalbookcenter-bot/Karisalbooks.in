"use client";


import { Button } from "@/components/ui/button";


interface OfferToolbarProps {

  onAddOffer?: () => void;

}



export function OfferToolbar({

  onAddOffer,

}: OfferToolbarProps) {


  return (

    <div className="
      flex
      items-center
      justify-between
      mb-5
    ">


      <div>

        <h2 className="
          text-lg
          font-semibold
        ">

          Offers

        </h2>


        <p className="
          text-sm
          text-muted-foreground
        ">

          Manage discount offers and promotions.

        </p>


      </div>





      <Button

        onClick={onAddOffer}

      >

        Add Offer

      </Button>



    </div>

  );

}