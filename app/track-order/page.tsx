"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, PackageCheck, SearchCheck, Truck } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";

import {
  getOrderTracking,
} from "@/features/orders/order-tracking.service";


function StatusBadge({
  status,
}: {
  status:string;
}) {

  const styles:Record<string,string> = {

    pending: "bg-amber-100 text-amber-900",
    confirmed: "bg-sky-100 text-sky-900",
    processing: "bg-sky-100 text-sky-900",
    packed: "bg-orange-100 text-orange-900",
    shipped: "bg-violet-100 text-violet-900",
    delivered: "bg-emerald-100 text-emerald-900",
    cancelled: "bg-rose-100 text-rose-900",

  };


  return (

    <span
      className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${
        styles[status] ??
        "bg-gray-100 text-gray-700"
      }`}
    >
      {status === "pending" ? "New Orders" : status === "packed" ? "Packed" : status}

    </span>

  );
}

function TrackOrderContent() {
  const searchParams = useSearchParams();

useEffect(()=>{

  const id = searchParams.get("id");

  if(id){

    setOrderId(id);

  }

},[searchParams]);


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





  async function handleTrack(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

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
    <section className="container max-w-xl py-10 sm:py-14">
      <header className="mb-6">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-100 text-sky-800">
          <PackageCheck size={24} aria-hidden="true" />
        </span>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-primary">Delivery updates</p>
        <h1 className="mt-1 text-3xl font-bold">Track your order</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Enter the order ID and the mobile number used at checkout to see the latest status.
        </p>
      </header>

      <form onSubmit={handleTrack} className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <label htmlFor="track-order-id" className="block text-sm font-semibold">
          Order ID
          <input
            id="track-order-id"
            required
            autoComplete="off"
            className="mt-1.5 min-h-12 w-full rounded-xl border border-input bg-background px-3 text-base font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            placeholder="Enter your order ID"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />
        </label>

        <label htmlFor="track-mobile" className="block text-sm font-semibold">
          Mobile number
          <input
            id="track-mobile"
            required
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            className="mt-1.5 min-h-12 w-full rounded-xl border border-input bg-background px-3 text-base font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            placeholder="Mobile number used for the order"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
        </label>

        <button
          type="submit"
          disabled={loading || !orderId.trim() || !mobile.trim()}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
        >
          <SearchCheck size={18} aria-hidden="true" />
          {loading ? "Checking order…" : "Track my order"}
          {!loading && <ArrowRight size={16} aria-hidden="true" />}
        </button>
      </form>





      {message && (

        <div role="status" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-center text-sm text-amber-900">

          {message}

        </div>

      )}






      {order && (

        <div className="mt-5 space-y-5 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">


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






          <div className="rounded-xl border border-border bg-secondary/30 p-4">


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
                  "processing",
                  "packed",
                  "shipped",
                  "delivered"]
                  .includes(order.status)
                  ? "✅"
                  : "○"
                }
                {" "}
                Processing
              </p>


              <p>
                {
                  ["packed",
                  "shipped",
                  "delivered"]
                  .includes(order.status)
                  ? "✅"
                  : "○"
                }
                {" "}
                Packed
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

              <div className="rounded-xl border border-border bg-secondary/30 p-4">

                <h3 className="flex items-center gap-2 font-semibold">
                  <Truck size={17} className="text-primary" aria-hidden="true" />
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


{
order.tracking_number && (

<a
  href={`https://www.google.com/search?q=${encodeURIComponent(order.tracking_number)}`}
  target="_blank"
  rel="noreferrer"
  className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full border border-primary/25 bg-card px-4 text-sm font-semibold text-primary hover:bg-primary/5"
>
  Track shipment <ArrowRight size={15} aria-hidden="true" />
</a>

)
}

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



    </section>

  );
}

export default function TrackOrderPage() {
  return (
    <MainLayout>
      <Suspense fallback={<div role="status" className="container py-16 text-center text-sm text-muted-foreground">Loading order tracking…</div>}>
        <TrackOrderContent />
      </Suspense>
    </MainLayout>
  );
}