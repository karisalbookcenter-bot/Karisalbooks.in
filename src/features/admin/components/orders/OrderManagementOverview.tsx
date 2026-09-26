"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getAdminOrders,
  updateOrderStatus,
} from "@/features/orders/admin-order.service";

type OrderItem = {
  id: string;
  title: string;
  quantity: number;
  price: number;
};

type Order = {
  id: string;
  customer_name: string;
  mobile: string;
  address: string;
  district: string;
  pincode: string;
  total_amount: number;
  status: string;
  created_at: string;
  order_items: OrderItem[];
};

export function OrderManagementOverview() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getAdminOrders();

      setOrders(data as Order[]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  async function handleStatusChange(
    id: string,
    status: string
  ) {
    try {
      await updateOrderStatus(id, status);

      await loadOrders();
    } catch (error) {
      console.error(error);
      alert("Unable to update order.");
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        Loading orders...
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">

      <h1 className="text-3xl font-bold">
        Orders
      </h1>

      {orders.length === 0 && (
        <div className="rounded-lg border p-8 text-center">
          No Orders Found
        </div>
      )}

      {orders.map((order) => (
        <div
          key={order.id}
          className="rounded-lg border p-5 space-y-4"
        >
          <div className="flex items-center justify-between">

            <div>
              <h2 className="font-semibold">
                {order.customer_name}
              </h2>

              <p>{order.mobile}</p>

              <p>
                {order.address}
              </p>

              <p>
                {order.district} - {order.pincode}
              </p>
            </div>

            <div className="text-right">

              <p className="font-bold">
                ₹{order.total_amount}
              </p>

              <select
                className="mt-2 rounded border px-3 py-2"
                value={order.status}
                onChange={(e) =>
                  handleStatusChange(
                    order.id,
                    e.target.value
                  )
                }
              >
                <option value="pending">
                  Pending
                </option>

                <option value="confirmed">
                  Confirmed
                </option>

                <option value="shipped">
                  Shipped
                </option>

                <option value="delivered">
                  Delivered
                </option>

                <option value="cancelled">
                  Cancelled
                </option>

              </select>

            </div>

          </div>

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

              {order.order_items?.map((item) => (

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
      ))}

    </div>
  );
}