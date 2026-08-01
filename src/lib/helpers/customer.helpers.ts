import type { Customer } from "@/types/customer.types";
import type { RecordStatus } from "@/types/common.types";

/**
 * Customer helpers — Sprint 12.
 *
 * Pure, in-memory functions only — no Supabase, no I/O, matching this
 * sprint's "no real data fetching" scope, the same posture
 * `category.helpers.ts` (Sprint 08) had before any backend existed for
 * categories.
 */

/** Case-insensitive search across name, email, and phone. */
export function searchCustomers(customers: Customer[], query: string): Customer[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return customers;

  return customers.filter((customer) =>
    [customer.full_name, customer.email, customer.phone ?? ""].some((field) =>
      field.toLowerCase().includes(normalized)
    )
  );
}

/** Filters a flat list down to the given statuses. Empty/undefined
 *  `statuses` means "no filter," the same convention every other
 *  `filter*ByStatus` helper in this project uses. */
export function filterCustomersByStatus(customers: Customer[], statuses?: RecordStatus[]): Customer[] {
  if (!statuses || statuses.length === 0) return customers;
  return customers.filter((customer) => statuses.includes(customer.status));
}

/** Derives up to two initials from a full name, for the avatar-fallback
 *  circle `CustomerTable`/`CustomerCard`/`CustomerDetailsPanel` all show
 *  when no `avatar_url` exists. */
export function getCustomerInitials(fullName: string): string {
  return fullName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
