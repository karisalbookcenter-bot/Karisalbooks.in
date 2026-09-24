"use client";

import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  getAdminOrders,
  updateOrderStatus,
} from "@/features/orders/services/admin-order.service";
import { formatCurrency } from "@/lib/helpers/format.helpers";


type OrderItem = {
  id: string;
  title: string;
  price: number;
  quantity: number;
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


export default function AdminOrdersPage() {

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);


  async function loadOrders(){

    try {

      const data = await getAdminOrders();

      setOrders(data as Order[]);

    } catch(error){

      console.error(
        "LOAD ORDERS ERROR:",
        error
      );

    } finally {

      setLoading(false);

    }

  }



  useEffect(()=>{

    loadOrders();

  },[]);



  async function changeStatus(
    id:string,
    status:string
  ){

    try {

      await updateOrderStatus(
        id,
        status
      );


      setOrders((current)=>
        current.map((order)=>
          order.id === id
          ? {
              ...order,
              status
            }
          : order
        )
      );


    } catch(error){

      console.error(
        "STATUS UPDATE ERROR:",
        error
      );

    }

  }



  if(loading){

    return (

      <MainLayout>

        <div className="container py-10">
          Loading orders...
        </div>

      </MainLayout>

    );

  }



  return (

    <MainLayout>

      <div className="container py-10">

        <h1 className="mb-8 text-3xl font-bold">
          Orders Management
        </h1>


        {
          orders.length === 0 ? (

            <p className="text-muted-foreground">
              No orders found.
            </p>

          ) : (


            <div className="space-y-6">


            {
              orders.map((order)=>(


                <div
                  key={order.id}
                  className="rounded-lg border p-6 space-y-4"
                >


                  <div>

                    <h2 className="text-xl font-semibold">
                      {order.customer_name}
                    </h2>


                    <p>
                      Mobile: {order.mobile}
                    </p>


                    <p>
                      Address:
                      {" "}
                      {order.address},
                      {" "}
                      {order.district}
                      {" "}
                      - {order.pincode}
                    </p>


                  </div>



                  <div>

                    <h3 className="font-semibold">
                      Items
                    </h3>


                    {
                      order.order_items?.map((item)=>(

                        <div
                          key={item.id}
                          className="flex justify-between border-b py-2"
                        >

                          <span>
                            {item.title}
                            {" "}
                            x {item.quantity}
                          </span>


                          <span>
                            {
                              formatCurrency(
                                item.price * item.quantity
                              )
                            }
                          </span>


                        </div>

                      ))
                    }


                  </div>




                  <div className="flex items-center justify-between">


                    <p className="text-lg font-bold">

                      Total:
                      {" "}
                      {formatCurrency(
                        order.total_amount
                      )}

                    </p>



                    <select

                      value={order.status}

                      onChange={(e)=>
                        changeStatus(
                          order.id,
                          e.target.value
                        )
                      }

                      className="rounded border px-3 py-2"

                    >

                      <option value="pending">
                        Pending
                      </option>

                      <option value="processing">
                        Processing
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


              ))
            }


            </div>


          )
        }


      </div>


    </MainLayout>

  );

}