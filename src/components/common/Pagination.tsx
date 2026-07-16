"use client";

import { getIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { PAGINATION_DEFAULTS } from "@/constants/app.constants";
import { cn } from "@/lib/utils";
import type { PaginatedResult } from "@/types/common.types";

export interface PaginationProps {
  /** The full `PaginatedResult` shape `paginate()` (`@/lib/helpers/array.helpers`,
   *  Day 3) returns — `Pagination` reads `page`/`pageSize`/`totalItems`/
   *  `totalPages` straight off it rather than four separate props. */
  result: Pick<PaginatedResult<unknown>, "page" | "pageSize" | "totalItems" | "totalPages">;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

/**
 * Pagination — Sprint 09.
 *
 * Generic, entity-agnostic (works with the shared `PaginatedResult<T>`
 * from Day 3, not a subcategory-specific shape), so it lives in
 * `components/common/` — `SubcategoryManagementOverview` is its first
 * consumer, but any future paginated list (Books, Orders, a future
 * Category pagination upgrade) reuses this same component.
 *
 * Deliberately simple: "Showing X–Y of Z" text, Previous/Next buttons,
 * and an optional page-size `Select` (defaulting to
 * `PAGINATION_DEFAULTS`, Day 3) — no numbered page-jump buttons, which
 * would need more state/complexity than this sprint's "reusable UI
 * architecture only" scope calls for. Previous/Next covers the
 * requirement; numbered pages are a straightforward addition to this one
 * component later, not a redesign.
 */
export function Pagination({
  result,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, PAGINATION_DEFAULTS.PAGE_SIZE, 50, 100],
  className,
}: PaginationProps) {
  const { page, pageSize, totalItems, totalPages } = result;
  const ChevronLeft = getIcon("chevron-left");
  const ChevronRight = getIcon("chevron-right");

  const rangeStart = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalItems);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <p className="text-sm text-muted-foreground">
        {totalItems === 0 ? "No results" : `Showing ${rangeStart}–${rangeEnd} of ${totalItems}`}
      </p>

      <div className="flex items-center gap-4">
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page</span>
            <Select
              aria-label="Rows per page"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="w-20"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </Select>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
          <span className="px-2 text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
