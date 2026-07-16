import type { BaseEntity } from "./common.types";

/**
 * Subcategory entity type — Sprint 09 (Subcategory Management Framework).
 *
 * Placed in shared, top-level `src/types/` for the same reason
 * `Category` (Sprint 08) and `NavigationItemRecord` (Day 4) are — a core
 * domain entity a future public catalog feature will also need, not an
 * admin-only concept.
 *
 * Mirrors the Day 2 SQL migration's `subcategories` table column-for-
 * column. The key structural difference from `Category`: `category_id`
 * is **required** (`not null` in the schema — a subcategory always
 * belongs to exactly one category) and there is no self-referencing
 * `parent_id` — subcategories are a single, fixed layer under a category,
 * not a recursive tree (see Day 2's own migration comment: subcategories
 * are "a fixed, simple child layer directly under a category," distinct
 * from `categories`' unlimited-nesting `parent_id`). This is why Sprint 09
 * has no `SubcategoryTreeView` / `buildSubcategoryTree` counterpart to
 * Sprint 08's `CategoryTreeView` / `buildCategoryTree` — there is no tree
 * to build.
 */
export interface Subcategory extends BaseEntity {
  /** The category this subcategory belongs to. Never `null` — every
   *  subcategory has exactly one parent category, enforced by the
   *  database's `not null` constraint on this column. */
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
}
