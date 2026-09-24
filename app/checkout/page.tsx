"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useCart } from "@/features/cart/hooks/useCart";
import { formatCurrency } from "@/lib/helpers/format.helpers";
import { createOrder } from "@/features/orders/services/order.service";

export default function CheckoutPage() {

  const { items, clearCart } = useCart();

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );


  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [pincode, setPincode] = useState("");

  const [loading, setLoading] = useState(false);


  async function handleSubmit(
    e: React.FormEvent
  ) {

    e.preventDefault();

    try {

      setLoading(true);


      await createOrder({

        customer_name: name,

        mobile,

        address,

        district,

        pincode,

        total_amount: total,


        items: items.map((item)=>({

          book_id: item.id,

          title: item.title,

          price: item.price,

          quantity: item.quantity,

        }))

      });


      alert("Order placed successfully");


      clearCart();


    } catch(error) {

  console.error("ORDER ERROR:", error);

  alert(
    JSON.stringify(error)
  );

}
    finally {

      setLoading(false);

    }

  }


  return (

    <MainLayout>

      <div className="container grid gap-8 py-10 md:grid-cols-2">


        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <h1 className="text-3xl font-bold">
            Checkout
          </h1>


          <input
  className="w-full rounded border p-3"
  placeholder="Name"
  autoComplete="name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  required
/>


          <input
  className="w-full rounded border p-3"
  placeholder="Mobile"
  autoComplete="tel"
  value={mobile}
  onChange={(e) => setMobile(e.target.value)}
  required
/>


          <input
  className="w-full rounded border p-3"
  placeholder="Address"
  autoComplete="street-address"
  value={address}
  onChange={(e) => setAddress(e.target.value)}
  required
/>


          <input
            className="w-full rounded border p-3"
            placeholder="District"
            value={district}
            onChange={(e)=>setDistrict(e.target.value)}
            required
          />


          <input
  className="w-full rounded border p-3"
  placeholder="Pincode"
  autoComplete="postal-code"
  value={pincode}
  onChange={(e) => setPincode(e.target.value)}
  required
/>


autoComplete="tel"
autoComplete="street-address"
autoComplete="postal-code"


          <button
            type="submit"
            disabled={loading}
            className="rounded bg-primary px-6 py-3 font-semibold text-white"
          >

            {loading ? "Placing Order..." : "Place Order"}

          </button>


        </form>



        <div className="rounded border p-5">

          <h2 className="text-xl font-bold mb-4">
            Order Summary
          </h2>


          {items.map((item)=>(

            <div
              key={item.id}
              className="flex justify-between mb-3"
            >

              <span>
                {item.title} × {item.quantity}
              </span>

              <span>
                {formatCurrency(
                  item.price * item.quantity
                )}
              </span>

            </div>

          ))}


          <hr className="my-4"/>


          <p className="text-xl font-bold">
            Total: {formatCurrency(total)}
          </p>


        </div>


      </div>

    </MainLayout>

  );

}