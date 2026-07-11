import type {
  NavigationItemRecord,
  NavigationItemNode,
} from "@/types/navigation.types";
import type { FeatureFlags } from "@/config/featureFlags";
import { NAV_ITEM_FEATURE_FLAG_MAP } from "@/config/featureFlags";

/**
 * Menu Helper utilities — pure functions that turn flat navigation records
 * (today: hardcoded config; later: rows from a `navigation_items` table)
 * into the tree a header/menu component renders, and back again.
 *
 * None of these render anything — this file is UI-free by design.
 */

/**
 * Assembles a flat list of navigation records into a nested tree, grouping
 * children under their `parent` id. Supports unlimited nesting depth (a
 * child's own children are resolved recursively), the same adjacency-list
 * approach used for `categories` in the Day 2 SQL migration.
 *
 * Items are sorted by `order` at every level.
 */
export function buildNavigationTree(
  items: NavigationItemRecord[],
  parentId: string | null = null
): NavigationItemNode[] {
  return items
    .filter((item) => item.parent === parentId)
    .sort(sortByOrder)
    .map((item) => ({
      ...item,
      children: buildNavigationTree(items, item.id),
    }));
}

/** Flattens a navigation tree back into a flat record list (inverse of
 *  `buildNavigationTree`). Useful for round-tripping through a form/table
 *  editor in a future admin panel. */
export function flattenNavigationTree(
  nodes: NavigationItemNode[]
): NavigationItemRecord[] {
  const result: NavigationItemRecord[] = [];

  for (const node of nodes) {
    const { children, ...record } = node;
    result.push(record);
    if (children.length > 0) {
      result.push(...flattenNavigationTree(children));
    }
  }

  return result;
}

/** Comparator for sorting navigation items by their `order` field, ascending. */
export function sortByOrder(
  a: NavigationItemRecord,
  b: NavigationItemRecord
): number {
  return a.order - b.order;
}

/** Keeps only items marked `visible`. Does not look at children — combine
 *  with `buildNavigationTree` (build first, then prune) if a parent with
 *  no visible children should also be hidden. */
export function getVisibleItems(
  items: NavigationItemRecord[]
): NavigationItemRecord[] {
  return items.filter((item) => item.visible);
}

/** Finds a single navigation record by its slug, or `undefined` if none match. */
export function findNavigationItemBySlug(
  items: NavigationItemRecord[],
  slug: string
): NavigationItemRecord | undefined {
  return items.find((item) => item.slug === slug);
}

/**
 * Filters out navigation items whose visibility is gated behind a feature
 * flag that is currently off (see `NAV_ITEM_FEATURE_FLAG_MAP` in
 * `@/config/featureFlags`). An item with no mapped flag is unaffected.
 *
 * This is what lets `enableOffers = false` hide "Offer Zone" from the menu
 * without editing the navigation config itself.
 */
export function filterByFeatureFlags(
  items: NavigationItemRecord[],
  flags: FeatureFlags
): NavigationItemRecord[] {
  return items.filter((item) => {
    const flagKey = NAV_ITEM_FEATURE_FLAG_MAP[item.id];
    if (!flagKey) return true;
    return flags[flagKey];
  });
}

/**
 * Convenience pipeline: filters by feature flags, keeps only visible items,
 * and assembles the result into a tree — the full pipeline a future header
 * component would run before rendering.
 */
export function resolveNavigationTree(
  items: NavigationItemRecord[],
  flags: FeatureFlags
): NavigationItemNode[] {
  const gated = filterByFeatureFlags(items, flags);
  const visible = getVisibleItems(gated);
  return buildNavigationTree(visible);
}
