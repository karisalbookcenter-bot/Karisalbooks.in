"use client";

import { Button } from "@/components/ui/button";


interface MembershipEmptyStateProps {

  variant?:
    | "no-data"
    | "no-results";


  onClearFilters?: () => void;


  onCreateMembership?: () => void;


  className?: string;

}



export function MembershipEmptyState({

  variant = "no-data",

  onClearFilters,

  onCreateMembership,

  className,

}: MembershipEmptyStateProps) {


  const isNoResults =
    variant === "no-results";



  return (

    <div

      className={`
        flex
        flex-col
        items-center
        justify-center
        rounded-lg
        border
        border-dashed
        border-border
        bg-muted/30
        px-6
        py-12
        text-center
        ${className ?? ""}
      `}

    >


      <h3 className="
        text-lg
        font-semibold
      ">

        {
          isNoResults
            ? "No memberships found"
            : "No memberships yet"
        }

      </h3>




      <p className="
        mt-2
        max-w-md
        text-sm
        text-muted-foreground
      ">

        {
          isNoResults

          ? "Try changing your search or filters."

          : "Create your first membership plan to start offering member discounts."
        }

      </p>






      <div className="
        mt-5
        flex
        gap-3
      ">


        {
          isNoResults && onClearFilters && (

            <Button

              variant="outline"

              onClick={onClearFilters}

            >

              Clear filters

            </Button>

          )
        }





        {
          !isNoResults && onCreateMembership && (

            <Button

              onClick={onCreateMembership}

            >

              Add Membership

            </Button>

          )
        }


      </div>




    </div>

  );

}