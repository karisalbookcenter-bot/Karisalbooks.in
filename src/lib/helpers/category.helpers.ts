import type { Category, CategoryTreeNode } from "@/types/category.types";
import type { RecordStatus } from "@/types/common.types";

/**
 * Category helpers — Sprint 08.
 *
 * The same adjacency-list-to-tree algorithm as `buildNavigationTree`
 * (`@/lib/helpers/menu.helpers`, Day 4), applied to `Category` instead of
 * `NavigationItemRecord`. A shared generic couldn't cleanly cover both:
 * `Category` has no `order`/`visible` fields to sort/filter by (categories
 * sort by `name` instead, and have no visibility flag — only `status`), so
 * reusing the exact typed nav functions would mean bolting on fields a
 * category row doesn't have. Reimplementing the same *pattern* against the
 * right shape was the more honest option; see
 * `docs/CATEGORY_MANAGEMENT.md` for the full comparison.
 *
 * Every function here is pure (no I/O, no Supabase, no fetch) — these
 * operate only on arrays already in memory, per this sprint's "no
 * database, no business logic" scope.
 */

/**
 * Assembles a flat list of categories into a nested tree, grouping
 * children under their `parent_id`, sorted alphabetically by `name` at
 * every level (categories have no explicit `order` field — Day 2's schema
 * only defines `name`, not a manual sort position). Recurses to unlimited
 * depth, the same as `buildNavigationTree`.
 */
export function buildCategoryTree(
  categories: Category[],
  parentId: string | null = null,
  depth = 0
): CategoryTreeNode[] {
  return categories
    .filter((category) => category.parent_id === parentId)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((category) => ({
      ...category,
      depth,
      children: buildCategoryTree(categories, category.id, depth + 1),
    }));
}

/** Flattens a category tree back into a flat list (inverse of
 *  `buildCategoryTree`), dropping the computed `children`/`depth` fields
 *  — useful for round-tripping through a future form/table editor. */
export function flattenCategoryTree(nodes: CategoryTreeNode[]): Category[] {
  const result: Category[] = [];

  for (const node of nodes) {
    const { children, depth, ...category } = node;
    result.push(category);
    if (children.length > 0) {
      result.push(...flattenCategoryTree(children));
    }
  }

  return result;
}

/** Counts every descendant (children, grandchildren, ...) under a node —
 *  used by `CategoryTreeView`/`CategoryCard` to show a "12 subcategories"
 *  style count without the caller needing to walk the tree itself. */
export function countDescendants(node: CategoryTreeNode): number {
  return node.children.reduce(
    (total, child) => total + 1 + countDescendants(child),
    0
  );
}

/** Looks up a single category by id in a flat list. */
export function findCategoryById(
  categories: Category[],
  id: string
): Category | undefined {
  return categories.find((category) => category.id === id);
}

/** Looks up a single category by slug in a flat list. */
export function findCategoryBySlug(
  categories: Category[],
  slug: string
): Category | undefined {
  return categories.find((category) => category.slug === slug);
}

/** Resolves a category's parent's display name, or `null` for a
 *  top-level category — exactly the "Parent Category display"
 *  requirement, computed once here rather than duplicated in both
 *  `CategoryTable` and `CategoryCard`. */
export function getParentCategoryName(
  category: Category,
  categories: Category[]
): string | null {
  if (!category.parent_id) return null;
  return findCategoryById(categories, category.parent_id)?.name ?? null;
}

/** Filters a flat list down to the given statuses. An empty/undefined
 *  `statuses` means "no filter" (returns the list unchanged) — the same
 *  convention `CategoryFilters` uses for its "All" option. */
export function filterCategoriesByStatus(
  categories: Category[],
  statuses?: RecordStatus[]
): Category[] {
  if (!statuses || statuses.length === 0) return categories;
  return categories.filter((category) => statuses.includes(category.status));
}

/** Case-insensitive search across `name`, `slug`, and `description` — a
 *  plain in-memory filter, not a database query, per this sprint's scope. */
export function searchCategories(categories: Category[], query: string): Category[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return categories;

  return categories.filter((category) =>
    [category.name, category.slug, category.description ?? ""].some((field) =>
      field.toLowerCase().includes(normalized)
    )
  );
}

/**
 * Flattens categories into a depth-ordered `{ category, depth }` list,
 * suitable for populating a `<select>` with indented option labels (e.g.
 * "— Fantasy" one level under "Fiction"). Added in Sprint 09 for
 * `ParentCategorySelector` — reuses `buildCategoryTree` rather than
 * re-walking `category_id`/`parent_id` relationships a second way, so a
 * category picker's option order always matches `CategoryTreeView`'s
 * rendering order exactly.
 */
export function getCategoryOptionList(
  categories: Category[]
): Array<{ category: Category; depth: number }> {
  const result: Array<{ category: Category; depth: number }> = [];

  function walk(nodes: CategoryTreeNode[]) {
    for (const node of nodes) {
      const { children, depth, ...category } = node;
      result.push({ category, depth });
      if (children.length > 0) walk(children);
    }
  }

  walk(buildCategoryTree(categories));
  return result;
}
