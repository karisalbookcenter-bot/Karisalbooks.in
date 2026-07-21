"use client";

import { useMemo, useState } from "react";
import { PageContainer } from "@/components/common/PageContainer";
import { BulkActionBar } from "@/components/common/BulkActionBar";
import { Pagination } from "@/components/common/Pagination";
import { PUBLISHER_BULK_ACTIONS } from "@/config/publisherManagement";
import type { PublisherViewMode } from "@/config/publisherManagement";
import { paginate } from "@/lib/helpers/array.helpers";
import { PAGINATION_DEFAULTS } from "@/constants/app.constants";
import type { Publisher } from "@/types/publisher.types";
import type {
  PublisherFiltersValue,
  PublisherManagementOverviewProps,
} from "@/features/admin/types/publisher-management.types";
import { PublisherToolbar } from "./PublisherToolbar";
import { PublisherTable } from "./PublisherTable";
import { PublisherCard } from "./PublisherCard";
import { PublisherEmptyState } from "./PublisherEmptyState";

const EMPTY_FILTERS: PublisherFiltersValue = { statuses: [] };

/** Pure, in-memory search — mirrors `searchAuthors` (this sprint) exactly,
 *  searching `description` instead of `bio`. */
function searchPublishers(publishers: Publisher[], query: string): Publisher[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return publishers;
  return publishers.filter((publisher) =>
    [publisher.name, publisher.slug, publisher.description ?? ""].some((field) =>
      field.toLowerCase().includes(normalized)
    )
  );
}

function filterPublishersByStatus(publishers: Publisher[], statuses: PublisherFiltersValue["statuses"]): Publisher[] {
  if (statuses.length === 0) return publishers;
  return publishers.filter((publisher) => statuses.includes(publisher.status));
}

/**
 * PublisherManagementOverview — Sprint 11 (Task 15: Publisher Management
 * UI). Mirrors `AuthorManagementOverview` exactly.
 */
export function PublisherManagementOverview({
  publishers = [],
  bookCounts,
  loading,
  className,
}: PublisherManagementOverviewProps) {
  const [view, setView] = useState<PublisherViewMode>("table");
  const [searchValue, setSearchValue] = useState("");
  const [filtersValue, setFiltersValue] = useState<PublisherFiltersValue>(EMPTY_FILTERS);
  const [page, setPage] = useState(PAGINATION_DEFAULTS.PAGE);
  const [pageSize, setPageSize] = useState<number>(PAGINATION_DEFAULTS.PAGE_SIZE);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const searched = searchPublishers(publishers, searchValue);
    return filterPublishersByStatus(searched, filtersValue.statuses);
  }, [publishers, searchValue, filtersValue]);

  const paginated = useMemo(() => paginate(filtered, page, pageSize), [filtered, page, pageSize]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function updateSearch(next: string) {
    setSearchValue(next);
    setPage(PAGINATION_DEFAULTS.PAGE);
  }

  function updateFilters(next: PublisherFiltersValue) {
    setFiltersValue(next);
    setPage(PAGINATION_DEFAULTS.PAGE);
  }

  function clearFilters() {
    setSearchValue("");
    setFiltersValue(EMPTY_FILTERS);
    setPage(PAGINATION_DEFAULTS.PAGE);
  }

  const hasAnyPublishers = publishers.length > 0;

  return (
    <PageContainer
      title="Publishers"
      description="Manage the publishers whose books appear in your catalog."
      className={className}
    >
      {!loading && !hasAnyPublishers ? (
        <PublisherEmptyState variant="no-data" />
      ) : (
        <div className="flex flex-col gap-4">
          <PublisherToolbar
            searchValue={searchValue}
            onSearchChange={updateSearch}
            filtersValue={filtersValue}
            onFiltersChange={updateFilters}
            view={view}
            onViewChange={setView}
          />

          <BulkActionBar
            count={selectedIds.length}
            actions={PUBLISHER_BULK_ACTIONS}
            onClear={() => setSelectedIds([])}
          />

          {view === "table" ? (
            <PublisherTable
              publishers={paginated.items}
              bookCounts={bookCounts}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onClearFilters={clearFilters}
              loading={loading}
            />
          ) : loading ? (
            <PublisherEmptyState variant="no-results" />
          ) : paginated.items.length === 0 ? (
            <PublisherEmptyState variant="no-results" onClearFilters={clearFilters} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paginated.items.map((publisher) => (
                <PublisherCard
                  key={publisher.id}
                  publisher={publisher}
                  bookCount={bookCounts?.[publisher.id]}
                  selected={selectedIds.includes(publisher.id)}
                  onToggleSelect={() => toggleSelect(publisher.id)}
                />
              ))}
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <Pagination
              result={paginated}
              onPageChange={setPage}
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
