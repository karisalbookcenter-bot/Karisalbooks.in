"use client";

import { useMemo, useState } from "react";
import { PageContainer } from "@/components/common/PageContainer";
import { BulkActionBar } from "@/components/common/BulkActionBar";
import { Pagination } from "@/components/common/Pagination";
import { CUSTOMER_BULK_ACTIONS } from "@/config/customerManagement";
import type { CustomerViewMode } from "@/config/customerManagement";
import { searchCustomers, filterCustomersByStatus } from "@/lib/helpers/customer.helpers";
import { paginate } from "@/lib/helpers/array.helpers";
import { PAGINATION_DEFAULTS } from "@/constants/app.constants";
import type { Customer } from "@/types/customer.types";
import type {
  CustomerFiltersValue,
  CustomerManagementOverviewProps,
} from "@/features/admin/types/customer-management.types";
import { CustomerToolbar } from "./CustomerToolbar";
import { CustomerTable } from "./CustomerTable";
import { CustomerCard } from "./CustomerCard";
import { CustomerEmptyState } from "./CustomerEmptyState";
import { CustomerDetailsPanel } from "./CustomerDetailsPanel";

const EMPTY_FILTERS: CustomerFiltersValue = { statuses: [] };

/**
 * CustomerManagementOverview — Sprint 12 (Task 5: Customer Overview
 * architecture).
 *
 * Follows the exact composed-page shape `AuthorManagementOverview`/
 * `PublisherManagementOverview` (Sprint 11) established — owns search/
 * filter/view/pagination/selection state, renders `CustomerToolbar` +
 * `BulkActionBar` (Sprint 08's component, reused directly, wired with
 * `CUSTOMER_BULK_ACTIONS`) + `CustomerTable`/`CustomerCard` grid +
 * `Pagination` (Sprint 09's component, reused directly) — plus one piece
 * of state none of the prior overviews needed: which customer's
 * `CustomerDetailsPanel` (this sprint's new slide-over, Task 8) is
 * currently open.
 *
 * Pure UI architecture, exactly like Sprint 08/09's Category/Subcategory
 * frameworks were before Sprint 10/11 gave Book/Author/Publisher a real
 * backend — `customers` is a plain prop defaulting to `[]`, no service,
 * no Supabase call, matching this sprint's explicit "no real data
 * fetching" scope. No `app/admin/customers/page.tsx` renders this yet.
 */
export function CustomerManagementOverview({ customers = [], loading, className }: CustomerManagementOverviewProps) {
  const [view, setView] = useState<CustomerViewMode>("table");
  const [searchValue, setSearchValue] = useState("");
  const [filtersValue, setFiltersValue] = useState<CustomerFiltersValue>(EMPTY_FILTERS);
  const [page, setPage] = useState(PAGINATION_DEFAULTS.PAGE);
  const [pageSize, setPageSize] = useState<number>(PAGINATION_DEFAULTS.PAGE_SIZE);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailsCustomer, setDetailsCustomer] = useState<Customer | null>(null);

  const filtered = useMemo(() => {
    const searched = searchCustomers(customers, searchValue);
    return filterCustomersByStatus(searched, filtersValue.statuses);
  }, [customers, searchValue, filtersValue]);

  const paginated = useMemo(() => paginate(filtered, page, pageSize), [filtered, page, pageSize]);

  function toggleSelect(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function updateSearch(next: string) {
    setSearchValue(next);
    setPage(PAGINATION_DEFAULTS.PAGE);
  }

  function updateFilters(next: CustomerFiltersValue) {
    setFiltersValue(next);
    setPage(PAGINATION_DEFAULTS.PAGE);
  }

  function clearFilters() {
    setSearchValue("");
    setFiltersValue(EMPTY_FILTERS);
    setPage(PAGINATION_DEFAULTS.PAGE);
  }

  const hasAnyCustomers = customers.length > 0;

  return (
    <PageContainer
      title="Customers"
      description="View the customers who have created accounts on your storefront."
      className={className}
    >
      {!loading && !hasAnyCustomers ? (
        <CustomerEmptyState variant="no-data" />
      ) : (
        <div className="flex flex-col gap-4">
          <CustomerToolbar
            searchValue={searchValue}
            onSearchChange={updateSearch}
            filtersValue={filtersValue}
            onFiltersChange={updateFilters}
            view={view}
            onViewChange={setView}
          />

          <BulkActionBar
            count={selectedIds.length}
            actions={CUSTOMER_BULK_ACTIONS}
            onClear={() => setSelectedIds([])}
          />

          {view === "table" ? (
            <CustomerTable
              customers={paginated.items}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onClearFilters={clearFilters}
              onViewDetails={setDetailsCustomer}
              loading={loading}
            />
          ) : loading ? (
            <CustomerEmptyState variant="no-results" />
          ) : paginated.items.length === 0 ? (
            <CustomerEmptyState variant="no-results" onClearFilters={clearFilters} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paginated.items.map((customer) => (
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                  selected={selectedIds.includes(customer.id)}
                  onToggleSelect={() => toggleSelect(customer.id)}
                  onViewDetails={() => setDetailsCustomer(customer)}
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

      <CustomerDetailsPanel
        customer={detailsCustomer}
        open={detailsCustomer !== null}
        onClose={() => setDetailsCustomer(null)}
      />
    </PageContainer>
  );
}
