import type { BaseEntity } from "./common.types";

/**
 * Publisher entity types — Sprint 11 (Author & Publisher Management).
 *
 * Same placement reasoning as `Author` (this sprint). Mirrors the Day 2
 * SQL migration's `publishers` table column-for-column — `name`, `slug`,
 * an optional `description`, and an optional `website_url`, in place of
 * `Author`'s `bio`/`photo_url`.
 */
export interface Publisher extends BaseEntity {
  name: string;
  slug: string;
  description: string | null;
  website_url: string | null;
}

export interface PublisherInsert {
  name: string;
  slug?: string;
  description?: string | null;
  website_url?: string | null;
  status?: Publisher["status"];
}

export type PublisherUpdate = Partial<PublisherInsert>;
