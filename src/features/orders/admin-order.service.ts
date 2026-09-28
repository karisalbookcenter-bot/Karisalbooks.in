import { createClient } from "@/lib/supabase/client";



export async function getAdminOrders() {

  const supabase = createClient();


  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (
        id,
        book_id,
        title,
        price,
        quantity
      )
    `)
    .order(
      "created_at",
      {
        ascending: false
      }
    );


  if (error) {

    console.error(
      "ADMIN ORDERS FETCH ERROR:",
      error.message
    );

    throw new Error(error.message);

  }


  return data ?? [];

}




export async function updateOrderStatus(
  id: string,
  status: string
) {

  const supabase = createClient();


  const updateData: Record<string, any> = {

    status,

    updated_at:
      new Date().toISOString()

  };


  if(status === "shipped") {

    updateData.shipped_at =
      new Date().toISOString();

  }



  const { error } = await supabase
    .from("orders")
    .update(updateData)
    .eq(
      "id",
      id
    );



  if(error){

    console.error(
      "ORDER STATUS UPDATE ERROR:",
      error.message
    );

    throw new Error(error.message);

  }


  return true;

}





export async function updateOrderPayment(
  id: string,
  payment_status: string,
  payment_method?: string,
  payment_id?: string
) {


  const supabase = createClient();


  const { error } = await supabase
    .from("orders")
    .update({

      payment_status,

      payment_method,

      payment_id,

      updated_at:
        new Date().toISOString()

    })
    .eq(
      "id",
      id
    );



  if(error){

    console.error(
      "PAYMENT UPDATE ERROR:",
      error.message
    );

    throw new Error(error.message);

  }


  return true;

}





export async function updateOrderCourier(
  id: string,
  courier_name: string,
  tracking_number: string
) {


  const supabase = createClient();



  const { error } = await supabase
    .from("orders")
    .update({

      courier_name,

      tracking_number,

      updated_at:
        new Date().toISOString()

    })
    .eq(
      "id",
      id
    );



  if(error){

    console.error(
      "COURIER UPDATE ERROR:",
      error.message
    );

    throw new Error(error.message);

  }


  return true;

}