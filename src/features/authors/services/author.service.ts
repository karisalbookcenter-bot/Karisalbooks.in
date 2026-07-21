import { createEntityService } from "@/services/createEntityService";
import { authorRepository } from "./author.repository";
import { validateAuthorInsert, validateAuthorUpdate } from "./author.validation";

/**
 * Author Service — Sprint 11 (Tasks 3, 7, 9, 11).
 *
 * Built entirely from the generic `createEntityService` factory — the
 * exact same "validate, call the repository, shape `ApiResponse<T>`,
 * never throw" contract `book.service.ts` (Sprint 10) established by
 * hand. `authorService.create`/`update`/`remove` = Author CRUD (Task 7);
 * `authorService.get`/`getBySlug` = Fetch; `authorService.list` with a
 * `search` param = Author Search (Task 9) with pagination (Task 11)
 * built in, identical contract to `book.service.ts`'s `listBooks`.
 */
export const authorService = createEntityService(authorRepository, {
  validateInsert: validateAuthorInsert,
  validateUpdate: validateAuthorUpdate,
});
