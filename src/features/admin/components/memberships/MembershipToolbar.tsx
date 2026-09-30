"use client";


import { Button } from "@/components/ui/button";



interface MembershipToolbarProps {


  searchValue: string;


  onSearchChange: (
    value:string
  )=>void;



  selectedPlan?:
    | "all"
    | "standard"
    | "premium";



  onPlanChange?: (
    value:
      | "all"
      | "standard"
      | "premium"
  )=>void;



  onAddMembership?:()=>void;



}



export function MembershipToolbar({

  searchValue,

  onSearchChange,

  selectedPlan = "all",

  onPlanChange,

  onAddMembership,

}:MembershipToolbarProps){



  return (

    <div

      className="
        flex
        flex-col
        gap-3
        rounded-lg
        border
        border-border
        bg-card
        p-4
        md:flex-row
        md:items-center
        md:justify-between
      "

    >




      <div className="
        flex
        flex-1
        flex-col
        gap-3
        md:flex-row
      ">



        <input


          value={searchValue}


          onChange={(e)=>
            onSearchChange(
              e.target.value
            )
          }


          placeholder="
            Search membership ID or customer...
          "


          className="
            h-10
            w-full
            rounded-md
            border
            border-input
            bg-background
            px-3
            text-sm
            outline-none
            md:max-w-sm
          "

        />







        {
          onPlanChange && (

            <select


              value={selectedPlan}


              onChange={(e)=>
                onPlanChange(
                  e.target.value as
                  | "all"
                  | "standard"
                  | "premium"
                )
              }


              className="
                h-10
                rounded-md
                border
                border-input
                bg-background
                px-3
                text-sm
              "

            >

              <option value="all">
                All Plans
              </option>


              <option value="standard">
                Standard (15%)
              </option>


              <option value="premium">
                Premium (20-25%)
              </option>


            </select>

          )
        }




      </div>







      {
        onAddMembership && (

          <Button

            onClick={
              onAddMembership
            }

          >

            Add Membership

          </Button>

        )
      }





    </div>

  );

}