"use client";

import { Button } from "@/components/ui/button";

interface OfferEmptyStateProps {
  onAddOffer?: () => void;
}

export function OfferEmptyState({
  onAddOffer,
}: OfferEmptyStateProps) {

  return (
    <div className="
      rounded-md
      border
      border-dashed
      p-8
      text-center
    ">

      <h3 className="text-lg font-semibold">
        No offers found
      </h3>


      <p className="
        mt-2
        text-sm
        text-muted-foreground
      ">
        Create your first discount offer to start promoting books.
      </p>



      {onAddOffer && (

        <Button

          className="mt-4"

          onClick={onAddOffer}

        >

          Add Offer

        </Button>

      )}


    </div>
  );
}