"use client";

import { StatusBadge } from "@/components/common";
import { TableSkeleton } from "@/features/admin/components/skeletons";
import { getIcon } from "@/lib/icons";
import { formatCurrency, formatDate } from "@/lib/helpers/format.helpers";
import { findCategoryById } from "@/lib/helpers/category.helpers";
import type { BookTableProps } from "@/features/admin/types/book-management.types";
import { BookEmptyState } from "./BookEmptyState";

const SortIcon = getIcon("chevron-up");

export function BookTable({
  books,
  categories,
  authors,
  loading,
  selectedIds = [],
  onSelectionChange,
  onEdit,
  onDelete,
  sortBy,
  sortDirection,
  onSortChange,
}: BookTableProps) {
  if (loading) return <TableSkeleton rows={8} columns={7} />;
  if (books.length === 0) return <BookEmptyState variant="no-results" />;

  const allSelected = books.length > 0 && selectedIds.length === books.length;

  const toggleAll = () => {
    onSelectionChange?.(allSelected ? [] : books.map((b) => b.id));
  };

  const toggleOne = (id: string) => {
    if (!onSelectionChange) return;
    onSelectionChange(
      selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]
    );
  };

  const authorName = (authorId: string) => authors.find((a) => a.id === authorId)?.name ?? "—";
  const categoryName = (categoryId: string) => findCategoryById(categories, categoryId)?.name ?? "—";

  const headerCell = (label: string, key?: string) => (
    <th
      className="px-4 py-3 text-left text-sm font-medium text-muted-foreground select-none"
      onClick={key && onSortChange ? () => onSortChange(key) : undefined}
      style={key && onSortChange ? { cursor: "pointer" } : undefined}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {key && sortBy === key && (
          <SortIcon
            className="h-3 w-3"
            style={{ transform: sortDirection === "desc" ? "rotate(180deg)" : undefined }}
          />
        )}
      </span>
    </th>
  );

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full border-collapse">
        <thead className="border-b border-border bg-muted/40">
          <tr>
            <th className="w-10 px-4 py-3">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all books" />
            </th>
            {headerCell("Title", "title")}
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Category</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Author</th>
            {headerCell("Price", "price")}
            {headerCell("Stock", "stock_quantity")}
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
            <th className="w-24 px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.id} className="border-b border-border last:border-0 hover:bg-muted/20">
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(book.id)}
                  onChange={() => toggleOne(book.id)}
                  aria-label={`Select ${book.title}`}
                />
              </td>
              <td className="px-4 py-3 text-sm font-medium text-foreground">{book.title}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{categoryName(book.category_id)}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{authorName(book.author_id)}</td>
              <td className="px-4 py-3 text-sm text-foreground">{formatCurrency(book.price)}</td>
              <td className="px-4 py-3 text-sm text-foreground">{book.stock_quantity}</td>
              <td className="px-4 py-3">
                <StatusBadge status={book.status} />
              </td>
              <td className="px-4 py-3 text-right text-sm">
                <button className="text-muted-foreground hover:text-foreground" onClick={() => onEdit?.(book)}>
                  Edit
                </button>
                <button
                  className="ml-3 text-destructive hover:opacity-80"
                  onClick={() => onDelete?.(book)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
