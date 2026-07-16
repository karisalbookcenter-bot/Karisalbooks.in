import type { Category } from "@/types/category.types";
import type { Subcategory } from "@/types/subcategory.types";
import type { RecordStatus } from "@/types/common.types";
import { findCategoryById } from "@/lib/helpers/category.helpers";

/**
 * Subcategory helpers — Sprint 09.
 *
 * Deliberately smaller than `category.helpers.ts` — there is no
 * `buildSubcategoryTree`/`flattenSubcategoryTree` here, because
 * subcategories don't form a tree (see `Subcategory`'s own doc comment).
 * Every function is pure (no I/O, no Supabase), per this sprint's "no
 * database, no business logic" scope, same as `category.helpers.ts`.
 */

/** Resolves a subcategory's parent category's display name — the
 *  "Category linkage" a `SubcategoryTable`/`SubcategoryCard` row shows.
 *  Reuses `findCategoryById` (`@/lib/helpers/category.helpers`, Sprint 08)
 *  rather than re-implementing a lookup, since a subcategory's
 *  `category_id` points into the exact same `Category[]` shape. Returns
 *  `null` only if the referenced category isn't present in the given
 *  list (e.g. a stale/filtered list) — in practice every subcategory has
 *  a category, per the database's `not null` constraint. */
export function getSubcategoryCategoryName(
  subcategory: Subcategory,
  categories: Category[]
): string | null {
  return findCategoryById(categories, subcategory.category_id)?.name ?? null;
}

/** Filters a flat list down to subcategories belonging to one category.
 *  `categoryId` of `null`/`undefined` means "no filter" (returns the list
 *  unchanged), the same convention `filterCategoriesByStatus` uses for an
 *  empty `statuses` array. */
export function filterSubcategoriesByCategory(
  subcategories: Subcategory[],
  categoryId?: string | null
): Subcategory[] {
  if (!categoryId) return subcategories;
  return subcategories.filter((subcategory) => subcategory.category_id === categoryId);
}

/** Filters a flat list down to the given statuses — identical contract to
 *  `filterCategoriesByStatus` (Sprint 08), reimplemented against
 *  `Subcategory` rather than imported, since the two types are
 *  structurally different (`Subcategory` has no `parent_id`) even though
 *  both share the `status: RecordStatus` field this function reads. */
export function filterSubcategoriesByStatus(
  subcategories: Subcategory[],
  statuses?: RecordStatus[]
): Subcategory[] {
  if (!statuses || statuses.length === 0) return subcategories;
  return subcategories.filter((subcategory) => statuses.includes(subcategory.status));
}

/** Case-insensitive search across `name`, `slug`, and `description` — a
 *  plain in-memory filter, not a database query. */
export function searchSubcategories(subcategories: Subcategory[], query: string): Subcategory[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return subcategories;

  return subcategories.filter((subcategory) =>
    [subcategory.name, subcategory.slug, subcategory.description ?? ""].some((field) =>
      field.toLowerCase().includes(normalized)
    )
  );
}
