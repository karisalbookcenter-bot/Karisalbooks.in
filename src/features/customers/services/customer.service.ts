// src/features/customers/services/customer.service.ts


import * as repository from "../repository/customer.repository";


import {
  validateCustomerInsert,
  validateCustomerUpdate,
} from "../validation/customer.validation";


import type {
  Customer,
  CustomerInsert,
  CustomerUpdate,
} from "@/types/customer.types";


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

    .then(
      (data) => ({
        data,
        error:null,
      })
    )


    .catch(
      (err:unknown)=>({

        data:null,

        error:{
          message:
            err instanceof Error
            ? err.message
            : "Something went wrong.",
        },

      })
    );


}









export interface ListCustomersInput {


  page?:number;


  pageSize?:number;


  search?:string;


  status?:RecordStatus[];


  sortBy?:keyof Customer;


  sortDirection?:SortDirection;


}









/**
 * Get customer by id
 */

export function getCustomer(
  id:string
):Promise<ApiResponse<Customer|null>>{


  return toApiResponse(
    () =>
      repository.getCustomerById(id)
  );


}









/**
 * List customers
 */

export function listCustomers(
  input:ListCustomersInput={}
):Promise<ApiResponse<PaginatedResult<Customer>>>{


  return toApiResponse(
    () =>

      repository.listCustomers({

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
 * Create customer
 */

export function createCustomer(
  input:CustomerInsert
):Promise<ApiResponse<Customer>>{


  const validation =
    validateCustomerInsert(input);




  if(
    !validation.success ||
    !validation.data
  ){


    return Promise.resolve({

      data:null,


      error:{

        message:
          Object.values(
            validation.errors ?? {}
          ).join(" "),


        code:
          "VALIDATION_ERROR",

      },

    });


  }






  return toApiResponse(
    () =>
      repository.createCustomer(
        validation.data!
      )
  );


}









/**
 * Update customer
 */

export function updateCustomer(
  id:string,
  input:CustomerUpdate
):Promise<ApiResponse<Customer>>{


  const validation =
    validateCustomerUpdate(input);





  if(
    !validation.success ||
    !validation.data
  ){


    return Promise.resolve({

      data:null,


      error:{

        message:
          Object.values(
            validation.errors ?? {}
          ).join(" "),


        code:
          "VALIDATION_ERROR",

      },

    });


  }






  return toApiResponse(
    () =>
      repository.updateCustomer(
        id,
        validation.data!
      )
  );


}









/**
 * Delete customer
 */

export function deleteCustomer(
  id:string
):Promise<ApiResponse<null>>{


  return toApiResponse(

    async()=>{

      await repository.deleteCustomer(id);

      return null;

    }

  );


}









/**
 * Bulk status update
 */

export function bulkUpdateCustomersStatus(
  ids:string[],
  status:RecordStatus
):Promise<ApiResponse<null>>{


  return toApiResponse(

    async()=>{


      await repository.updateCustomersStatus(
        ids,
        status
      );


      return null;


    }

  );


}









/**
 * Bulk delete
 */

export function bulkDeleteCustomers(
  ids:string[]
):Promise<ApiResponse<null>>{


  return toApiResponse(

    async()=>{


      await repository.deleteCustomers(ids);


      return null;


    }

  );


}