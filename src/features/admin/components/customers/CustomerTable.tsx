"use client";

import { formatDate } from "@/lib/helpers/format.helpers";
import { getCustomerInitials } from "@/lib/helpers/customer.helpers";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { CustomerSkeleton } from "./CustomerSkeleton";
import { CustomerEmptyState } from "./CustomerEmptyState";
import type { CustomerTableProps } from "@/features/admin/types/customer-management.types";

/**
 * CustomerTable — Sprint 12 (Task 6).
 *
 * Structurally close to `AuthorTable`/`PublisherTable` (Sprint 11) — same
 * `StatusBadge`/`formatDate` reuse, same internal loading/empty handling
 * — with a "Contact" column (email + phone) in place of a "Books" count,
 * and a single "View details" action (via `onViewDetails`, opening
 * `CustomerDetailsPanel`) instead of Edit/Delete — this framework has no
 * CRUD this sprint, only a read-only details view.
 */
export function CustomerTable({
  customers,
  selectedIds,
  onToggleSelect,
  loading,
  onClearFilters,
  onViewDetails,
  className,
}: CustomerTableProps) {
  if (loading) return <CustomerSkeleton view="table" className={className} />;
  if (customers.length === 0) {
    return <CustomerEmptyState variant="no-results" onClearFilters={onClearFilters} className={className} />;
  }

  const showSelection = Boolean(onToggleSelect);

  return (
    <div className={className}>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {showSelection && <th className="w-10 px-4 py-3" />}
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {customers.map((customer) => {
              const isSelected = selectedIds?.includes(customer.id) ?? false;

              return (
                <tr
                  key={customer.id}
                  aria-selected={showSelection ? isSelected : undefined}
                  className="transition-colors hover:bg-accent/50"
                >
                  {showSelection && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect?.(customer.id)}
                        aria-label={`Select ${customer.full_name}`}
                        className="h-4 w-4 rounded border-input"
                      />
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {customer.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={customer.avatar_url}
                          alt={customer.full_name}
                          className="h-8 w-8 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                          {getCustomerInitials(customer.full_name)}
                        </span>
                      )}
                      <span className="font-medium text-foreground">{customer.full_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <div>{customer.email}</div>
                    {customer.phone && <div className="text-xs">{customer.phone}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={customer.status} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(customer.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      {onViewDetails && (
                        <Button type="button" size="sm" variant="ghost" onClick={() => onViewDetails(customer)}>
                          View details
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
