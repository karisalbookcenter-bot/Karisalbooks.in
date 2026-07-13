"use client";

import { useState } from "react";
import { CategoryTreeRow } from "./CategoryTreeRow";
import { CategorySkeleton } from "./CategorySkeleton";
import { CategoryEmptyState } from "./CategoryEmptyState";
import type { CategoryTreeViewProps } from "@/features/admin/types/category-management.types";

/**
 * CategoryTreeView — Sprint 08 (Task 3).
 *
 * Renders `CategoryTreeNode[]` (built by `buildCategoryTree`,
 * `@/lib/helpers/category.helpers`) as an expandable/collapsible tree —
 * the "unlimited nested categories" and "expand/collapse tree"
 * requirements, satisfied by the same adjacency-list-to-tree pattern
 * Day 4 established for navigation, applied recursively with no depth
 * limit in `CategoryTreeRow`.
 *
 * Expand/collapse state (`expandedIds`) is managed internally via
 * `useState<Set<string>>`, seeded once from `defaultExpandedIds` —
 * deliberately uncontrolled (unlike, say, `AdminSidebar`'s
 * externally-owned collapse state) because per-node expansion is
 * inherently local UI state with no reason a parent page would need to
 * own or persist it across renders. `useSidebarState` (Sprint 06) was
 * considered and rejected here for the same reason: it manages exactly
 * two named booleans, not an arbitrary, growing set of node ids.
 *
 * `role="tree"` / `role="treeitem"` / `role="group"` / `aria-expanded` /
 * `aria-level` (see `CategoryTreeRow`) implement the standard ARIA tree
 * pattern for accessibility; a full roving-tabindex keyboard
 * implementation (arrow-key navigation between nodes) is intentionally
 * not built — noted as a follow-up in `docs/CATEGORY_MANAGEMENT.md`,
 * the same kind of scoped gap Sprint 06 flagged for `MobileNavDrawer`'s
 * focus trap.
 */
export function CategoryTreeView({
  nodes,
  defaultExpandedIds = [],
  selectedIds,
  onToggleSelect,
  loading,
  onClearFilters,
  onEdit,
  onDelete,
  className,
}: CategoryTreeViewProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(defaultExpandedIds));

  if (loading) return <CategorySkeleton view="tree" className={className} />;
  if (nodes.length === 0) {
    return <CategoryEmptyState variant="no-results" onClearFilters={onClearFilters} className={className} />;
  }

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className={className}>
      <ul role="tree" aria-label="Category hierarchy" className="rounded-lg border border-border py-1">
        {nodes.map((node) => (
          <CategoryTreeRow
            key={node.id}
            node={node}
            expandedIds={expandedIds}
            onToggleExpand={toggleExpand}
            selectedIds={selectedIds}
            onToggleSelect={onToggleSelect}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </div>
  );
}
