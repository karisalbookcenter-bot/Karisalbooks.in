import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getServerAuthUser } from "@/features/auth/services/session.service";

export default async function AccountOrdersPage() {
  const user = await getServerAuthUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <h1 className="text-2xl font-bold">
          Please login to view your orders.
        </h1>
      </div>
    );
  }

  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      id,
      total_amount,
      status,
      created_at
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">

      <h1 className="text-3xl font-bold">
        My Orders
      </h1>

      {!orders?.length ? (
        <div className="rounded-lg border p-6">
          No orders found.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="block rounded-lg border p-5 hover:bg-gray-50"
            >
              <div className="flex justify-between">

                <div>
                  <p className="font-semibold">
                    Order #{order.id.slice(0, 8)}
                  </p>

                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString("en-IN")}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold">
                    ₹{order.total_amount}
                  </p>

                  <p className="capitalize">
                    {order.status}
                  </p>
                </div>

              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
}