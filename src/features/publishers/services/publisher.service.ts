import { createEntityService } from "@/services/createEntityService";
import { publisherRepository } from "./publisher.repository";
import { validatePublisherInsert, validatePublisherUpdate } from "./publisher.validation";

/**
 * Publisher Service — Sprint 11 (Tasks 4, 8, 10, 11).
 *
 * Mirrors `author.service.ts` exactly, built from the same generic
 * `createEntityService` factory.
 */
export const publisherService = createEntityService(publisherRepository, {
  validateInsert: validatePublisherInsert,
  validateUpdate: validatePublisherUpdate,
});
