"use client";

import { useEffect, useState, useCallback } from "react";
import { PageContainer, BulkActionBar, Pagination } from "@/components/common";
// Namespace import — confirmed by useBookForm.ts's own
// `import * as bookService from "@/features/books/services/book.service"`.
// book.service.ts shares function names with book.repository.ts by design
// (BOOK_CRUD_FOUNDATION.md §8), so a named import is not how it's consumed
// anywhere else in the project.
import * as bookService from "@/features/books/services/book.service";
import { authorService } from "@/features/authors/services/author.service";
import { publisherService } from "@/features/publishers/services/publisher.service";
import { BOOK_BULK_ACTIONS, BOOK_PAGE_SIZE_DEFAULT } from "@/config/bookManagement";
import { BookToolbar } from "./BookToolbar";
import { BookFilters } from "./BookFilters";
import { BookTable } from "./BookTable";
import { BookCard } from "./BookCard";
import { BookFormLayout } from "./BookFormLayout";
import { BookSkeleton } from "./BookSkeleton";
import { BookEmptyState } from "./BookEmptyState";
import type { Book } from "@/types/book.types";
import type { Author } from "@/types/author.types";
import type { Publisher } from "@/types/publisher.types";
import type { Category } from "@/types/category.types";
import type { Subcategory } from "@/types/subcategory.types";
import type { BookFilterState } from "@/features/admin/types/book-management.types";

interface BookManagementOverviewProps {
  // Categories/Subcategories have no Supabase backend yet (Sprint 08/09
  // are still UI-architecture-only — see docs/CATEGORY_MANAGEMENT.md §4
  // and docs/SUBCATEGORY_MANAGEMENT.md §4's own "future CRUD integration"
  // sections). Passed in as props rather than fetched here, same as every
  // other consumer of these two entities does today. Pass [] until a
  // future sprint gives them a real service.
  categories: Category[];
  subcategories: Subcategory[];
}

const initialFilters: BookFilterState = {
  search: "",
  statuses: [],
  categoryId: null,
  authorId: null,
  sortBy: "created_at",
  sortDirection: "desc",
  page: 1,
  pageSize: BOOK_PAGE_SIZE_DEFAULT,
};

export function BookManagementOverview({ categories, subcategories }: BookManagementOverviewProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"table" | "card">("table");
  const [filters, setFilters] = useState<BookFilterState>(initialFilters);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingBook, setEditingBook] = useState<Book | null | "new">(null);

  const loadBooks = useCallback(async () => {
    setLoading(true);
    const result = await bookService.listBooks({
      search: filters.search || undefined,
      categoryId: filters.categoryId ?? undefined,
      authorId: filters.authorId ?? undefined,
      status: filters.statuses[0],
      sortBy: filters.sortBy,
      sortDirection: filters.sortDirection,
      page: filters.page,
      pageSize: filters.pageSize,
    });
    if (result.data) {
      setBooks(result.data.items);
      setTotalCount(result.data.total);
    }
    setLoading(false);
  }, [filters]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  // Authors/Publishers DO have a real backend (Sprint 11) — fetched once,
  // not re-fetched on every filter change, since the full lists are small
  // and only used for name-resolution + dropdown options here.
  useEffect(() => {
    authorService.list({ pageSize: 1000 }).then((r) => r.data && setAuthors(r.data.items));
    publisherService.list({ pageSize: 1000 }).then((r) => r.data && setPublishers(r.data.items));
  }, []);

  const handleDelete = async (book: Book) => {
    await bookService.deleteBook(book.id);
    loadBooks();
  };

  const handleBulkAction = async (actionId: string) => {
    if (actionId === "delete") {
      await bookService.deleteBooks(selectedIds);
    } else {
      const status = actionId === "activate" ? "active" : actionId === "deactivate" ? "inactive" : "archived";
      await bookService.updateBooksStatus(selectedIds, status);
    }
    setSelectedIds([]);
    loadBooks();
  };

  const showEmpty = !loading && books.length === 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / filters.pageSize));

  return (
    <PageContainer title="Books" description={`${totalCount} book${totalCount === 1 ? "" : "s"} in catalog`}>
      <BookToolbar
        search={filters.search}
        onSearchChange={(search) => setFilters((f) => ({ ...f, search, page: 1 }))}
        view={view}
        onViewChange={setView}
        onAddBook={() => setEditingBook("new")}
        filtersSlot={
          <BookFilters
            categories={categories}
            authors={authors}
            value={{ statuses: filters.statuses, categoryId: filters.categoryId, authorId: filters.authorId }}
            onChange={(v) => setFilters((f) => ({ ...f, ...v, page: 1 }))}
          />
        }
      />

      {selectedIds.length > 0 && (
        <BulkActionBar
          count={selectedIds.length}
          actions={BOOK_BULK_ACTIONS}
          onAction={handleBulkAction}
        />
      )}

      {editingBook && (
        <div className="rounded-md border border-border bg-card p-4">
          <BookFormLayout
            mode={editingBook === "new" ? "create" : "edit"}
            initialBook={editingBook === "new" ? undefined : editingBook}
            categories={categories}
            subcategories={subcategories}
            authors={authors}
            publishers={publishers}
            onCancel={() => setEditingBook(null)}
            onSuccess={() => {
              setEditingBook(null);
              loadBooks();
            }}
          />
        </div>
      )}

      {loading ? (
        <BookSkeleton view={view} />
      ) : showEmpty ? (
        <BookEmptyState
          variant={filters.search || filters.categoryId || filters.authorId ? "no-results" : "no-books"}
          onAddBook={() => setEditingBook("new")}
        />
      ) : view === "table" ? (
        <BookTable
          books={books}
          categories={categories}
          authors={authors}
          publishers={publishers}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onEdit={setEditingBook}
          onDelete={handleDelete}
          sortBy={filters.sortBy}
          sortDirection={filters.sortDirection}
          onSortChange={(sortBy) =>
            setFilters((f) => ({
              ...f,
              sortBy,
              sortDirection: f.sortBy === sortBy && f.sortDirection === "asc" ? "desc" : "asc",
            }))
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} onEdit={setEditingBook} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {!loading && !showEmpty && (
        <Pagination
          page={filters.page}
          totalPages={totalPages}
          onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
        />
      )}
    </PageContainer>
  );
}
