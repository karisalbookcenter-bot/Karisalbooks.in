"use client";

import { useCallback, useState } from "react";
import { slugify } from "@/lib/helpers/string.helpers";
import { validatePublisherInsert, validatePublisherUpdate, type PublisherValidationErrors } from "@/features/publishers/services/publisher.validation";
import { publisherService } from "@/features/publishers/services/publisher.service";
import { DEFAULT_PUBLISHER_FORM_VALUES, type PublisherFormValues } from "@/features/publishers/types/publisher-form.types";
import type { Publisher, PublisherInsert } from "@/types/publisher.types";
import type { ApiResponse } from "@/types/common.types";

/**
 * usePublisherForm — Sprint 11 (Task 15 support: Publisher Management
 * UI's form state).
 *
 * Mirrors `useAuthorForm` minus the photo-upload step (`Publisher` has no
 * image field) — simpler than `useBookForm`/`useAuthorForm` for exactly
 * that reason, not because anything was left out.
 */

export interface UsePublisherFormOptions {
  mode?: "create" | "edit";
  publisherId?: string;
  initialValues?: Partial<PublisherFormValues>;
}

export interface UsePublisherFormResult {
  values: PublisherFormValues;
  errors: PublisherValidationErrors;
  isSubmitting: boolean;
  submitError: string | null;
  setField: <K extends keyof PublisherFormValues>(field: K, value: PublisherFormValues[K]) => void;
  reset: () => void;
  submit: () => Promise<ApiResponse<Publisher>>;
}

function toPublisherInsert(values: PublisherFormValues): PublisherInsert {
  return {
    name: values.name.trim(),
    slug: values.slug.trim() || slugify(values.name),
    description: values.description.trim() || null,
    website_url: values.websiteUrl || null,
    status: values.status,
  };
}

export function usePublisherForm(options: UsePublisherFormOptions = {}): UsePublisherFormResult {
  const { mode = "create", publisherId } = options;

  const [values, setValues] = useState<PublisherFormValues>({
    ...DEFAULT_PUBLISHER_FORM_VALUES,
    ...options.initialValues,
  });
  const [slugTouched, setSlugTouched] = useState(Boolean(options.initialValues?.slug));
  const [errors, setErrors] = useState<PublisherValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const setField = useCallback<UsePublisherFormResult["setField"]>((field, value) => {
    setValues((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "name" && !slugTouched) {
        next.slug = slugify(String(value));
      }
      return next;
    });
    if (field === "slug") setSlugTouched(true);
    setErrors((prev) => {
      if (!(field in prev)) return prev;
      const next = { ...prev };
      delete next[field as keyof PublisherInsert];
      return next;
    });
  }, [slugTouched]);

  const reset = useCallback(() => {
    setValues({ ...DEFAULT_PUBLISHER_FORM_VALUES, ...options.initialValues });
    setSlugTouched(Boolean(options.initialValues?.slug));
    setErrors({});
    setSubmitError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = useCallback(async (): Promise<ApiResponse<Publisher>> => {
    setSubmitError(null);

    const payload = toPublisherInsert(values);
    const validation = mode === "create" ? validatePublisherInsert(payload) : validatePublisherUpdate(payload);

    if (!validation.success) {
      setErrors(validation.errors ?? {});
      return { data: null, error: { message: "Please fix the highlighted fields.", code: "VALIDATION_ERROR" } };
    }
    setErrors({});

    setIsSubmitting(true);
    const result =
      mode === "edit" && publisherId
        ? await publisherService.update(publisherId, payload)
        : await publisherService.create(payload as PublisherInsert);
    setIsSubmitting(false);

    if (result.error) {
      setSubmitError(result.error.message);
    }

    return result;
  }, [values, mode, publisherId]);

  return { values, errors, isSubmitting, submitError, setField, reset, submit };
}
