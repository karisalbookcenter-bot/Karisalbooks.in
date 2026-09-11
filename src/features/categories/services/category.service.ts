import {
  categoryRepository,
  type ListCategoriesParams,
  type CategoryInsert,
  type CategoryUpdate,
} from "../repositories/category.repository";
import type { Category } from "@/types/category.types";
import type { ApiResponse, PaginatedResult } from "@/types/common.types";

/**
 * category.service.ts — Sprint 16.
 *
 * Named function exports (not a single object), consumed via a namespace
 * import — the same shape book.service.ts uses (confirmed via
 * useBookForm.ts's `import * as bookService from "@/features/books/services/book.service"`),
 * not the single-object-export shape Author/Publisher's createEntityService
 * produces. Every function returns ApiResponse<T> — { data, error } —
 * matching useBookForm.ts's ApiResponse<Book> usage exactly.
 */

function toApiError(error: unknown): { message: string; code: string } {
  return {
    message: error instanceof Error ? error.message : "Something went wrong.",
    code: "CATEGORY_ERROR",
  };
}

export async function listCategories(
  params: ListCategoriesParams = {}
): Promise<ApiResponse<PaginatedResult<Category>>> {
  try {
    return { data: await categoryRepository.list(params), error: null };
  } catch (error) {
    return { data: null, error: toApiError(error) };
  }
}

export async function getCategory(id: string): Promise<ApiResponse<Category>> {
  try {
    const category = await categoryRepository.getById(id);
    if (!category) return { data: null, error: { message: "Category not found.", code: "NOT_FOUND" } };
    return { data: category, error: null };
  } catch (error) {
    return { data: null, error: toApiError(error) };
  }
}

export async function createCategory(payload: CategoryInsert): Promise<ApiResponse<Category>> {
  try {
    return { data: await categoryRepository.create(payload), error: null };
  } catch (error) {
    return { data: null, error: toApiError(error) };
  }
}

export async function updateCategory(id: string, payload: CategoryUpdate): Promise<ApiResponse<Category>> {
  try {
    return { data: await categoryRepository.update(id, payload), error: null };
  } catch (error) {
    return { data: null, error: toApiError(error) };
  }
}

export async function deleteCategory(id: string): Promise<ApiResponse<null>> {
  try {
    await categoryRepository.remove(id);
    return { data: null, error: null };
  } catch (error) {
    return { data: null, error: toApiError(error) };
  }
}

export async function deleteCategories(ids: string[]): Promise<ApiResponse<null>> {
  try {
    await categoryRepository.removeMany(ids);
    return { data: null, error: null };
  } catch (error) {
    return { data: null, error: toApiError(error) };
  }
}

export async function updateCategoriesStatus(
  ids: string[],
  status: Category["status"]
): Promise<ApiResponse<null>> {
  try {
    await categoryRepository.updateStatusMany(ids, status);
    return { data: null, error: null };
  } catch (error) {
    return { data: null, error: toApiError(error) };
  }
}
