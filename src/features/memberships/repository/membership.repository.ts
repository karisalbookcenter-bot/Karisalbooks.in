// src/features/memberships/repository/membership.repository.ts


import { createClient } from "@/lib/supabase/client";


import type {

  Membership,

  MembershipInsert,

  MembershipUpdate,

  MembershipPlan,

  MembershipPlanInsert,

  MembershipPlanUpdate,

} from "@/types/membership.types";


import type {

  PaginatedResult,

  RecordStatus,

  SortDirection,

} from "@/types/common.types";





/**
 * Membership Repository
 *
 * Only this file communicates with Supabase.
 */






/**
 * Membership Plan
 */



export interface ListMembershipPlansParams {


  page:number;


  pageSize:number;


  search?:string;


  status?:RecordStatus[];


  sortBy?:keyof MembershipPlan;


  sortDirection?:SortDirection;


}







export async function getMembershipPlanById(
  id:string
):Promise<MembershipPlan|null>{


 const supabase=createClient();


 const {
  data,
  error
 }
 =
 await supabase
 .from("membership_plans")
 .select("*")
 .eq("id",id)
 .maybeSingle();



 if(error)
  throw new Error(error.message);



 return data as MembershipPlan|null;


}







export async function listMembershipPlans(
 params:ListMembershipPlansParams
):Promise<PaginatedResult<MembershipPlan>>{


 const {

 page,

 pageSize,

 search,

 status,

 sortBy="created_at",

 sortDirection="desc",

 }=params;



 const supabase=createClient();



 let query =
 supabase
 .from("membership_plans")
 .select("*",{count:"exact"});




 if(search){

 query=query.ilike(
 "name",
 `%${search}%`
 );

 }




 if(status && status.length){

 query=query.in(
 "status",
 status
 );

 }




 const from=(page-1)*pageSize;

 const to=from+pageSize-1;



 const {
 data,
 error,
 count
 }
 =
 await query
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



 if(error)
 throw new Error(error.message);



 const totalItems=count ?? 0;



 return {


 items:(data ?? []) as MembershipPlan[],


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








export async function createMembershipPlan(
 input:MembershipPlanInsert
):Promise<MembershipPlan>{


 const supabase=createClient();


 const {
 data,
 error
 }
 =
 await supabase
 .from("membership_plans")
 .insert(input)
 .select()
 .single();



 if(error)
 throw new Error(error.message);



 return data as MembershipPlan;


}






export async function updateMembershipPlan(
 id:string,
 input:MembershipPlanUpdate
):Promise<MembershipPlan>{


 const supabase=createClient();



 const {
 data,
 error
 }
 =
 await supabase
 .from("membership_plans")
 .update(input)
 .eq("id",id)
 .select()
 .single();



 if(error)
 throw new Error(error.message);



 return data as MembershipPlan;


}






export async function deleteMembershipPlan(
 id:string
):Promise<void>{


 const supabase=createClient();


 const {
 error
 }
 =
 await supabase
 .from("membership_plans")
 .delete()
 .eq("id",id);



 if(error)
 throw new Error(error.message);


}









/**
 * Customer Membership
 */




// Customer Membership Functions



export interface ListMembershipsParams {

  page:number;

  pageSize:number;

  search?:string;

  plan?:
    | "standard"
    | "premium"
    | string;

  status?:RecordStatus[];

  sortBy?:keyof Membership;

  sortDirection?:SortDirection;

}








export async function listMemberships(
  params:ListMembershipsParams
):Promise<PaginatedResult<Membership>>{


 const {

 page,

 pageSize,

 search,

 plan,

 status,

 sortBy="created_at",

 sortDirection="desc",

 } = params;




 const supabase=createClient();




 let query =
 supabase
 .from("memberships")
 .select("*",{
   count:"exact",
 });





 if(search && search.trim()){


 query =
 query.or(

 `membership_id.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%`

 );


 }







 if(plan){


 query =
 query.eq(
 "plan",
 plan
 );


 }







 if(status && status.length){


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

 count,

 }

 =
 await query
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

 throw new Error(
 error.message
 );

 }







 const totalItems =
 count ?? 0;







 return {


 items:
 (data ?? []) as Membership[],



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












export async function getMembershipById(
 id:string
):Promise<Membership|null>{


 const supabase=createClient();



 const {

 data,

 error,

 }

 =
 await supabase
 .from("memberships")
 .select("*")
 .eq(
 "id",
 id
 )
 .maybeSingle();




 if(error){

 throw new Error(
 error.message
 );

 }




 return data as Membership|null;


}









export async function getMembershipByMembershipId(
 membershipId:string
):Promise<Membership|null>{


 const supabase=createClient();



 const {

 data,

 error,

 }

 =
 await supabase
 .from("memberships")
 .select("*")
 .eq(
 "membership_id",
 membershipId
 )
 .maybeSingle();




 if(error){

 throw new Error(
 error.message
 );

 }




 return data as Membership|null;


}









export async function createMembership(
 input:MembershipInsert
):Promise<Membership>{


 const supabase=createClient();



 const {

 data,

 error,

 }

 =
 await supabase
 .from("memberships")
 .insert(input)
 .select()
 .single();





 if(error){

 throw new Error(
 error.message
 );

 }




 return data as Membership;


}









export async function updateMembership(
 id:string,
 input:MembershipUpdate
):Promise<Membership>{


 const supabase=createClient();



 const {

 data,

 error,

 }

 =
 await supabase
 .from("memberships")
 .update(input)
 .eq(
 "id",
 id
 )
 .select()
 .single();





 if(error){

 throw new Error(
 error.message
 );

 }




 return data as Membership;


}









export async function deleteMembership(
 id:string
):Promise<void>{


 const supabase=createClient();



 const {

 error,

 }

 =
 await supabase
 .from("memberships")
 .delete()
 .eq(
 "id",
 id
 );





 if(error){

 throw new Error(
 error.message
 );

 }



}









export async function updateMembershipsStatus(
 ids:string[],
 status:RecordStatus
):Promise<void>{


 const supabase=createClient();



 const {

 error,

 }

 =
 await supabase
 .from("memberships")
 .update({

 status,

 })

 .in(
 "id",
 ids
 );





 if(error){

 throw new Error(
 error.message
 );

 }



}









export async function deleteMemberships(
 ids:string[]
):Promise<void>{


 const supabase=createClient();



 const {

 error,

 }

 =
 await supabase
 .from("memberships")
 .delete()
 .in(
 "id",
 ids
 );





 if(error){

 throw new Error(
 error.message
 );

 }



}









// Service compatibility aliases


export async function bulkDeleteMemberships(
 ids:string[]
):Promise<void>{

 return deleteMemberships(ids);

}







export async function bulkUpdateMembershipsStatus(
 ids:string[],
 status:RecordStatus
):Promise<void>{

 return updateMembershipsStatus(
 ids,
 status
 );

}