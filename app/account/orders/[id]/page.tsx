import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";


interface PageProps {

  params: Promise<{
    id:string;
  }>;

}



function StatusStep({

  label,
  done,

}:{
  label:string;
  done:boolean;
}){

  return (

    <div className="flex gap-2 items-center">

      <span>
        {done ? "✅" : "○"}
      </span>

      <span>
        {label}
      </span>

    </div>

  );

}




export default async function CustomerOrderDetailPage({

  params,

}:PageProps){


  const { id } = await params;


  const supabase = await createClient();



  const { data: order, error } = await supabase

    .from("orders")

    .select(`

      id,

      customer_name,

      total_amount,

      status,

      created_at,

      courier_name,

      tracking_number,

      shipped_at,

      order_items(

        id,

        title,

        quantity,

        price

      )

    `)

    .eq(
      "id",
      id
    )

    .single();





  if(error || !order){

    notFound();

  }





  return (

    <div className="mx-auto max-w-3xl space-y-6 p-6">


      <h1 className="text-3xl font-bold">

        Order Details

      </h1>





      <div className="rounded-lg border p-5 space-y-3">


        <p>

          Order ID:

          {" "}

          {order.id}

        </p>



        <p>

          Date:

          {" "}

          {new Date(
            order.created_at
          ).toLocaleDateString("en-IN")}

        </p>



        <p className="text-xl font-bold">

          Total:

          {" "}

          ₹{order.total_amount}

        </p>


      </div>






      <div className="rounded-lg border p-5 space-y-3">


        <h2 className="text-xl font-semibold">

          Order Progress

        </h2>



        <StatusStep
          label="Order Placed"
          done={true}
        />


        <StatusStep

          label="Confirmed"

          done={[
            "confirmed",
            "shipped",
            "delivered"
          ].includes(order.status)}

        />


        <StatusStep

          label="Shipped"

          done={[
            "shipped",
            "delivered"
          ].includes(order.status)}

        />


        <StatusStep

          label="Delivered"

          done={
            order.status === "delivered"
          }

        />


      </div>






      {
        order.courier_name &&

        <div className="rounded-lg border p-5">


          <h2 className="font-semibold">

            Shipping Details

          </h2>


          <p>

            Courier:

            {" "}

            {order.courier_name}

          </p>


          <p>

            Tracking:

            {" "}

            {order.tracking_number}

          </p>


        </div>

      }






      <div className="rounded-lg border p-5">


        <h2 className="text-xl font-semibold mb-3">

          Books

        </h2>



        {
          order.order_items?.map(
            (item:any)=>(

              <div
                key={item.id}
                className="border-b py-2"
              >

                {item.title}

                {" × "}

                {item.quantity}

              </div>

            )
          )
        }


      </div>




    </div>

  );


}