import * as repository from "./book.repository";
import { validateBookInsert, validateBookUpdate } from "./book.validation";
import type { Book, BookInsert, BookUpdate } from "@/types/book.types";
import type { ApiResponse, PaginatedResult, RecordStatus, SortDirection } from "@/types/common.types";
import { PAGINATION_DEFAULTS } from "@/constants/app.constants";

/**
 * Book Service — Sprint 10 (Task 2).
 *
 * The layer a future admin page/Server Action/Route Handler actually
 * calls — never `book.repository.ts` directly. Three responsibilities the
 * repository deliberately doesn't have:
 *
 *  1. **Validates** (via `book.validation.ts`) before ever reaching
 *     Supabase, so a bad request never becomes a failed database call.
 *  2. **Catches** whatever the repository throws and shapes it into the
 *     app-wide `ApiResponse<T>` contract (Day 3) — every method here
 *     returns `{ data, error: null }` or `{ data: null, error: {...} }`,
 *     never throws, so a future caller (a Server Action, a hook) always
 *     gets a consistent shape to branch on instead of a try/catch.
 *  3. **Applies defaults** (pagination) so callers don't have to repeat
 *     `PAGINATION_DEFAULTS` at every call site.
 *
 * This mirrors the exact division Sprint 05 established between
 * `features/auth/services/auth.service.ts` (the layer callers use) and
 * the raw `supabase.auth` calls inside it — here, `book.repository.ts`
 * plays the "raw calls" role and this file is the callable layer.
 */

function toApiResponse<T>(fn: () => Promise<T>): Promise<ApiResponse<T>> {
  return fn()
    .then((data) => ({ data, error: null }) as ApiResponse<T>)
    .catch(
      (err: unknown) =>
        ({
          data: null,
          error: { message: err instanceof Error ? err.message : "Something went wrong." },
        }) as ApiResponse<T>
    );
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

/** Book Fetch (Task 8) — a single book by id. */
export function getBook(id: string): Promise<ApiResponse<Book | null>> {
  return toApiResponse(() => repository.getBookById(id));
}

export function getBookBySlug(slug: string): Promise<ApiResponse<Book | null>> {
  return toApiResponse(() => repository.getBookBySlug(slug));
}

/** Book Search + Pagination (Tasks 9–10) — `search`/filters/sort are all
 *  optional; omitting everything just lists all books, newest first,
 *  page 1, at the app's default page size (`PAGINATION_DEFAULTS`, Day 3). */
export function listBooks(input: ListBooksInput = {}): Promise<ApiResponse<PaginatedResult<Book>>> {
  return toApiResponse(() =>
    repository.listBooks({
      page: input.page ?? PAGINATION_DEFAULTS.PAGE,
      pageSize: input.pageSize ?? PAGINATION_DEFAULTS.PAGE_SIZE,
      search: input.search,
      categoryId: input.categoryId,
      subcategoryId: input.subcategoryId,
      authorId: input.authorId,
      publisherId: input.publisherId,
      statuses: input.statuses,
      sortBy: input.sortBy,
      sortDirection: input.sortDirection,
    })
  );
}

/** Book Create (Task 5). Validates first — a validation failure returns
 *  an `ApiError` with every field message joined into `error.message`
 *  (a future form reads structured errors from `validateBookInsert`
 *  directly instead, via `useBookForm`; this joined string is for a
 *  non-form caller, e.g. a script, that just wants one readable reason). */
export function createBook(input: BookInsert): Promise<ApiResponse<Book>> {
  const validation = validateBookInsert(input);
  if (!validation.success || !validation.data) {
    return Promise.resolve({
      data: null,
      error: { message: formatValidationErrors(validation.errors), code: "VALIDATION_ERROR" },
    });
  }
  return toApiResponse(() => repository.createBook(validation.data!));
}

/** Book Update (Task 6). */
export function updateBook(id: string, input: BookUpdate): Promise<ApiResponse<Book>> {
  const validation = validateBookUpdate(input);
  if (!validation.success || !validation.data) {
    return Promise.resolve({
      data: null,
      error: { message: formatValidationErrors(validation.errors), code: "VALIDATION_ERROR" },
    });
  }
  return toApiResponse(() => repository.updateBook(id, validation.data!));
}

/** Book Delete (Task 7). */
export function deleteBook(id: string): Promise<ApiResponse<null>> {
  return toApiResponse(async () => {
    await repository.deleteBook(id);
    return null;
  });
}

/** Bulk equivalents of update/delete — the service-layer counterpart to
 *  `BulkActionBar`'s reported action ids (`"activate"`, `"deactivate"`,
 *  `"archive"`, `"delete"`), ready for a future Book admin screen to call
 *  once it exists. Not wired to any UI this sprint. */
export function bulkUpdateBooksStatus(ids: string[], status: RecordStatus): Promise<ApiResponse<null>> {
  return toApiResponse(async () => {
    await repository.updateBooksStatus(ids, status);
    return null;
  });
}

export function bulkDeleteBooks(ids: string[]): Promise<ApiResponse<null>> {
  return toApiResponse(async () => {
    await repository.deleteBooks(ids);
    return null;
  });
}

function formatValidationErrors(errors?: Record<string, string>): string {
  if (!errors || Object.keys(errors).length === 0) return "Validation failed.";
  return Object.values(errors).join(" ");
}
