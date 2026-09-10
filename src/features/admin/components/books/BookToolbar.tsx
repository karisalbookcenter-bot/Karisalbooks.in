"use client";

import { SearchBar } from "@/components/common";
import { Button } from "@/components/ui/button";
import { getIcon } from "@/lib/icons";
import type { BookToolbarProps } from "@/features/admin/types/book-management.types";

const TableIcon = getIcon("table");
const GridIcon = getIcon("grid");
const PlusIcon = getIcon("plus");

export function BookToolbar({
  search,
  onSearchChange,
  view,
  onViewChange,
  onAddBook,
  filtersSlot,
}: BookToolbarProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-border pb-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-3">
        <SearchBar
          value={search}
          onChange={onSearchChange}
          placeholder="Search by title, ISBN, or description…"
        />
        {filtersSlot}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex rounded-md border border-border">
          <button
            aria-label="Table view"
            className={`p-2 ${view === "table" ? "bg-muted" : ""}`}
            onClick={() => onViewChange("table")}
          >
            <TableIcon className="h-4 w-4" />
          </button>
          <button
            aria-label="Card view"
            className={`p-2 ${view === "card" ? "bg-muted" : ""}`}
            onClick={() => onViewChange("card")}
          >
            <GridIcon className="h-4 w-4" />
          </button>
        </div>
        {onAddBook && (
          <Button type="button" onClick={onAddBook}>
            <PlusIcon className="mr-1 h-4 w-4" />
            Add Book
          </Button>
        )}
      </div>
    </div>
  );
}
