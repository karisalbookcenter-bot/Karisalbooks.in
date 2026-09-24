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


  const { error } = await supabase
    .from("orders")
    .update({
      status,
      updated_at: new Date().toISOString()
    })
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