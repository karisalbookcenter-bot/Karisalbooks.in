"use client";

import { SlideOverPanel } from "@/components/common/SlideOverPanel";
import { StatusBadge } from "@/components/common/StatusBadge";
import { getIcon } from "@/lib/icons";
import { getCustomerInitials } from "@/lib/helpers/customer.helpers";
import { formatDate } from "@/lib/helpers/format.helpers";
import type { CustomerDetailsPanelProps } from "@/features/admin/types/customer-management.types";

/**
 * CustomerDetailsPanel — Sprint 12 (Task 8 — UI only).
 *
 * The one genuinely new UI pattern this sprint introduces: a **slide-over
 * detail view**, built on the new generic `SlideOverPanel`
 * (`@/components/common/SlideOverPanel`, this sprint) rather than a
 * modal/dialog — clicking "View details" on a `CustomerTable` row or
 * `CustomerCard` opens this panel from the right without navigating away
 * from the list, unlike every prior "detail" interaction in this project
 * (`CategoryFormLayout`/`AuthorFormLayout`/etc. are inline forms, not
 * slide-overs).
 *
 * **UI only, as required** — this panel only *displays* `customer`;
 * there is no edit form, no submit handler, no service call. The
 * "Deactivate account" footer action is presentational only (a disabled-
 * looking placeholder button with no `onClick` wired) — a future sprint
 * that adds real customer moderation would wire it to a service call the
 * same way `useAuthorForm`'s submit (Sprint 11) wires a real mutation,
 * once one exists for customers.
 *
 * Renders nothing when `customer` is `null` (e.g. before any row has been
 * clicked) — the caller doesn't need to guard against calling this with
 * no data.
 */
export function CustomerDetailsPanel({ customer, open, onClose, className }: CustomerDetailsPanelProps) {
  const PhoneIcon = getIcon("phone");
  const MailIcon = getIcon("mail");
  const CalendarIcon = getIcon("calendar-clock");

  if (!customer) return null;

  return (
    <SlideOverPanel
      open={open}
      onClose={onClose}
      title="Customer details"
      className={className}
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled
            title="Account moderation is not implemented this sprint"
            className="cursor-not-allowed rounded-md border border-input px-3 py-2 text-sm font-medium text-muted-foreground opacity-60"
          >
            Deactivate account
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          {customer.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={customer.avatar_url}
              alt={customer.full_name}
              className="h-14 w-14 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
              {getCustomerInitials(customer.full_name)}
            </span>
          )}
          <div>
            <p className="text-base font-semibold text-foreground">{customer.full_name}</p>
            <StatusBadge status={customer.status} className="mt-1" />
          </div>
        </div>

        <dl className="grid gap-3 text-sm">
          <div className="flex items-center gap-2.5">
            <MailIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <dt className="sr-only">Email</dt>
            <dd className="text-foreground">{customer.email}</dd>
          </div>
          {customer.phone && (
            <div className="flex items-center gap-2.5">
              <PhoneIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <dt className="sr-only">Phone</dt>
              <dd className="text-foreground">{customer.phone}</dd>
            </div>
          )}
          <div className="flex items-center gap-2.5">
            <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <dt className="sr-only">Joined</dt>
            <dd className="text-foreground">Joined {formatDate(customer.created_at)}</dd>
          </div>
        </dl>

        <div className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
          Order history will appear here once the Orders system is built.
        </div>
      </div>
    </SlideOverPanel>
  );
}
