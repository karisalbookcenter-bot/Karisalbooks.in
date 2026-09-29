// src/features/offers/repository/offer.repository.ts

import { createClient } from "@/lib/supabase/server";
import type {
  Offer,
  OfferInsert,
  OfferUpdate,
} from "@/types/offer.types";

import type {
  PaginatedResult,
  RecordStatus,
  SortDirection,
} from "@/types/common.types";


export interface ListOffersParams {
  page: number;
  pageSize: number;

  search?: string;

  status?: RecordStatus[];

  sortBy?: keyof Offer;

  sortDirection?: SortDirection;
}



function mapRow(row: Record<string, unknown>): Offer {

  return {
    ...(row as unknown as Offer),
  };

}



/**
 * Get single offer
 */
export async function getOfferById(
  id: string
): Promise<Offer | null> {

  const supabase = await createClient();


  const {
    data,
    error,
  } =
    await supabase
      .from("offers")
      .select("*")
      .eq("id", id)
      .maybeSingle();



  if (error) {
    throw new Error(error.message);
  }


  return data ? mapRow(data) : null;

}




/**
 * List offers with search + pagination
 */
export async function listOffers(
  params: ListOffersParams
): Promise<PaginatedResult<Offer>> {


  const {
    page,
    pageSize,
    search,
    status,
    sortBy = "created_at",
    sortDirection = "desc",
  } = params;



  const supabase = await createClient();



  let query =
    supabase
      .from("offers")
      .select("*", {
        count: "exact",
      });



  if (search && search.trim()) {

    const term =
      `%${search.trim()}%`;


    query =
      query.ilike(
        "title",
        term
      );

  }



  if (status && status.length > 0) {

    query =
      query.in(
        "status",
        status
      );

  }



  const from =
    (page - 1) * pageSize;


  const to =
    from + pageSize - 1;



  const {
    data,
    error,
    count,
  } =
    await query
      .order(
        sortBy,
        {
          ascending:
            sortDirection === "asc",
        }
      )
      .range(
        from,
        to
      );



  if (error) {

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
          totalItems / pageSize
        )
      ),
  };

}




/**
 * Create offer
 */
export async function createOffer(
  input: OfferInsert
): Promise<Offer> {


  const supabase =
    await createClient();



  const {
    data,
    error,
  } =
    await supabase
      .from("offers")
      .insert(input)
      .select()
      .single();



  if (error) {

    throw new Error(error.message);

  }



  return mapRow(data);

}




/**
 * Update offer
 */
export async function updateOffer(
  id: string,
  input: OfferUpdate
): Promise<Offer> {


  const supabase =
    await createClient();



  const {
    data,
    error,
  } =
    await supabase
      .from("offers")
      .update(input)
      .eq(
        "id",
        id
      )
      .select()
      .single();



  if (error) {

    throw new Error(error.message);

  }



  return mapRow(data);

}




/**
 * Delete offer
 */
export async function deleteOffer(
  id: string
): Promise<void> {


  const supabase =
    await createClient();



  const {
    error,
  } =
    await supabase
      .from("offers")
      .delete()
      .eq(
        "id",
        id
      );



  if (error) {

    throw new Error(error.message);

  }

}




/**
 * Bulk status update
 */
export async function updateOffersStatus(
  ids: string[],
  status: RecordStatus
): Promise<void> {


  const supabase =
    await createClient();



  const {
    error,
  } =
    await supabase
      .from("offers")
      .update({
        status,
      })
      .in(
        "id",
        ids
      );



  if (error) {

    throw new Error(error.message);

  }

}




/**
 * Bulk delete
 */
export async function deleteOffers(
  ids: string[]
): Promise<void> {


  const supabase =
    await createClient();



  const {
    error,
  } =
    await supabase
      .from("offers")
      .delete()
      .in(
        "id",
        ids
      );



  if (error) {

    throw new Error(error.message);

  }

}