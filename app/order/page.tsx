"use client";

import { useEffect, useState } from "react";

import { MainLayout } from "@/components/layout/MainLayout";
import { formatCurrency } from "@/lib/helpers/format.helpers";


type OrderItem = {
  id: string;
  book_id: string;
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

async function getAdminOrders(): Promise<Order[]> {
  const response = await fetch("/api/orders");

  if (!response.ok) {
    throw new Error(`Failed to load orders (${response.status})`);
  }

  return response.json();
}



export default function AdminOrdersPage() {


  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {

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


    loadOrders();


  }, []);




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


        <h1 className="mb-6 text-3xl font-bold">
          Orders
        </h1>



        {orders.length === 0 ? (

          <p className="text-muted-foreground">
            No orders found.
          </p>


        ) : (


          <div className="space-y-5">



            {orders.map((order)=>(


              <div

                key={order.id}

                className="rounded-md border p-5"

              >



                <div className="flex flex-col gap-2 md:flex-row md:justify-between">


                  <div>

                    <h2 className="font-semibold">

                      {order.customer_name}

                    </h2>


                    <p className="text-sm text-muted-foreground">

                      {order.mobile}

                    </p>


                    <p className="text-sm text-muted-foreground">

                      {order.address}, {order.district} - {order.pincode}

                    </p>


                  </div>





                  <div className="text-right">


                    <p className="text-lg font-bold">

                      {formatCurrency(order.total_amount)}

                    </p>


                    <span className="text-sm">

                      Status: {order.status}

                    </span>


                  </div>



                </div>





                <div className="mt-5 border-t pt-4">


                  <h3 className="mb-2 font-semibold">

                    Books

                  </h3>




                  {order.order_items?.map((item)=>(


                    <div

                      key={item.id}

                      className="flex justify-between text-sm"

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



                </div>




              </div>



            ))}



          </div>


        )}



      </div>


    </MainLayout>

  );

}