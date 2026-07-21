"use client";

import { SearchBar } from "@/components/common/SearchBar";
import { Button } from "@/components/ui/button";
import { getIcon } from "@/lib/icons";
import { PUBLISHER_VIEW_OPTIONS } from "@/config/publisherManagement";
import { cn } from "@/lib/utils";
import { PublisherFilters } from "./PublisherFilters";
import type { PublisherToolbarProps } from "@/features/admin/types/publisher-management.types";

/**
 * PublisherToolbar — Sprint 11 (Task 15). Mirrors `AuthorToolbar`
 * exactly.
 */
export function PublisherToolbar({
  searchValue,
  onSearchChange,
  filtersValue,
  onFiltersChange,
  view,
  onViewChange,
  onAddPublisher,
  className,
}: PublisherToolbarProps) {
  const PlusIcon = getIcon("plus");

  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar
          value={searchValue}
          onChange={onSearchChange}
          placeholder="Search publishers..."
          className="sm:max-w-xs"
        />
        <PublisherFilters value={filtersValue} onChange={onFiltersChange} />
      </div>

      <div className="flex items-center gap-2">
        <div role="group" aria-label="Switch view" className="flex rounded-md border border-input p-0.5">
          {PUBLISHER_VIEW_OPTIONS.map((option) => {
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

        <Button type="button" onClick={onAddPublisher}>
          <PlusIcon className="mr-1.5 h-4 w-4" aria-hidden="true" />
          Add Publisher
        </Button>
      </div>
    </div>
  );
}
