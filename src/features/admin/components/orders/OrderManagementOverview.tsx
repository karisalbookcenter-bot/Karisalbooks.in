"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { OrderStatusBadge } from "./OrderStatusBadge";

import {
  getAdminOrders,
  updateOrderStatus,
} from "@/features/orders/admin-order.service";


type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";


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
  status: OrderStatus;
  created_at: string;
  order_items: OrderItem[];
};


const ORDER_STATUS = [
  "all",
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
] as const;



export function OrderManagementOverview() {


  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<(typeof ORDER_STATUS)[number]>("all");



  const loadOrders = useCallback(async()=>{

    try {

      setLoading(true);

      const data = await getAdminOrders();

      setOrders(data as Order[]);


    } catch(error){

      console.error(
        "ORDER LOAD ERROR:",
        error
      );


    } finally {

      setLoading(false);

    }


  },[]);



  useEffect(()=>{

    loadOrders();

  },[loadOrders]);





  async function handleStatusChange(
    id:string,
    status:OrderStatus
  ){

    try {


      await updateOrderStatus(
        id,
        status
      );



      setOrders((prev)=>
        prev.map((order)=>
          order.id === id
          ? {
              ...order,
              status,
            }
          :
            order
        )
      );



    }catch(error){

      console.error(
        "STATUS UPDATE ERROR:",
        error
      );

      alert(
        "Unable to update order"
      );

    }

  }






  const filteredOrders = orders.filter((order)=>{


    const searchMatch =
      order.customer_name
      .toLowerCase()
      .includes(search.toLowerCase())
      ||
      order.mobile.includes(search);



    const statusMatch =
      statusFilter === "all"
      ||
      order.status === statusFilter;



    return (
      searchMatch &&
      statusMatch
    );


  });






  if(loading){

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





      <div className="flex flex-col gap-3 md:flex-row">


        <input

          className="w-full rounded border px-3 py-2 md:w-72"

          placeholder="Search customer / mobile..."

          value={search}

          onChange={(e)=>
            setSearch(e.target.value)
          }

        />




        <select

          className="rounded border px-3 py-2"

          value={statusFilter}

          onChange={(e)=>
            setStatusFilter(
              e.target.value as
              (typeof ORDER_STATUS)[number]
            )
          }

        >

          {ORDER_STATUS.map((status)=>(

            <option
              key={status}
              value={status}
            >

              {status.toUpperCase()}

            </option>

          ))}


        </select>


      </div>






      {filteredOrders.length === 0 && (

        <div className="rounded-lg border p-8 text-center">

          No Orders Found

        </div>

      )}







      {filteredOrders.map((order)=>(


        <div

          key={order.id}

          className="space-y-4 rounded-lg border p-5"

        >




          <div className="flex flex-col justify-between gap-4 md:flex-row">





            <div>


              <div className="flex items-center gap-3">

                <h2 className="text-lg font-semibold">

                  {order.customer_name}

                </h2>


                <Link
                  href={`/admin/orders/${order.id}`}
                  className="rounded border px-3 py-1 text-sm hover:bg-muted"
                >
                  View Details
                </Link>


              </div>




              <p>
                {order.mobile}
              </p>



              <p>
                {order.address}
              </p>



              <p>
                {order.district} - {order.pincode}
              </p>





              <p className="text-sm text-muted-foreground">

                {new Date(
                  order.created_at
                ).toLocaleDateString(
                  "en-IN"
                )}

              </p>


            </div>







            <div className="text-right">


              <p className="text-xl font-bold">

                ₹{order.total_amount}

              </p>

<Link
  href={`/admin/orders/${order.id}`}
  className="mt-3 inline-block rounded border px-4 py-2 text-sm font-medium hover:bg-muted"
>
  View Details
</Link>




              <OrderStatusBadge
                status={order.status}
              />





              <select

                className="mt-3 rounded border px-3 py-2"

                value={order.status}

                onChange={(e)=>
                  handleStatusChange(
                    order.id,
                    e.target.value as OrderStatus
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


                {order.order_items?.map((item)=>(


                  <tr
                    key={item.id}
                  >


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


      ))}




    </div>

  );

}