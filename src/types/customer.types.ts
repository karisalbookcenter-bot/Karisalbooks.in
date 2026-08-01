import type { BaseEntity } from "./common.types";

/**
 * Customer entity type — Sprint 12 (Customer Management Framework).
 *
 * Placed in shared, top-level `src/types/` for the same reason `Book`
 * (Sprint 10) and `Author`/`Publisher` (Sprint 11) are — a core domain
 * entity, not an admin-only concept.
 *
 * **UI-architecture-only this sprint** — unlike `Book`/`Author`/
 * `Publisher`, there is no database migration behind this type (no
 * `customers` table exists), matching this sprint's explicit "No
 * Supabase queries, no real data fetching, no CRUD" scope. This mirrors
 * how `Category` (Sprint 08) was first introduced as a pure type before
 * any backend existed for it — `Customer` is at that same stage.
 *
 * Extends `BaseEntity` for `id`/`created_at`/`updated_at`/`status`, the
 * Day 3 convention every entity in this project follows. A real customer
 * account will eventually correspond 1:1 with a Supabase Auth user (see
 * `docs/AUTH_ARCHITECTURE.md` §2 on where role/profile data would live) —
 * that linkage is a future sprint's concern, not represented here.
 */
export interface Customer extends BaseEntity {
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
}
