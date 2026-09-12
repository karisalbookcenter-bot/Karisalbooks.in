"use client";

import { useMemo, useState } from "react";
import { PageContainer } from "@/components/common/PageContainer";
import { BulkActionBar } from "@/components/common/BulkActionBar";
import {
  buildCategoryTree,
  filterCategoriesByStatus,
  searchCategories,
} from "@/lib/helpers/category.helpers";
import { CATEGORY_BULK_ACTIONS } from "@/config/categoryManagement";
import type { CategoryViewMode } from "@/config/categoryManagement";
import type { CategoryFiltersValue } from "@/features/admin/types/category-management.types";
import * as categoryService from "@/features/categories/services/category.service";
import { CategoryToolbar } from "./CategoryToolbar";
import { CategoryTable } from "./CategoryTable";
import { CategoryTreeView } from "./CategoryTreeView";
import { CategoryEmptyState } from "./CategoryEmptyState";
import { CategoryFormLayout } from "./CategoryFormLayout";
import type { Category, CategoryTreeNode } from "@/types/category.types";
import type { CategoryManagementOverviewProps } from "@/features/admin/types/category-management.types";

const EMPTY_FILTERS: CategoryFiltersValue = { statuses: [] };

type Panel = { mode: "create" } | { mode: "edit"; category: Category };

// Sprint 17: walks the already-built tree to find every descendant id of
// `rootId` — used to exclude a category (and its own descendants) from
// its own "Parent Category" picker when editing, exactly the gap
// CategoryFormLayoutProps's own doc comment already named. Kept local to
// this file rather than added to category.helpers.ts, since that file's
// real source was never supplied — adding an export to an unseen file
// risked a naming collision or a different existing convention. Safe to
// fold into category.helpers.ts later once its source is available.
function getDescendantIds(tree: CategoryTreeNode[], rootId: string): Set<string> {
  function findNode(nodes: CategoryTreeNode[]): CategoryTreeNode | null {
    for (const node of nodes) {
      if (node.id === rootId) return node;
      const found = findNode(node.children);
      if (found) return found;
    }
    return null;
  }

  function collect(node: CategoryTreeNode): string[] {
    return node.children.flatMap((child) => [child.id, ...collect(child)]);
  }

  const root = findNode(tree);
  return new Set(root ? collect(root) : []);
}

/**
 * CategoryManagementOverview — Sprint 08 architecture, Sprint 17 write path.
 *
 * Sprint 17 adds exactly what Sprint 08's own doc comments already flagged
 * as deferred: a `panel` state (which form is open), `onEdit`/`onDelete`
 * wired to the Table/TreeView (their prop contracts already supported
 * this — they were simply never passed), `onAction` wired to
 * `BulkActionBar`, and `CategoryFormLayout` actually mounted. Still no
 * fetching here — `categories` remains a plain prop, `onDataChange` is
 * how the owning page knows to refetch. Search/filter/tree-orphan
 * behavior is completely unchanged from Sprint 08.
 *
 * The `!hasAnyCategories` → `<CategoryEmptyState/>` gate (which also hides
 * the toolbar, and therefore "Add Category") is intentionally UNCHANGED
 * from Sprint 08 per explicit instruction to preserve existing
 * EmptyState/Toolbar behavior exactly. Known consequence: the very first
 * category in an empty catalog cannot be added from this screen. Flagged,
 * not silently fixed — see docs/CATEGORY_SUBCATEGORY_ADMIN_CRUD.md.
 */
export function CategoryManagementOverview({
  categories = [],
  loading,
  onDataChange,
  className,
}: CategoryManagementOverviewProps) {
  const [view, setView] = useState<CategoryViewMode>("table");
  const [searchValue, setSearchValue] = useState("");
  const [filtersValue, setFiltersValue] = useState<CategoryFiltersValue>(EMPTY_FILTERS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [panel, setPanel] = useState<Panel | null>(null);

  const filteredCategories = useMemo(() => {
    const searched = searchCategories(categories, searchValue);
    return filterCategoriesByStatus(searched, filtersValue.statuses);
  }, [categories, searchValue, filtersValue]);

  const tree = useMemo(() => buildCategoryTree(categories), [categories]);

  const parentOptions = useMemo(() => {
    if (panel?.mode !== "edit") return categories;
    const excluded = getDescendantIds(tree, panel.category.id);
    excluded.add(panel.category.id);
    return categories.filter((c) => !excluded.has(c.id));
  }, [categories, tree, panel]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function clearFilters() {
    setSearchValue("");
    setFiltersValue(EMPTY_FILTERS);
  }

  async function handleDelete(category: Category) {
    await categoryService.deleteCategory(category.id);
    onDataChange?.();
  }

  async function handleBulkAction(actionId: string) {
    if (actionId === "delete") {
      await categoryService.deleteCategories(selectedIds);
    } else {
      const status = actionId === "activate" ? "active" : actionId === "deactivate" ? "inactive" : "archived";
      await categoryService.updateCategoriesStatus(selectedIds, status as Category["status"]);
    }
    setSelectedIds([]);
    onDataChange?.();
  }

  const hasAnyCategories = categories.length > 0;

  return (
    <PageContainer
      title="Categories"
      description="Organize your catalog into an unlimited-depth category hierarchy."
      className={className}
    >
      {!loading && !hasAnyCategories ? (
        <CategoryEmptyState variant="no-data" />
      ) : (
        <div className="flex flex-col gap-4">
          <CategoryToolbar
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            filtersValue={filtersValue}
            onFiltersChange={setFiltersValue}
            view={view}
            onViewChange={setView}
            onAddCategory={() => setPanel({ mode: "create" })}
          />

          {panel && (
            <div className="rounded-md border border-border bg-card p-4">
              <CategoryFormLayout
                mode={panel.mode}
                categoryId={panel.mode === "edit" ? panel.category.id : undefined}
                defaultValues={
                  panel.mode === "edit"
                    ? {
                        name: panel.category.name,
                        slug: panel.category.slug,
                        description: panel.category.description ?? "",
                        parentId: panel.category.parent_id,
                        status: panel.category.status,
                      }
                    : undefined
                }
                parentOptions={parentOptions}
                onCancel={() => setPanel(null)}
                onSuccess={() => {
                  setPanel(null);
                  onDataChange?.();
                }}
              />
            </div>
          )}

          <BulkActionBar
            count={selectedIds.length}
            actions={CATEGORY_BULK_ACTIONS}
            onAction={handleBulkAction}
            onClear={() => setSelectedIds([])}
          />

          {view === "table" ? (
            <CategoryTable
              categories={filteredCategories}
              allCategories={categories}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onClearFilters={clearFilters}
              onEdit={(category) => setPanel({ mode: "edit", category })}
              onDelete={handleDelete}
              loading={loading}
            />
          ) : (
            <CategoryTreeView
              nodes={tree}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onClearFilters={clearFilters}
              onEdit={(category) => setPanel({ mode: "edit", category })}
              onDelete={handleDelete}
              loading={loading}
            />
          )}
        </div>
      )}
    </PageContainer>
  );
}
