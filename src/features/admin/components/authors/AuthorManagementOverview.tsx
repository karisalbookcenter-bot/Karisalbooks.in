"use client";

import { useMemo, useState } from "react";
import { PageContainer } from "@/components/common/PageContainer";
import { BulkActionBar } from "@/components/common/BulkActionBar";
import { Pagination } from "@/components/common/Pagination";
import { AUTHOR_BULK_ACTIONS } from "@/config/authorManagement";
import type { AuthorViewMode } from "@/config/authorManagement";
import { paginate } from "@/lib/helpers/array.helpers";
import { PAGINATION_DEFAULTS } from "@/constants/app.constants";
import type { Author } from "@/types/author.types";
import type {
  AuthorFiltersValue,
  AuthorManagementOverviewProps,
} from "@/features/admin/types/author-management.types";
import { AuthorToolbar } from "./AuthorToolbar";
import { AuthorTable } from "./AuthorTable";
import { AuthorCard } from "./AuthorCard";
import { AuthorEmptyState } from "./AuthorEmptyState";

const EMPTY_FILTERS: AuthorFiltersValue = { statuses: [] };

function searchAuthors(authors: Author[], query: string): Author[] {
  const normalized = query.trim().toLowerCase();

  if (!normalized) return authors;

  return authors.filter((author) =>
    [author.name, author.slug, author.bio ?? ""].some((field) =>
      field.toLowerCase().includes(normalized)
    )
  );
}

function filterAuthorsByStatus(
  authors: Author[],
  statuses: AuthorFiltersValue["statuses"]
): Author[] {
  if (statuses.length === 0) return authors;

  return authors.filter((author) =>
    statuses.includes(author.status)
  );
}

export function AuthorManagementOverview({
  authors = [],
  bookCounts,
  loading,
  className,
}: AuthorManagementOverviewProps) {
  const [view, setView] = useState<AuthorViewMode>("table");

  const [searchValue, setSearchValue] = useState("");

  const [filtersValue, setFiltersValue] =
    useState<AuthorFiltersValue>(EMPTY_FILTERS);

  const [page, setPage] = useState<number>(
    PAGINATION_DEFAULTS.PAGE
  );

  const [pageSize, setPageSize] = useState<number>(
    PAGINATION_DEFAULTS.PAGE_SIZE
  );

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const searched = searchAuthors(authors, searchValue);

    return filterAuthorsByStatus(
      searched,
      filtersValue.statuses
    );
  }, [authors, searchValue, filtersValue]);

  const paginated = useMemo(
    () => paginate(filtered, page, pageSize),
    [filtered, page, pageSize]
  );

  function toggleSelect(id: string) {
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter((x) => x !== id)
        : [...previous, id]
    );
  }

  function updateSearch(next: string) {
    setSearchValue(next);
    setPage(PAGINATION_DEFAULTS.PAGE);
  }

  function updateFilters(next: AuthorFiltersValue) {
    setFiltersValue(next);
    setPage(PAGINATION_DEFAULTS.PAGE);
  }

  function clearFilters() {
    setSearchValue("");
    setFiltersValue(EMPTY_FILTERS);
    setPage(PAGINATION_DEFAULTS.PAGE);
  }

  const hasAnyAuthors = authors.length > 0;

  return (
    <PageContainer
      title="Authors"
      description="Manage the authors whose books appear in your catalog."
      className={className}
    >
      {!loading && !hasAnyAuthors ? (
        <AuthorEmptyState variant="no-data" />
      ) : (
        <div className="flex flex-col gap-4">

          <AuthorToolbar
            searchValue={searchValue}
            onSearchChange={updateSearch}
            filtersValue={filtersValue}
            onFiltersChange={updateFilters}
            view={view}
            onViewChange={setView}
          />

          <BulkActionBar
            count={selectedIds.length}
            actions={AUTHOR_BULK_ACTIONS}
            onClear={() => setSelectedIds([])}
          />

          {view === "table" ? (
            <AuthorTable
              authors={paginated.items}
              bookCounts={bookCounts}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onClearFilters={clearFilters}
              loading={loading}
            />
          ) : loading ? (
            <AuthorEmptyState variant="no-results" />
          ) : paginated.items.length === 0 ? (
            <AuthorEmptyState
              variant="no-results"
              onClearFilters={clearFilters}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paginated.items.map((author) => (
                <AuthorCard
                  key={author.id}
                  author={author}
                  bookCount={bookCounts?.[author.id]}
                  selected={selectedIds.includes(author.id)}
                  onToggleSelect={() => toggleSelect(author.id)}
                />
              ))}
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <Pagination
  result={paginated}
  onPageChange={(pageNumber) => {
    setPage(pageNumber);
  }}
  onPageSizeChange={(size) => {
    setPageSize(size);
    setPage(PAGINATION_DEFAULTS.PAGE);
  }}
/>
          )}

        </div>
      )}
    </PageContainer>
  );
}