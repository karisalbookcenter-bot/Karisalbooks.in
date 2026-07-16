import type { PaginatedResult, SortDirection } from "@/types/common.types";

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

/**
 * Sorts an array of objects by a given key, ascending or descending.
 * Generic and entity-agnostic — added in Sprint 09 for `SubcategoryTable`'s
 * sortable columns, but reusable by any future sortable list (a future
 * `CategoryTable` sort upgrade would call this same function rather than
 * duplicating comparison logic). Strings compare via `localeCompare`;
 * everything else falls back to `<`/`>`. Does not mutate the input array.
 */
export function sortByKey<T>(items: T[], key: keyof T, direction: SortDirection = "asc"): T[] {
  const sorted = [...items].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];

    if (aValue === bValue) return 0;

    if (typeof aValue === "string" && typeof bValue === "string") {
      return aValue.localeCompare(bValue);
    }

    return aValue > bValue ? 1 : -1;
  });

  return direction === "desc" ? sorted.reverse() : sorted;
}
