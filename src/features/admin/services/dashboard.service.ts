import { createClient } from "@/lib/supabase/client";

export async function getDashboardStats() {

  const supabase = createClient();


  const [
    booksResult,
    ordersResult,
    customersResult,
    revenueResult,
  ] = await Promise.all([


    supabase
      .from("books")
      .select("id", { count: "exact", head: true }),



    supabase
      .from("orders")
      .select("id", { count: "exact", head: true }),



    supabase
      .from("customers")
      .select("id", { count: "exact", head: true }),



    supabase
      .from("orders")
      .select("total_amount"),


  ]);



  const revenue =
    revenueResult.data?.reduce(
      (sum, order) =>
        sum + Number(order.total_amount || 0),
      0
    ) || 0;



  return {

    totalBooks:
      booksResult.count || 0,


    totalOrders:
      ordersResult.count || 0,


    totalCustomers:
      customersResult.count || 0,


    totalRevenue:
      revenue,


  };

}