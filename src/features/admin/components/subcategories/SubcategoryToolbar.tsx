"use client";

import { SearchBar } from "@/components/common/SearchBar";
import { Button } from "@/components/ui/button";
import { getIcon } from "@/lib/icons";
import { SUBCATEGORY_VIEW_OPTIONS } from "@/config/subcategoryManagement";
import { cn } from "@/lib/utils";
import { SubcategoryFilters } from "./SubcategoryFilters";
import type { SubcategoryToolbarProps } from "@/features/admin/types/subcategory-management.types";

/**
 * SubcategoryToolbar — Sprint 09 (Task 7).
 *
 * Structurally identical role to `CategoryToolbar` (Sprint 08): combines
 * `SearchBar` (common, reused as-is), `SubcategoryFilters`, a
 * config-driven table/card view switcher (`SUBCATEGORY_VIEW_OPTIONS` —
 * "card," not "tree," since subcategories don't nest), and an
 * "Add Subcategory" button. Holds no state of its own — every value is a
 * controlled prop from `SubcategoryManagementOverview`.
 */
export function SubcategoryToolbar({
  searchValue,
  onSearchChange,
  filtersValue,
  onFiltersChange,
  categories,
  view,
  onViewChange,
  onAddSubcategory,
  className,
}: SubcategoryToolbarProps) {
  const PlusIcon = getIcon("plus");

  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar
          value={searchValue}
          onChange={onSearchChange}
          placeholder="Search subcategories..."
          className="sm:max-w-xs"
        />
        <SubcategoryFilters value={filtersValue} onChange={onFiltersChange} categories={categories} />
      </div>

      <div className="flex items-center gap-2">
        <div role="group" aria-label="Switch view" className="flex rounded-md border border-input p-0.5">
          {SUBCATEGORY_VIEW_OPTIONS.map((option) => {
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

        <Button type="button" onClick={onAddSubcategory}>
          <PlusIcon className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Add Subcategory
        </Button>
      </div>
    </div>
  );
}
