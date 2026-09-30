"use client";

import { useCallback, useState } from "react";

import {
  validateMembershipInsert,
  validateMembershipUpdate,
} from "../validation/membership.validation";
import * as membershipService from "../services/membership.service";

import type { ApiResponse, RecordStatus } from "@/types/common.types";
import type { Membership, MembershipInsert } from "@/types/membership.types";

export interface MembershipFormValues {
  customer_id: string;
  plan_id: string;
  payment_amount: number;
  start_date: string;
  expiry_date: string;
  status: RecordStatus;
  payment_status: "pending" | "paid" | "failed" | "refunded";
}

const DEFAULT_VALUES: MembershipFormValues = {
  customer_id: "",
  plan_id: "",
  payment_amount: 0,
  start_date: "",
  expiry_date: "",
  status: "active",
  payment_status: "pending",
};

export interface UseMembershipFormResult {
  form: MembershipFormValues;
  values: MembershipFormValues;
  errors: Record<string, string>;
  loading: boolean;
  isSubmitting: boolean;
  submit: () => Promise<ApiResponse<Membership>>;
  setField: <K extends keyof MembershipFormValues>(
    field: K,
    value: MembershipFormValues[K]
  ) => void;
  reset: () => void;
}

export interface UseMembershipFormOptions {
  initialMembership?: Membership;
  onSuccess?: () => void;
  mode?: "create" | "edit";
  membershipId?: string;
}

function toPayload(values: MembershipFormValues): MembershipInsert {
  return {
    customer_id: values.customer_id,
    plan_id: values.plan_id,
    payment_amount: values.payment_amount,
    payment_status: values.payment_status,
    start_date: values.start_date,
    expiry_date: values.expiry_date,
    status: values.status,
  };
}

function validationError(errors: Record<string, string> = {}): ApiResponse<Membership> {
  return {
    data: null,
    error: {
      message: Object.values(errors).join(" ") || "Validation failed.",
      code: "VALIDATION_ERROR",
    },
  };
}

export function useMembershipForm(
  options: UseMembershipFormOptions = {}
): UseMembershipFormResult {
  const {
    initialMembership,
    mode = "create",
    membershipId,
    onSuccess,
  } = options;

  const [form, setForm] = useState<MembershipFormValues>(() =>
    initialMembership
      ? {
          customer_id: initialMembership.customer_id,
          plan_id: initialMembership.plan_id,
          payment_amount: initialMembership.payment_amount,
          start_date: initialMembership.start_date,
          expiry_date: initialMembership.expiry_date,
          status: initialMembership.status,
          payment_status: initialMembership.payment_status,
        }
      : { ...DEFAULT_VALUES }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const setField = useCallback(
    <K extends keyof MembershipFormValues>(
      field: K,
      value: MembershipFormValues[K]
    ) => {
      setForm((previous) => ({ ...previous, [field]: value }));
      setErrors((previous) => {
        const next = { ...previous };
        delete next[field];
        return next;
      });
    },
    []
  );

  const reset = useCallback(() => {
    setForm({ ...DEFAULT_VALUES });
    setErrors({});
  }, []);

  const submit = useCallback(async (): Promise<ApiResponse<Membership>> => {
    setLoading(true);
    try {
      const payload = toPayload(form);
      let result: ApiResponse<Membership>;

      if (mode === "create") {
        const validation = validateMembershipInsert(payload);
        if (!validation.success || !validation.data) {
          setErrors(validation.errors ?? {});
          return validationError(validation.errors);
        }
        result = await membershipService.createMembership(validation.data);
      } else {
        const validation = validateMembershipUpdate(payload);
        if (!validation.success || !validation.data) {
          setErrors(validation.errors ?? {});
          return validationError(validation.errors);
        }
        if (!membershipId) {
          return {
            data: null,
            error: {
              message: "Membership ID is required for updates.",
              code: "MISSING_MEMBERSHIP_ID",
            },
          };
        }
        result = await membershipService.updateMembership(
          membershipId,
          validation.data
        );
      }

      if (result.error) {
        setErrors({ form: result.error.message });
      } else {
        setErrors({});
        onSuccess?.();
      }
      return result;
    } finally {
      setLoading(false);
    }
  }, [form, mode, membershipId, onSuccess]);

  return {
    form,
    values: form,
    errors,
    loading,
    isSubmitting: loading,
    setField,
    reset,
    submit,
  };
}