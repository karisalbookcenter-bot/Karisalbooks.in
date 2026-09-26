import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { OrderStatusBadge } from "@/features/admin/components/orders/OrderStatusBadge";


type PageProps = {
  params: Promise<{
    id: string;
  }>;
};


export default async function OrderDetailPage({
  params,
}: PageProps) {


  const { id } = await params;


  const supabase = createClient();



  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (
        id,
        book_id,
        title,
        price,
        quantity
      )
      `
    )
    .eq("id", id)
    .single();



  if (error || !order) {
    notFound();
  }



  return (

    <div className="space-y-6 p-6">


      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold">
            Order Details
          </h1>

          <p className="text-sm text-muted-foreground">
            Order ID: {order.id}
          </p>

        </div>


        <OrderStatusBadge
          status={order.status}
        />


      </div>





      <div className="rounded-lg border p-5 space-y-3">


        <h2 className="text-xl font-semibold">
          Customer Details
        </h2>


        <p>
          Name: {order.customer_name}
        </p>


        <p>
          Mobile: {order.mobile}
        </p>


        <p>
          Address: {order.address}
        </p>


        <p>
          {order.district} - {order.pincode}
        </p>


      </div>






      <div className="rounded-lg border p-5">


        <h2 className="mb-4 text-xl font-semibold">
          Books
        </h2>



        <div className="overflow-x-auto">


          <table className="w-full border">


            <thead>

              <tr className="border-b bg-muted">

                <th className="p-3 text-left">
                  Book
                </th>


                <th className="p-3">
                  Quantity
                </th>


                <th className="p-3">
                  Price
                </th>


                <th className="p-3">
                  Total
                </th>


              </tr>

            </thead>



            <tbody>


              {order.order_items?.map(
                (item: {
                  id: string;
                  title: string;
                  quantity: number;
                  price: number;
                }) => (

                <tr key={item.id}>


                  <td className="border-t p-3">
                    {item.title}
                  </td>


                  <td className="border-t p-3 text-center">
                    {item.quantity}
                  </td>


                  <td className="border-t p-3 text-center">
                    ₹{item.price}
                  </td>


                  <td className="border-t p-3 text-center">
                    ₹{item.price * item.quantity}
                  </td>


                </tr>

              ))}



            </tbody>


          </table>


        </div>


      </div>






      <div className="rounded-lg border p-5">


        <h2 className="text-xl font-semibold">
          Payment Summary
        </h2>


        <p className="mt-3 text-2xl font-bold">
          ₹{order.total_amount}
        </p>


      </div>



    </div>

  );
}