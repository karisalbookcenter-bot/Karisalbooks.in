// src/features/customers/repository/customer.repository.ts


import { createClient } from "@/lib/supabase/client";

import type {
  Customer,
  CustomerInsert,
  CustomerUpdate,
} from "@/types/customer.types";

import type {
  PaginatedResult,
  RecordStatus,
  SortDirection,
} from "@/types/common.types";





export interface ListCustomersParams {

  page:number;

  pageSize:number;

  search?:string;

  status?:RecordStatus[];

  sortBy?:keyof Customer;

  sortDirection?:SortDirection;

}









function mapRow(
  row:Record<string,unknown>
):Customer{


  return row as unknown as Customer;

}









export async function getCustomerById(
  id:string
):Promise<Customer|null>{


  const supabase =
    await createClient();



  const {
    data,
    error
  } = await supabase
    .from("customers")
    .select("*")
    .eq("id",id)
    .maybeSingle();



  if(error){

    throw new Error(error.message);

  }



  return data
    ? mapRow(data)
    : null;

}









export async function listCustomers(
  params:ListCustomersParams
):Promise<PaginatedResult<Customer>>{


  const {

    page,

    pageSize,

    search,

    status,

    sortBy="created_at",

    sortDirection="desc"

  } = params;




  const supabase =
    await createClient();





  let query =
    supabase
      .from("customers")
      .select("*",{count:"exact"});





  if(search && search.trim()){


    const term =
      `%${search.trim()}%`;



    query =
      query.or(
        `name.ilike.${term},email.ilike.${term},phone.ilike.${term}`
      );

  }






  if(status && status.length>0){


    query =
      query.in(
        "status",
        status
      );

  }







  const from =
    (page-1)*pageSize;



  const to =
    from + pageSize - 1;







  const {

    data,

    error,

    count

  } = await query

    .order(
      sortBy,
      {
        ascending:
          sortDirection==="asc"
      }
    )

    .range(
      from,
      to
    );






  if(error){

    throw new Error(error.message);

  }






  const totalItems =
    count ?? 0;






  return {


    items:
      (data ?? [])
      .map(mapRow),



    page,

    pageSize,

    totalItems,


    totalPages:
      Math.max(
        1,
        Math.ceil(
          totalItems/pageSize
        )
      )

  };

}









export async function createCustomer(
  input:CustomerInsert
):Promise<Customer>{



  const supabase =
    await createClient();





  const {

    data,

    error

  } = await supabase

    .from("customers")

    .insert(input)

    .select()

    .single();






  if(error){

    throw new Error(error.message);

  }






  return mapRow(data);

}









export async function updateCustomer(
  id:string,
  input:CustomerUpdate
):Promise<Customer>{



  const supabase =
    await createClient();






  const {

    data,

    error

  } = await supabase

    .from("customers")

    .update(input)

    .eq(
      "id",
      id
    )

    .select()

    .single();






  if(error){

    throw new Error(error.message);

  }






  return mapRow(data);

}









export async function deleteCustomer(
  id:string
):Promise<void>{



  const supabase =
    await createClient();






  const {

    error

  } = await supabase

    .from("customers")

    .delete()

    .eq(
      "id",
      id
    );






  if(error){

    throw new Error(error.message);

  }

}









export async function updateCustomersStatus(
  ids:string[],
  status:RecordStatus
):Promise<void>{



  const supabase =
    await createClient();






  const {

    error

  } = await supabase

    .from("customers")

    .update({
      status
    })

    .in(
      "id",
      ids
    );






  if(error){

    throw new Error(error.message);

  }

}









export async function deleteCustomers(
  ids:string[]
):Promise<void>{



  const supabase =
    await createClient();






  const {

    error

  } = await supabase

    .from("customers")

    .delete()

    .in(
      "id",
      ids
    );






  if(error){

    throw new Error(error.message);

  }

}