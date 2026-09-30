// src/features/offers/services/offer.service.ts

import * as repository from "../repository/offer.repository";

import {
  validateOfferInsert,
  validateOfferUpdate,
} from "../validation/offer.validation";

import type {
  Offer,
  OfferInsert,
  OfferStatus,
  OfferUpdate,
} from "@/types/offer.types";

import type {
  ApiResponse,
  PaginatedResult,
  SortDirection,
} from "@/types/common.types";


function toApiResponse<T>(
  fn: () => Promise<T>
): Promise<ApiResponse<T>> {

  return fn()
    .then((data) => ({
      data,
      error: null,
    }))
    .catch((err: unknown) => ({
      data: null,
      error: {
        message:
          err instanceof Error
            ? err.message
            : "Something went wrong.",
      },
    }));

}



export interface ListOffersInput {

  page?: number;

  pageSize?: number;

  search?: string;

  status?: OfferStatus[];

  sortBy?: keyof Offer;

  sortDirection?: SortDirection;

}



/**
 * Get Offer
 */
export function getOffer(
  id: string
): Promise<ApiResponse<Offer | null>> {

  return toApiResponse(() =>
    repository.getOfferById(id)
  );

}



/**
 * List Offers
 */
export function listOffers(
  input: ListOffersInput = {}
): Promise<ApiResponse<PaginatedResult<Offer>>> {


  return toApiResponse(() =>
    repository.listOffers({

      page:
        input.page ?? 1,

      pageSize:
        input.pageSize ?? 10,

      search:
        input.search,

      status:
        input.status,

      sortBy:
        input.sortBy,

      sortDirection:
        input.sortDirection,

    })
  );

}




/**
 * Create Offer
 */
export function createOffer(
  input: OfferInsert
): Promise<ApiResponse<Offer>> {


  const validation =
    validateOfferInsert(input);



  if (!validation.success || !validation.data) {

    return Promise.resolve({

      data: null,

      error: {
        message:
          Object.values(
            validation.errors ?? {}
          ).join(" "),

        code:
          "VALIDATION_ERROR",
      },

    });

  }



  return toApiResponse(() =>
    repository.createOffer(
      validation.data!
    )
  );

}




/**
 * Update Offer
 */
export function updateOffer(
  id: string,
  input: OfferUpdate
): Promise<ApiResponse<Offer>> {


  const validation =
    validateOfferUpdate(input);



  if (!validation.success || !validation.data) {

    return Promise.resolve({

      data: null,

      error: {
        message:
          Object.values(
            validation.errors ?? {}
          ).join(" "),

        code:
          "VALIDATION_ERROR",
      },

    });

  }



  return toApiResponse(() =>
    repository.updateOffer(
      id,
      validation.data!
    )
  );

}




/**
 * Delete Offer
 */
export function deleteOffer(
  id: string
): Promise<ApiResponse<null>> {


  return toApiResponse(async () => {

    await repository.deleteOffer(id);

    return null;

  });

}




/**
 * Bulk Status Update
 */
export function bulkUpdateOffersStatus(
  ids: string[],
  status: OfferStatus
): Promise<ApiResponse<null>> {


  return toApiResponse(async () => {

    await repository.updateOffersStatus(
      ids,
      status
    );

    return null;

  });

}




/**
 * Bulk Delete
 */
export function bulkDeleteOffers(
  ids: string[]
): Promise<ApiResponse<null>> {


  return toApiResponse(async () => {

    await repository.deleteOffers(ids);

    return null;

  });

}