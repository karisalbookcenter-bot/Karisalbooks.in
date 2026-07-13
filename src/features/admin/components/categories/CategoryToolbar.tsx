"use client";

import { SearchBar } from "@/components/common/SearchBar";
import { Button } from "@/components/ui/button";
import { getIcon } from "@/lib/icons";
import { CATEGORY_VIEW_OPTIONS } from "@/config/categoryManagement";
import { cn } from "@/lib/utils";
import { CategoryFilters } from "./CategoryFilters";
import type { CategoryToolbarProps } from "@/features/admin/types/category-management.types";

/**
 * CategoryToolbar — Sprint 08 (Task 8).
 *
 * Combines this sprint's `SearchBar` (common), `CategoryFilters`, a
 * config-driven table/tree view switcher (`CATEGORY_VIEW_OPTIONS`,
 * `@/config/categoryManagement`), and an "Add Category" button into the
 * single row every category screen renders above its table/tree. Every
 * piece is a controlled prop the caller supplies — the toolbar holds no
 * state of its own — so `CategoryManagementOverview` (or a future real
 * page) owns the actual search/filter/view state and decides what to do
 * with it (client-side filter today via `searchCategories`/
 * `filterCategoriesByStatus`; a server query in a future CRUD sprint).
 *
 * "Add Category" defaults to a no-op (`onAddCategory` is optional) — the
 * button renders as a placeholder per this sprint's UI-only scope; a
 * future sprint opens a real modal/route built around
 * `CategoryFormLayout`.
 */
export function CategoryToolbar({
  searchValue,
  onSearchChange,
  filtersValue,
  onFiltersChange,
  view,
  onViewChange,
  onAddCategory,
  className,
}: CategoryToolbarProps) {
  const PlusIcon = getIcon("plus");

  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar
          value={searchValue}
          onChange={onSearchChange}
          placeholder="Search categories..."
          className="sm:max-w-xs"
        />
        <CategoryFilters value={filtersValue} onChange={onFiltersChange} />
      </div>

      <div className="flex items-center gap-2">
        <div role="group" aria-label="Switch view" className="flex rounded-md border border-input p-0.5">
          {CATEGORY_VIEW_OPTIONS.map((option) => {
            const Icon = getIcon(option.icon);
            const isActive = option.value === view;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onViewChange?.(option.value)}
                aria-label={option.label}
                aria-pressed={isActive}
                className={cn(
                  "flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">{option.label.replace(" view", "")}</span>
              </button>
            );
          })}
        </div>

        <Button type="button" onClick={onAddCategory}>
          <PlusIcon className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Add Category
        </Button>
      </div>
    </div>
  );
}
