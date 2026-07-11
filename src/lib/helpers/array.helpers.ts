import type { PaginatedResult } from "@/types/common.types";

/** Splits an array into equal-sized chunks. Useful for grid layouts later. */
export function chunk<T>(items: T[], size: number): T[][] {
  if (size <= 0) return [items];
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}

/** Wraps a full in-memory array into the app's standard `PaginatedResult`
 *  shape. Only appropriate for client-side pagination of small lists;
 *  a real feature with large datasets should paginate at the query level. */
export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number
): PaginatedResult<T> {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = (page - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page,
    pageSize,
    totalItems,
    totalPages,
  };
}
