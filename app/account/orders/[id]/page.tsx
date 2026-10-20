import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";

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

      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${done ? "bg-emerald-100 text-emerald-800" : "bg-muted text-muted-foreground"}`}>
        {done ? <Check size={14} aria-hidden="true" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
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



  let { data: order, error } = await supabase

    .from("orders")

    .select(`

      id,

      purchase_type,
      combo_offer_price,

      prebooking_id,

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
        price,
        is_prebooking,
        is_combo_offer

      )

    `)

    .eq(
      "id",
      id
    )

    .single();

  if (error?.code === "42703" && /purchase_type|prebooking_id|is_prebooking|combo_offer_price|is_combo_offer/.test(error.message)) {
    const fallback = await supabase
      .from("orders")
      .select(`id, customer_name, total_amount, status, created_at, courier_name, tracking_number, shipped_at, order_items(id, title, quantity, price)`)
      .eq("id", id)
      .single();
    order = fallback.data as typeof order;
    error = fallback.error;
  }





  if(error || !order){

    notFound();

  }





  return (

    <MainLayout>
    <section className="container mx-auto max-w-3xl space-y-6 py-10 sm:py-14">


      <h1 className="text-3xl font-bold">

        Order Details

      </h1>





      <div className="rounded-lg border p-5 space-y-3">


        <p>

          Order ID:

          {" "}

          {order.id}

        </p>

        {(order.purchase_type === "prebooking" || order.purchase_type === "mixed") && order.prebooking_id && (
          <p>
            {order.purchase_type === "mixed" ? "Pre-booking reference" : "Pre-booking ID"}:{" "}
            <span className="font-mono font-semibold">{order.prebooking_id}</span>
          </p>
        )}



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
        {order.purchase_type === "combo" && (
          <p className="font-medium text-amber-800">
            Combo price : ₹{order.combo_offer_price ?? order.total_amount} per bundle, delivery included.
          </p>
        )}


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

          label="Processing"

          done={[
            "confirmed",
            "processing",
            "packed",
            "shipped",
            "delivered"
          ].includes(order.status)}

        />


        <StatusStep
          label="Packed"
          done={[
            "packed",
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
            Courier: {order.courier_name}
            {order.purchase_type === "combo" && " · delivery included in combo price"}
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
                {item.is_prebooking && (
                  <span className="ml-2 text-xs font-medium text-amber-700">
                    Pre-booking
                  </span>
                )}
                {item.is_combo_offer && (
                  <span className="ml-2 text-xs font-medium text-amber-800">
                    Included in combo price
                  </span>
                )}

                {" × "}

                {item.quantity}

              </div>

            )
          )
        }


      </div>
    </section>
    </MainLayout>
  );


}