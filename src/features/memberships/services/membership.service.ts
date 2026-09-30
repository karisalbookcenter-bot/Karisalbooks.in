// src/features/memberships/services/membership.service.ts

import * as repository from "../repository/membership.repository";

import {
  validateMembershipInsert,
  validateMembershipUpdate,
} from "../validation/membership.validation";

import type {
  Membership,
  MembershipInsert,
  MembershipPlan,
  MembershipUpdate,
} from "@/types/membership.types";

import type {
  ApiResponse,
  PaginatedResult,
  RecordStatus,
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



export interface ListMembershipsInput {

  page?: number;

  pageSize?: number;

  search?: string;

  status?: RecordStatus[];

  sortBy?: keyof Membership;

  sortDirection?: SortDirection;

}



/**
 * Get single membership
 */
export function getMembership(
  id: string
): Promise<ApiResponse<Membership | null>> {

  return toApiResponse(() =>
    repository.getMembershipById(id)
  );

}



/**
 * List memberships
 */
export function listMemberships(
  input: ListMembershipsInput = {}
): Promise<ApiResponse<PaginatedResult<Membership>>> {


  return toApiResponse(() =>
    repository.listMemberships({

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
 * Create Membership
 */
export function createMembership(
  input: MembershipInsert
): Promise<ApiResponse<Membership>> {


  const validation =
    validateMembershipInsert(input);



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
    repository.createMembership(
      validation.data!
    )
  );

}




/**
 * Update Membership
 */
export function updateMembership(
  id: string,
  input: MembershipUpdate
): Promise<ApiResponse<Membership>> {


  const validation =
    validateMembershipUpdate(input);



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
    repository.updateMembership(
      id,
      validation.data!
    )
  );

}




/**
 * Delete Membership
 */
export function deleteMembership(
  id: string
): Promise<ApiResponse<null>> {


  return toApiResponse(async () => {

    await repository.deleteMembership(id);

    return null;

  });

}




/**
 * Activate / Deactivate Membership
 */
export function updateMembershipStatus(
  id: string,
  status: RecordStatus
): Promise<ApiResponse<Membership>> {


  return toApiResponse(() =>
    repository.updateMembership(
      id,
      {
        status,
      }
    )
  );

}




/**
 * Bulk Status Update
 */
export function bulkUpdateMembershipsStatus(
  ids: string[],
  status: RecordStatus
): Promise<ApiResponse<null>> {


  return toApiResponse(async () => {

    await repository.updateMembershipsStatus(
      ids,
      status
    );

    return null;

  });

}




/**
 * Bulk Delete
 */
export function bulkDeleteMemberships(
  ids: string[]
): Promise<ApiResponse<null>> {


  return toApiResponse(async () => {

    await repository.deleteMemberships(
      ids
    );

    return null;

  });

}

export interface ListMembershipPlansInput {

  page?: number;

  pageSize?: number;

  search?: string;

  status?: RecordStatus[];

  sortBy?: keyof MembershipPlan;

  sortDirection?: SortDirection;

}


/**
 * List membership plans
 */
export function listMembershipPlans(
  input: ListMembershipPlansInput = {}
): Promise<ApiResponse<PaginatedResult<MembershipPlan>>> {

  return toApiResponse(() =>
    repository.listMembershipPlans({

      page: input.page ?? 1,

      pageSize: input.pageSize ?? 100,

      search: input.search,

      status: input.status,

      sortBy: input.sortBy,

      sortDirection: input.sortDirection,

    })
  );

}