import {
  subcategoryRepository,
  type ListSubcategoriesParams,
  type SubcategoryInsert,
  type SubcategoryUpdate,
} from "../repositories/subcategory.repository";
import type { Subcategory } from "@/types/subcategory.types";
import type { ApiResponse, PaginatedResult } from "@/types/common.types";

function toApiError(error: unknown): { message: string; code: string } {
  return {
    message: error instanceof Error ? error.message : "Something went wrong.",
    code: "SUBCATEGORY_ERROR",
  };
}

export async function listSubcategories(
  params: ListSubcategoriesParams = {}
): Promise<ApiResponse<PaginatedResult<Subcategory>>> {
  try {
    return { data: await subcategoryRepository.list(params), error: null };
  } catch (error) {
    return { data: null, error: toApiError(error) };
  }
}

export async function getSubcategory(id: string): Promise<ApiResponse<Subcategory>> {
  try {
    const subcategory = await subcategoryRepository.getById(id);
    if (!subcategory) return { data: null, error: { message: "Subcategory not found.", code: "NOT_FOUND" } };
    return { data: subcategory, error: null };
  } catch (error) {
    return { data: null, error: toApiError(error) };
  }
}

export async function createSubcategory(payload: SubcategoryInsert): Promise<ApiResponse<Subcategory>> {
  try {
    return { data: await subcategoryRepository.create(payload), error: null };
  } catch (error) {
    return { data: null, error: toApiError(error) };
  }
}

export async function updateSubcategory(
  id: string,
  payload: SubcategoryUpdate
): Promise<ApiResponse<Subcategory>> {
  try {
    return { data: await subcategoryRepository.update(id, payload), error: null };
  } catch (error) {
    return { data: null, error: toApiError(error) };
  }
}

export async function deleteSubcategory(id: string): Promise<ApiResponse<null>> {
  try {
    await subcategoryRepository.remove(id);
    return { data: null, error: null };
  } catch (error) {
    return { data: null, error: toApiError(error) };
  }
}

export async function deleteSubcategories(ids: string[]): Promise<ApiResponse<null>> {
  try {
    await subcategoryRepository.removeMany(ids);
    return { data: null, error: null };
  } catch (error) {
    return { data: null, error: toApiError(error) };
  }
}

export async function updateSubcategoriesStatus(
  ids: string[],
  status: Subcategory["status"]
): Promise<ApiResponse<null>> {
  try {
    await subcategoryRepository.updateStatusMany(ids, status);
    return { data: null, error: null };
  } catch (error) {
    return { data: null, error: toApiError(error) };
  }
}
