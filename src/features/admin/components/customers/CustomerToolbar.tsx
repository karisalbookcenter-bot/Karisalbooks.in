"use client";

import { SearchBar } from "@/components/common/SearchBar";
import { getIcon } from "@/lib/icons";
import { CUSTOMER_VIEW_OPTIONS } from "@/config/customerManagement";
import { cn } from "@/lib/utils";
import { CustomerFilters } from "./CustomerFilters";
import type { CustomerToolbarProps } from "@/features/admin/types/customer-management.types";

/**
 * CustomerToolbar — Sprint 12 (Task 10).
 *
 * Combines `SearchBar` (common) + `CustomerFilters` + a config-driven
 * table/card view switcher — the same structural role as
 * `AuthorToolbar`/`PublisherToolbar` (Sprint 11), with one deliberate
 * omission: **no "Add Customer" button**. `CustomerToolbarProps` has no
 * `onAddCustomer` field — customer accounts are created by customers
 * themselves (a future storefront sign-up), never by an admin filling
 * out a form, so unlike Category/Subcategory/Author/Publisher (all
 * admin-created catalog entities), an "Add" action here would be
 * misleading rather than merely unwired. This also matches this sprint's
 * stricter "No CRUD implementation" framing — the toolbar's job is
 * search/filter/view only.
 */
export function CustomerToolbar({
  searchValue,
  onSearchChange,
  filtersValue,
  onFiltersChange,
  view,
  onViewChange,
  className,
}: CustomerToolbarProps) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar
          value={searchValue}
          onChange={onSearchChange}
          placeholder="Search customers..."
          className="sm:max-w-xs"
        />
        <CustomerFilters value={filtersValue} onChange={onFiltersChange} />
      </div>

      <div role="group" aria-label="Switch view" className="flex rounded-md border border-input p-0.5">
        {CUSTOMER_VIEW_OPTIONS.map((option) => {
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
    </div>
  );
}
