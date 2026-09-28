"use client";

import { useState } from "react";

import {
  getOrderTracking,
} from "@/features/orders/order-tracking.service";


function StatusBadge({
  status,
}: {
  status:string;
}) {

  const styles:Record<string,string> = {

    pending:
      "bg-yellow-100 text-yellow-800",

    confirmed:
      "bg-blue-100 text-blue-800",

    shipped:
      "bg-purple-100 text-purple-800",

    delivered:
      "bg-green-100 text-green-800",

    cancelled:
      "bg-red-100 text-red-800",

  };


  return (

    <span
      className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${
        styles[status] ??
        "bg-gray-100 text-gray-700"
      }`}
    >
      {status}

    </span>

  );

}



export default function TrackOrderPage(){


  const [orderId,setOrderId] =
    useState("");

  const [mobile,setMobile] =
    useState("");

  const [order,setOrder] =
    useState<any>(null);

  const [loading,setLoading] =
    useState(false);

  const [message,setMessage] =
    useState("");





  async function handleTrack(){


    try {

      setLoading(true);

      setMessage("");

      setOrder(null);



      const data =
        await getOrderTracking(
          orderId,
          mobile
        );



      if(!data){

        setMessage(
          "Order not found"
        );

        return;

      }



      setOrder(data);



    }
    catch(error){

      console.error(error);

      setMessage(
        "Unable to track order"
      );

    }
    finally{

      setLoading(false);

    }


  }





  return (

    <div className="mx-auto max-w-xl space-y-6 p-6">


      <h1 className="text-3xl font-bold">
        Track Your Order
      </h1>



      <div className="space-y-3 rounded-lg border p-5">


        <input
          className="w-full rounded border px-3 py-2"
          placeholder="Order ID"
          value={orderId}
          onChange={(e)=>
            setOrderId(e.target.value)
          }
        />


        <input
          className="w-full rounded border px-3 py-2"
          placeholder="Mobile Number"
          value={mobile}
          onChange={(e)=>
            setMobile(e.target.value)
          }
        />



        <button

          onClick={handleTrack}

          disabled={loading}

          className="rounded bg-black px-5 py-2 text-white"

        >

          {
            loading
            ? "Checking..."
            : "Track Order"
          }

        </button>


      </div>





      {message && (

        <div className="rounded border p-4 text-center">

          {message}

        </div>

      )}






      {order && (

        <div className="space-y-5 rounded-lg border p-5">


          <div className="flex items-center justify-between">

            <h2 className="text-xl font-bold">
              Order Details
            </h2>


            <StatusBadge
              status={order.status}
            />

          </div>





          <div className="space-y-2">


            <p>
              Customer:
              {" "}
              {order.customer_name}
            </p>


            <p>
              Order Date:
              {" "}
              {
                new Date(
                  order.created_at
                ).toLocaleDateString(
                  "en-IN"
                )
              }
            </p>


            <p className="text-xl font-bold">

              ₹{order.total_amount}

            </p>


          </div>






          <div className="rounded border p-4">


            <h3 className="mb-3 font-semibold">
              Order Progress
            </h3>



            <div className="space-y-2 text-sm">


              <p>
                ✅ Order Placed
              </p>


              <p>
                {
                  ["confirmed",
                  "shipped",
                  "delivered"]
                  .includes(order.status)
                  ? "✅"
                  : "○"
                }
                {" "}
                Confirmed
              </p>



              <p>
                {
                  ["shipped",
                  "delivered"]
                  .includes(order.status)
                  ? "✅"
                  : "○"
                }
                {" "}
                Shipped
              </p>




              <p>
                {
                  order.status === "delivered"
                  ? "✅"
                  : "○"
                }
                {" "}
                Delivered
              </p>



            </div>


          </div>







          {
            order.courier_name && (

              <div className="rounded border p-4">

                <h3 className="font-semibold">
                  Shipping Details
                </h3>


                <p>
                  Courier:
                  {" "}
                  {order.courier_name}
                </p>


                <p>
                  Tracking No:
                  {" "}
                  {order.tracking_number}
                </p>


              </div>

            )
          }








          <div>

            <h3 className="font-semibold">
              Books
            </h3>


            {
              order.order_items?.map(
                (item:any)=>(

                <p
                  key={item.id}
                  className="border-b py-2"
                >

                  {item.title}
                  {" × "}
                  {item.quantity}

                </p>

              ))
            }


          </div>




        </div>

      )}



    </div>

  );

}