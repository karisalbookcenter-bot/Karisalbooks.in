import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getServerAuthUser } from "@/features/auth/services/session.service";


export default async function MyOrdersPage() {


  const user = await getServerAuthUser();


  if (!user) {

    redirect("/login");

  }



  const supabase = await createClient();



  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      id,
      total_amount,
      status,
      created_at,
      courier_name,
      tracking_number,
      order_items(
        id,
        title,
        quantity,
        price
      )
    `)
    .eq(
      "user_id",
      user.id
    )
    .order(
      "created_at",
      {
        ascending:false
      }
    );




  if(error){

    console.error(
      "MY ORDERS ERROR:",
      error.message
    );

  }




  return (

    <div className="mx-auto max-w-4xl space-y-6 p-6">


      <h1 className="text-3xl font-bold">
        My Orders
      </h1>




      {
        !orders ||
        orders.length === 0
        ?


        <div className="rounded border p-6 text-center">

          No orders found

        </div>


        :


        orders.map((order)=>(


          <div

            key={order.id}

            className="space-y-4 rounded-lg border p-5"

          >



            <div className="flex justify-between">

              <div>

                <p className="font-semibold">

                  Order ID

                </p>


                <p className="text-sm">

                  {order.id}

                </p>


              </div>



              <span className="rounded bg-gray-100 px-3 py-1">

                {order.status}

              </span>


            </div>





            <p className="text-xl font-bold">

              ₹{order.total_amount}

            </p>





            <p>

              Date:
              {" "}
              {
                new Date(
                  order.created_at
                ).toLocaleDateString(
                  "en-IN"
                )
              }

            </p>





            {
              order.courier_name && (

                <div className="rounded border p-3">

                  <p>
                    Courier:
                    {" "}
                    {order.courier_name}
                  </p>


                  <p>
                    Tracking:
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

                  )
                )
              }


            </div>



          </div>


        ))

      }



    </div>

  );

}