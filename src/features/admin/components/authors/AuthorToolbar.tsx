"use client";

import { SearchBar } from "@/components/common/SearchBar";
import { Button } from "@/components/ui/button";
import { getIcon } from "@/lib/icons";
import { AUTHOR_VIEW_OPTIONS } from "@/config/authorManagement";
import { cn } from "@/lib/utils";
import { AuthorFilters } from "./AuthorFilters";
import type { AuthorToolbarProps } from "@/features/admin/types/author-management.types";

/**
 * AuthorToolbar — Sprint 11 (Task 14). Same structural role as
 * `CategoryToolbar`/`SubcategoryToolbar` — combines `SearchBar` (common),
 * `AuthorFilters`, a config-driven table/card view switcher, and an
 * "Add Author" button. Holds no state of its own.
 */
export function AuthorToolbar({
  searchValue,
  onSearchChange,
  filtersValue,
  onFiltersChange,
  view,
  onViewChange,
  onAddAuthor,
  className,
}: AuthorToolbarProps) {
  const PlusIcon = getIcon("plus");

  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar
          value={searchValue}
          onChange={onSearchChange}
          placeholder="Search authors..."
          className="sm:max-w-xs"
        />
        <AuthorFilters value={filtersValue} onChange={onFiltersChange} />
      </div>

      <div className="flex items-center gap-2">
        <div role="group" aria-label="Switch view" className="flex rounded-md border border-input p-0.5">
          {AUTHOR_VIEW_OPTIONS.map((option) => {
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

        <Button type="button" onClick={onAddAuthor}>
          <PlusIcon className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Add Author
        </Button>
      </div>
    </div>
  );
}
