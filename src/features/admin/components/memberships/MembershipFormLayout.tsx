"use client";

import { useEffect, useState } from "react";

import { useMembershipForm } from "@/features/memberships/hooks/useMembershipForm";
import * as membershipService from "@/features/memberships/services/membership.service";
import * as customerService from "@/features/customers/services/customer.service";

import type { Customer } from "@/types/customer.types";
import type { Membership, MembershipPlan } from "@/types/membership.types";
import type { RecordStatus } from "@/types/common.types";

interface MembershipFormLayoutProps {
  mode: "create" | "edit";
  initialMembership?: Membership;
  onCancel: () => void;
  onSuccess: () => void;
}

function addDays(dateValue: string, days: number): string {
  const date = dateValue ? new Date(`${dateValue}T00:00:00`) : new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function MembershipFormLayout({
  mode,
  initialMembership,
  onCancel,
  onSuccess,
}: MembershipFormLayoutProps) {
  const {
    form,
    setField,
    errors,
    loading,
    submit,
  } = useMembershipForm({
    mode,
    initialMembership,
    membershipId: initialMembership?.id,
    onSuccess,
  });

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState("");

  useEffect(() => {
    let isCurrent = true;

    Promise.all([
      customerService.listCustomers({ page: 1, pageSize: 100 }),
      membershipService.listMembershipPlans({ page: 1, pageSize: 100 }),
    ])
      .then(([customerResult, planResult]) => {
        if (!isCurrent) return;

        if (customerResult.error) {
          setOptionsError(customerResult.error.message);
        } else {
          setCustomers(customerResult.data.items);
        }

        if (planResult.error) {
          setOptionsError((current) =>
            current
              ? `${current} ${planResult.error.message}`
              : planResult.error.message
          );
        } else {
          setPlans(planResult.data.items);
        }
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setOptionsError(
            error instanceof Error ? error.message : "Unable to load form options."
          );
        }
      })
      .finally(() => {
        if (isCurrent) setOptionsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const selectedPlan = plans.find((plan) => plan.id === form.plan_id);

  function handlePlanChange(planId: string) {
    const plan = plans.find((item) => item.id === planId);
    setField("plan_id", planId);
    if (plan) {
      setField("payment_amount", plan.price);
      setField("expiry_date", addDays(form.start_date, plan.validity_days));
    }
  }

  function handleStartDateChange(startDate: string) {
    setField("start_date", startDate);
    if (selectedPlan) {
      setField("expiry_date", addDays(startDate, selectedPlan.validity_days));
    }
  }

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        await submit();
      }}
      className="space-y-5"
    >
      {optionsError && (
        <p role="alert" className="text-sm text-destructive">
          {optionsError}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm font-medium">
          Customer
          <select
            required
            value={form.customer_id}
            disabled={optionsLoading}
            onChange={(event) => setField("customer_id", event.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 font-normal"
          >
            <option value="">Select a customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}{customer.email ? ` (${customer.email})` : ""}
              </option>
            ))}
          </select>
          {errors.customer_id && (
            <span className="block text-xs text-destructive">{errors.customer_id}</span>
          )}
        </label>

        <label className="space-y-1 text-sm font-medium">
          Membership plan
          <select
            required
            value={form.plan_id}
            disabled={optionsLoading}
            onChange={(event) => handlePlanChange(event.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 font-normal"
          >
            <option value="">Select a plan</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name} - ₹{plan.price} ({plan.validity_days} days)
              </option>
            ))}
          </select>
          {errors.plan_id && (
            <span className="block text-xs text-destructive">{errors.plan_id}</span>
          )}
        </label>

        <label className="space-y-1 text-sm font-medium">
          Start date
          <input
            required
            type="date"
            value={form.start_date}
            onChange={(event) => handleStartDateChange(event.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 font-normal"
          />
          {errors.start_date && (
            <span className="block text-xs text-destructive">{errors.start_date}</span>
          )}
        </label>

        <label className="space-y-1 text-sm font-medium">
          Expiry date
          <input
            required
            type="date"
            value={form.expiry_date}
            onChange={(event) => setField("expiry_date", event.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 font-normal"
          />
          {errors.expiry_date && (
            <span className="block text-xs text-destructive">{errors.expiry_date}</span>
          )}
        </label>

        <label className="space-y-1 text-sm font-medium">
          Payment amount
          <input
            readOnly
            type="number"
            value={form.payment_amount}
            className="w-full rounded-md border bg-muted px-3 py-2 font-normal"
          />
          {errors.payment_amount && (
            <span className="block text-xs text-destructive">{errors.payment_amount}</span>
          )}
        </label>

        <label className="space-y-1 text-sm font-medium">
          Payment status
          <select
            value={form.payment_status}
            onChange={(event) =>
              setField(
                "payment_status",
                event.target.value as Membership["payment_status"]
              )
            }
            className="w-full rounded-md border bg-background px-3 py-2 font-normal"
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </label>

        <label className="space-y-1 text-sm font-medium">
          Status
          <select
            value={form.status}
            onChange={(event) =>
              setField("status", event.target.value as RecordStatus)
            }
            className="w-full rounded-md border bg-background px-3 py-2 font-normal"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
        </label>
      </div>

      {errors.form && (
        <p role="alert" className="text-sm text-destructive">{errors.form}</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading || optionsLoading || !customers.length || !plans.length}
          className="rounded-md bg-primary px-5 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Saving..." : mode === "create" ? "Create Membership" : "Update Membership"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border px-5 py-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}