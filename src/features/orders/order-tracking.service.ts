import { createClient } from "@/lib/supabase/client";


export async function getOrderTracking(
  id: string,
  mobile: string
) {

  const supabase = createClient();


  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      customer_name,
      mobile,
      total_amount,
      status,
      created_at,
      courier_name,
      tracking_number,
      shipped_at,
      order_items (
        id,
        title,
        quantity,
        price
      )
      `
    )
    .eq("id", id)
    .eq("mobile", mobile)
    .single();



  if(error){

    console.error(
      "TRACK ORDER ERROR:",
      error.message
    );

    return null;

  }


  return data;

}