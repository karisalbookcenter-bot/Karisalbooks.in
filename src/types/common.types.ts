/**
 * Common, cross-cutting TypeScript types shared by every feature.
 * Feature-specific types (e.g. a `Book` interface) belong inside that
 * feature's own `types/` folder, not here.
 */

/** Mirrors the `record_status` enum defined in the Day 2 SQL migration. */
export type RecordStatus = "active" | "inactive" | "archived";

/**
 * Fields every database-backed entity has, per the Day 2 requirement that
 * "every table must contain id, created_at, updated_at, status".
 * Feature entity interfaces should `extend BaseEntity` rather than
 * re-declaring these four fields themselves.
 */
export interface BaseEntity {
  id: string; // UUID
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
  status: RecordStatus;
}

/** Generic wrapper shape for a single successful result. Not tied to any
 *  specific transport (REST, RPC, etc.) — just a consistent shape for
 *  services to return once they exist. */
export interface ApiResult<T> {
  data: T;
  error: null;
}

/** Generic wrapper shape for a failed result. */
export interface ApiError {
  data: null;
  error: {
    message: string;
    code?: string;
  };
}

/** A service call resolves to one or the other — never both, never neither. */
export type ApiResponse<T> = ApiResult<T> | ApiError;

/** Generic paginated list shape, for any future list endpoint. */
export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/** Shorthand utility types used throughout the codebase. */
export type Nullable<T> = T | null;
export type Maybe<T> = T | undefined;
export type ID = string; // UUID, kept as a distinct alias for readability
