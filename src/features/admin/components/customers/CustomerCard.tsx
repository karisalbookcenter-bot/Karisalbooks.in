"use client";

import { getIcon } from "@/lib/icons";
import { getCustomerInitials } from "@/lib/helpers/customer.helpers";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CustomerCardProps } from "@/features/admin/types/customer-management.types";

/**
 * CustomerCard — Sprint 12 (Task 7). Mirrors `AuthorCard`/`PublisherCard`
 * (Sprint 11) closely — same avatar-or-initials pattern, same
 * `StatusBadge` reuse — with contact info (email, phone) in place of a
 * bio/description, and a single "View details" action (opening
 * `CustomerDetailsPanel`) instead of Edit/Delete.
 */
export function CustomerCard({ customer, selected, onToggleSelect, onViewDetails, className }: CustomerCardProps) {
  const PhoneIcon = getIcon("phone");

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border bg-card p-4 transition-colors",
        selected ? "border-primary ring-1 ring-primary" : "border-border",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          {onToggleSelect && (
            <input
              type="checkbox"
              checked={selected ?? false}
              onChange={onToggleSelect}
              aria-label={`Select ${customer.full_name}`}
              className="mt-1 h-4 w-4 shrink-0 rounded border-input"
            />
          )}
          {customer.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={customer.avatar_url}
              alt={customer.full_name}
              className="h-9 w-9 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {getCustomerInitials(customer.full_name)}
            </span>
          )}
          <div>
            <p className="text-sm font-medium text-foreground">{customer.full_name}</p>
            <p className="text-xs text-muted-foreground">{customer.email}</p>
          </div>
        </div>
        <StatusBadge status={customer.status} />
      </div>

      {customer.phone && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <PhoneIcon className="h-3.5 w-3.5" aria-hidden="true" />
          {customer.phone}
        </div>
      )}

      {onViewDetails && (
        <div className="border-t border-border pt-3">
          <Button type="button" size="sm" variant="outline" className="w-full" onClick={onViewDetails}>
            View details
          </Button>
        </div>
      )}
    </div>
  );
}
