import type { BaseEntity } from "./common.types";

/**
 * Category entity types — Sprint 08 (Category Management Framework).
 *
 * Placed in the shared, top-level `src/types/` (not inside
 * `features/admin/`) for the same reason `NavigationItemRecord` lives
 * here rather than in a feature folder (Day 4): a category is a core
 * domain entity, not an admin-only concept — a future public catalog
 * feature (browsing books by category) will need this exact same shape,
 * so it's promoted per the Day 3 rule ("used by two or more features →
 * shared top-level").
 *
 * Field names and types mirror the Day 2 SQL migration's `categories`
 * table column-for-column (`id`, `parent_id`, `name`, `slug`,
 * `description`, `status`, `created_at`, `updated_at`) so this type can
 * become a real Supabase row type later with zero renaming.
 */

/**
 * A single category row, exactly as it would come back from the
 * database — flat, no nested children. `extends BaseEntity` for
 * `id`/`created_at`/`updated_at`/`status`, per the Day 3 convention.
 */
export interface Category extends BaseEntity {
  /** Self-referencing parent id (Day 2's `categories.parent_id`), or
   *  `null` for a top-level/root category. The same adjacency-list
   *  pattern Day 4 used for `NavigationItemRecord.parent` — this is what
   *  gives categories unlimited nesting depth without a schema change. */
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
}

/**
 * A category after being assembled into a tree (grouped by `parent_id`,
 * see `buildCategoryTree` in `@/lib/helpers/category.helpers`). This is
 * the shape `CategoryTreeView` actually renders.
 */
export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
  /** Nesting depth, root = 0. Computed by `buildCategoryTree`; used by
   *  `CategoryTreeView` for indentation so the component itself never
   *  needs to recompute depth while rendering. */
  depth: number;
}
