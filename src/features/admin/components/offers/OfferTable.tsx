"use client";


import { formatDate } from "@/lib/helpers/format.helpers";

import type { Offer } from "@/types/offer.types";

import { OfferStatusBadge } from "./OfferStatusBadge";



interface OfferTableProps {

  offers: Offer[];

  loading?: boolean;

  onEdit?: (offer: Offer) => void;

  onDelete?: (offer: Offer) => void;

}







export function OfferTable({

  offers,

  loading,

  onEdit,

  onDelete,

}: OfferTableProps) {



  if (loading) {

    return (

      <div className="
        rounded-md
        border
        p-6
        text-center
      ">

        Loading offers...

      </div>

    );

  }







  if (offers.length === 0) {

    return (

      <div className="
        rounded-md
        border
        border-dashed
        p-6
        text-center
        text-muted-foreground
      ">

        No offers found.

      </div>

    );

  }







  return (

    <div className="
      overflow-x-auto
      rounded-md
      border
    ">


      <table className="w-full">



        <thead className="
          border-b
          bg-muted/40
        ">


          <tr>


            <th className="
              px-4
              py-3
              text-left
              text-sm
            ">

              Title

            </th>



            <th className="
              px-4
              py-3
              text-left
              text-sm
            ">

              Discount

            </th>




            <th className="
              px-4
              py-3
              text-left
              text-sm
            ">

              Start Date

            </th>




            <th className="
              px-4
              py-3
              text-left
              text-sm
            ">

              End Date

            </th>




            <th className="
              px-4
              py-3
              text-left
              text-sm
            ">

              Status

            </th>




            <th className="
              px-4
              py-3
            " />



          </tr>


        </thead>






        <tbody>



          {
            offers.map((offer)=>(


              <tr

                key={offer.id}

                className="
                  border-b
                  last:border-0
                  hover:bg-muted/20
                "

              >



                <td className="
                  px-4
                  py-3
                  text-sm
                  font-medium
                ">

                  {offer.title}


                </td>






                <td className="
                  px-4
                  py-3
                  text-sm
                ">

                  {offer.discount_percentage}%


                </td>







                <td className="
                  px-4
                  py-3
                  text-sm
                ">

                  {
                    formatDate(
                      offer.start_date
                    )
                  }


                </td>







                <td className="
                  px-4
                  py-3
                  text-sm
                ">

                  {
                    formatDate(
                      offer.end_date
                    )
                  }


                </td>







                <td className="
                  px-4
                  py-3
                ">


                  <OfferStatusBadge

                    status={
                    
                      offer.status
                    }

                  />


                </td>







                <td className="
                  px-4
                  py-3
                  text-right
                ">


                  <button

                    className="
                      text-sm
                      text-muted-foreground
                      hover:text-foreground
                    "

                    onClick={() =>
                      onEdit?.(offer)
                    }

                  >

                    Edit


                  </button>





                  <button

                    className="
                      ml-3
                      text-sm
                      text-destructive
                    "

                    onClick={() =>
                      onDelete?.(offer)
                    }

                  >

                    Delete


                  </button>



                </td>



              </tr>



            ))
          }



        </tbody>



      </table>



    </div>

  );

}