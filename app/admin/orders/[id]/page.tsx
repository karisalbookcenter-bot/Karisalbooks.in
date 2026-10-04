import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import { OrderWorkflowActions } from "./OrderWorkflowActions";
import { InvoiceDownloadButton } from "./InvoiceDownloadButton";
import { WhatsAppButton } from "./WhatsAppButton";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrderDetailPage({
  params,
}: PageProps) {

  const { id } = await params;

  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items(
        id,
        book_id,
        title,
        quantity,
        price
      )
    `)
    .eq("id", id)
    .single();

  if (error || !order) {
    notFound();
  }

  return (
    <div className="space-y-6 p-6">

      <h1 className="text-3xl font-bold">
        Order Details
      </h1>

      <div className="rounded-lg border p-5 space-y-4">

        <h2 className="text-xl font-semibold">
          {order.customer_name}
        </h2>

        <p>
          Mobile : {order.mobile}
        </p>

        <p>
          Address : {order.address}
        </p>

        <p>
          {order.district} - {order.pincode}
        </p>

        <p className="text-xl font-bold">
          Total : ₹{order.total_amount}
        </p>

        <p>
          Payment status : {order.payment_status ?? "unknown"}
        </p>

        <p>
          Payment method : {order.payment_method ?? "unknown"}
        </p>

        <OrderWorkflowActions
  order={order}
/>

        <WhatsAppButton

 mobile={order.mobile}

 customerName={order.customer_name}

 orderId={order.id}

 status={order.status}

 total={order.total_amount}

 courier={order.courier_name}

 tracking={order.tracking_number}

/>

        <InvoiceDownloadButton
          order={order}
        />

      </div>

      <div className="rounded-lg border p-5">

        <h2 className="mb-4 text-xl font-semibold">
          Books
        </h2>

        <div className="overflow-x-auto">

          <table className="w-full border">

            <thead>

              <tr className="border-b bg-muted">

                <th className="p-2 text-left">
                  Book
                </th>

                <th className="p-2">
                  Qty
                </th>

                <th className="p-2">
                  Price
                </th>

              </tr>

            </thead>

            <tbody>

              {order.order_items?.map((item: any) => (

                <tr key={item.id}>

                  <td className="border-t p-2">
                    {item.title}
                  </td>

                  <td className="border-t p-2 text-center">
                    {item.quantity}
                  </td>

                  <td className="border-t p-2 text-center">
                    ₹{item.price}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}