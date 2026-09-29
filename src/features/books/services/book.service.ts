import * as repository from "./book.repository";
import {
  validateBookInsert,
  validateBookUpdate,
} from "./book.validation";

import type {
  Book,
  BookInsert,
  BookUpdate,
} from "@/types/book.types";

import type {
  ApiResponse,
  PaginatedResult,
  RecordStatus,
  SortDirection,
} from "@/types/common.types";

import { PAGINATION_DEFAULTS } from "@/constants/app.constants";


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



export interface ListBooksInput {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string | null;
  subcategoryId?: string | null;
  authorId?: string | null;
  publisherId?: string | null;
  statuses?: RecordStatus[];
  sortBy?: keyof Book;
  sortDirection?: SortDirection;
}




export function getBook(
  id: string
): Promise<ApiResponse<Book | null>> {

  return toApiResponse(() =>
    repository.getBookById(id)
  );
}



export function getBookBySlug(
  slug: string
): Promise<ApiResponse<Book | null>> {

  return toApiResponse(() =>
    repository.getBookBySlug(slug)
  );
}





export function listBooks(
  input: ListBooksInput = {}
): Promise<ApiResponse<PaginatedResult<Book>>> {


  return toApiResponse(() =>
    repository.listBooks({

      page:
        input.page ??
        PAGINATION_DEFAULTS.PAGE,

      pageSize:
        input.pageSize ??
        PAGINATION_DEFAULTS.PAGE_SIZE,

      search: input.search,

      categoryId: input.categoryId,

      subcategoryId:
        input.subcategoryId,

      authorId:
        input.authorId,

      publisherId:
        input.publisherId,

      statuses:
        input.statuses,

      sortBy:
        input.sortBy,

      sortDirection:
        input.sortDirection,

    })
  );
}






export function createBook(
  input: BookInsert
): Promise<ApiResponse<Book>> {


  const validation =
    validateBookInsert(input);


  if (
    !validation.success ||
    !validation.data
  ) {

    return Promise.resolve({

      data: null,

      error: {

        message:
          formatValidationErrors(
            validation.errors
          ),

        code:
          "VALIDATION_ERROR",

      },

    });

  }



  return toApiResponse(() =>
    repository.createBook(
      validation.data!
    )
  );

}







export function updateBook(
  id: string,
  input: BookUpdate
): Promise<ApiResponse<Book>> {


  console.log(
    "UPDATE BOOK ID:",
    id
  );


  console.log(
    "UPDATE PAYLOAD:",
    input
  );



  const validation =
    validateBookUpdate(input);



  if (
    !validation.success ||
    !validation.data
  ) {


    return Promise.resolve({

      data: null,

      error: {

        message:
          formatValidationErrors(
            validation.errors
          ),

        code:
          "VALIDATION_ERROR",

      },

    });

  }




  return toApiResponse(() =>
    repository.updateBook(
      id,
      validation.data!
    )
  );


}









export function deleteBook(
  id: string
): Promise<ApiResponse<null>> {


  return toApiResponse(async () => {

    await repository.deleteBook(id);

    return null;

  });

}









export function bulkUpdateBooksStatus(
  ids: string[],
  status: RecordStatus
): Promise<ApiResponse<null>> {


  return toApiResponse(async () => {

    await repository.updateBooksStatus(
      ids,
      status
    );

    return null;

  });

}








export function bulkDeleteBooks(
  ids: string[]
): Promise<ApiResponse<null>> {


  return toApiResponse(async () => {

    await repository.deleteBooks(ids);

    return null;

  });

}








function formatValidationErrors(
  errors?: Record<string,string>
): string {


  if (
    !errors ||
    Object.keys(errors).length === 0
  ) {

    return "Validation failed.";

  }


  return Object.values(errors).join(" ");

}