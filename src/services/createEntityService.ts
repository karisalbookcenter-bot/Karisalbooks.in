import type { ApiResponse, PaginatedResult, RecordStatus } from "@/types/common.types";
import { PAGINATION_DEFAULTS } from "@/constants/app.constants";
import type {
  ListParams,
  SimpleCatalogEntity,
  SimpleCatalogInsert,
  SimpleCatalogUpdate,
  SupabaseRepository,
} from "./createSupabaseRepository";

/**
 * Generic entity service factory — Sprint 11.
 *
 * The service-layer counterpart to `createSupabaseRepository.ts`: wraps
 * any repository built by that factory in the exact same "validate,
 * catch, always return `ApiResponse<T>`, never throw" contract
 * `book.service.ts` (Sprint 10) established by hand. `author.service.ts`/
 * `publisher.service.ts` (this sprint) call this once each rather than
 * re-implementing the same try/catch-to-`ApiResponse` translation twice
 * more.
 */

export interface EntityValidation<TInsert, TUpdate> {
  validateInsert: (input: unknown) => { success: boolean; data?: TInsert; errors?: Record<string, string> };
  validateUpdate: (input: unknown) => { success: boolean; data?: TUpdate; errors?: Record<string, string> };
}

export interface EntityService<T, TInsert, TUpdate> {
  get(id: string): Promise<ApiResponse<T | null>>;
  getBySlug(slug: string): Promise<ApiResponse<T | null>>;
  list(input?: Partial<ListParams>): Promise<ApiResponse<PaginatedResult<T>>>;
  create(input: TInsert): Promise<ApiResponse<T>>;
  update(id: string, input: TUpdate): Promise<ApiResponse<T>>;
  remove(id: string): Promise<ApiResponse<null>>;
  bulkUpdateStatus(ids: string[], status: RecordStatus): Promise<ApiResponse<null>>;
  bulkRemove(ids: string[]): Promise<ApiResponse<null>>;
}

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

function formatValidationErrors(errors?: Record<string, string>): string {
  if (!errors || Object.keys(errors).length === 0) return "Validation failed.";
  return Object.values(errors).join(" ");
}

export function createEntityService<
  T extends SimpleCatalogEntity,
  TInsert extends SimpleCatalogInsert,
  TUpdate extends SimpleCatalogUpdate,
>(
  repository: SupabaseRepository<T, TInsert, TUpdate>,
  validation: EntityValidation<TInsert, TUpdate>
): EntityService<T, TInsert, TUpdate> {
  return {
    get(id) {
      return toApiResponse(() => repository.getById(id));
    },

    getBySlug(slug) {
      return toApiResponse(() => repository.getBySlug(slug));
    },

    list(input = {}) {
      return toApiResponse(() =>
        repository.list({
          page: input.page ?? PAGINATION_DEFAULTS.PAGE,
          pageSize: input.pageSize ?? PAGINATION_DEFAULTS.PAGE_SIZE,
          search: input.search,
          statuses: input.statuses,
          sortBy: input.sortBy,
          sortDirection: input.sortDirection,
        })
      );
    },

    create(input) {
      const validated = validation.validateInsert(input);
      if (!validated.success || !validated.data) {
        return Promise.resolve({
          data: null,
          error: { message: formatValidationErrors(validated.errors), code: "VALIDATION_ERROR" },
        });
      }
      return toApiResponse(() => repository.create(validated.data!));
    },

    update(id, input) {
      const validated = validation.validateUpdate(input);
      if (!validated.success || !validated.data) {
        return Promise.resolve({
          data: null,
          error: { message: formatValidationErrors(validated.errors), code: "VALIDATION_ERROR" },
        });
      }
      return toApiResponse(() => repository.update(id, validated.data!));
    },

    remove(id) {
      return toApiResponse(async () => {
        await repository.remove(id);
        return null;
      });
    },

    bulkUpdateStatus(ids, status) {
      return toApiResponse(async () => {
        await repository.bulkUpdateStatus(ids, status);
        return null;
      });
    },

    bulkRemove(ids) {
      return toApiResponse(async () => {
        await repository.bulkRemove(ids);
        return null;
      });
    },
  };
}
