import { createClient } from "@/lib/supabase/client";

export interface CreateOrderInput {
  customer_name: string;
  mobile: string;
  address: string;
  district: string;
  pincode: string;

  total_amount: number;

  items: {
    book_id: string;
    title: string;
    price: number;
    quantity: number;
  }[];
}


export async function createOrder(
  payload: CreateOrderInput
) {

  const supabase = createClient();


  const { data: order, error } =
    await supabase
      .from("orders")
      .insert({
        customer_name: payload.customer_name,
        mobile: payload.mobile,
        address: payload.address,
        district: payload.district,
        pincode: payload.pincode,
        total_amount: payload.total_amount,
      })
      .select()
      .single();


  if (error) {
  console.error("ORDER INSERT ERROR:", error.message, error.details, error.hint);
  throw new Error(error.message);
}


  const orderItems = payload.items.map((item)=>({
    order_id: order.id,
    book_id: item.book_id,
    title: item.title,
    price: item.price,
    quantity: item.quantity,
  }));


  const { error: itemError } =
    await supabase
      .from("order_items")
      .insert(orderItems);


  if (itemError) {
  console.error(
    "ORDER ITEMS INSERT ERROR:",
    itemError.message,
    itemError.details,
    itemError.hint
  );

  throw new Error(itemError.message);
}


  return order;
}