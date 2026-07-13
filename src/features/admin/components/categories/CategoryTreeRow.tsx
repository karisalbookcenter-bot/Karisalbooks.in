"use client";

import { getIcon } from "@/lib/icons";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { countDescendants } from "@/lib/helpers/category.helpers";
import { cn } from "@/lib/utils";
import type { CategoryTreeNode } from "@/types/category.types";

export interface CategoryTreeRowProps {
  node: CategoryTreeNode;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  onEdit?: (category: CategoryTreeNode) => void;
  onDelete?: (category: CategoryTreeNode) => void;
}

/**
 * CategoryTreeRow — Sprint 08.
 *
 * One node in `CategoryTreeView`'s tree, rendering itself and then
 * recursing into its own children when expanded — the same "shared row
 * renderer used recursively/by siblings" pattern `SidebarNavItem`
 * (Sprint 06) established, just recursive here since a category tree
 * nests to unlimited depth where the sidebar's nav doesn't.
 *
 * Indentation is `depth * 20px` (via inline style, since Tailwind can't
 * express an arbitrary runtime-computed indent with static utility
 * classes) — `depth` comes pre-computed from `buildCategoryTree`, so this
 * component never recalculates it.
 */
export function CategoryTreeRow({
  node,
  expandedIds,
  onToggleExpand,
  selectedIds,
  onToggleSelect,
  onEdit,
  onDelete,
}: CategoryTreeRowProps) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedIds?.includes(node.id) ?? false;
  const descendantCount = countDescendants(node);

  const ChevronIcon = getIcon(isExpanded ? "chevron-down" : "chevron-right");
  const FolderIcon = getIcon("folder-tree");

  return (
    <li role="treeitem" aria-expanded={hasChildren ? isExpanded : undefined} aria-level={node.depth + 1}>
      <div
        className="group flex items-center gap-2 rounded-md py-2 pr-2 hover:bg-accent/50"
        style={{ paddingLeft: node.depth * 20 + 8 }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggleExpand(node.id)}
            aria-label={isExpanded ? `Collapse ${node.name}` : `Expand ${node.name}`}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : (
          <span className="h-5 w-5 shrink-0" aria-hidden="true" />
        )}

        {onToggleSelect && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(node.id)}
            aria-label={`Select ${node.name}`}
            className="h-4 w-4 shrink-0 rounded border-input"
          />
        )}

        <FolderIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />

        <span className="truncate text-sm font-medium text-foreground">{node.name}</span>
        <span className="shrink-0 text-xs text-muted-foreground">/{node.slug}</span>

        {hasChildren && (
          <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {descendantCount}
          </span>
        )}

        <StatusBadge status={node.status} className="ml-auto shrink-0" />

        <div className={cn("flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100")}>
          {onEdit && (
            <Button type="button" size="sm" variant="ghost" onClick={() => onEdit(node)}>
              Edit
            </Button>
          )}
          {onDelete && (
            <Button type="button" size="sm" variant="ghost" onClick={() => onDelete(node)}>
              Delete
            </Button>
          )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <ul role="group">
          {node.children.map((child) => (
            <CategoryTreeRow
              key={child.id}
              node={child}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              selectedIds={selectedIds}
              onToggleSelect={onToggleSelect}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
