"use client";

import { useCallback, useState } from "react";
import { slugify } from "@/lib/helpers/string.helpers";
import { validateAuthorInsert, validateAuthorUpdate, type AuthorValidationErrors } from "@/features/authors/services/author.validation";
import { authorService } from "@/features/authors/services/author.service";
import { uploadAuthorPhoto } from "@/features/books/services/image-upload.service";
import { DEFAULT_AUTHOR_FORM_VALUES, type AuthorFormValues } from "@/features/authors/types/author-form.types";
import type { Author, AuthorInsert } from "@/types/author.types";
import type { ApiResponse } from "@/types/common.types";

/**
 * useAuthorForm — Sprint 11 (Task 14 support: Author Management UI's
 * form state).
 *
 * Mirrors `useBookForm` (Sprint 10) exactly: field values, auto-slug from
 * `name`, a pending photo file, field-level validation errors reusing
 * `author.validation.ts` directly (the same schema `author.service.ts`
 * validates against), and submit/upload state.
 *
 * Reuses Sprint 10's Image Upload Service directly (`uploadAuthorPhoto`),
 * per this sprint's "Reuse existing: ... Image Upload Service"
 * requirement, rather than writing a second upload hook. That function
 * still physically lives under `features/books/` (Sprint 10) — a
 * documented, deliberate cross-feature import rather than moving/renaming
 * a completed file; see `docs/AUTHOR_PUBLISHER_MANAGEMENT.md` for the
 * tradeoff.
 */

export interface UseAuthorFormOptions {
  mode?: "create" | "edit";
  authorId?: string;
  initialValues?: Partial<AuthorFormValues>;
}

export interface UseAuthorFormResult {
  values: AuthorFormValues;
  errors: AuthorValidationErrors;
  isSubmitting: boolean;
  isUploadingPhoto: boolean;
  submitError: string | null;
  setField: <K extends keyof AuthorFormValues>(field: K, value: AuthorFormValues[K]) => void;
  selectPhotoFile: (file: File | null) => void;
  selectedPhotoFile: File | null;
  reset: () => void;
  submit: () => Promise<ApiResponse<Author>>;
}

function toAuthorInsert(values: AuthorFormValues): AuthorInsert {
  return {
    name: values.name.trim(),
    slug: values.slug.trim() || slugify(values.name),
    bio: values.bio.trim() || null,
    photo_url: values.photoUrl || null,
    status: values.status,
  };
}

export function useAuthorForm(options: UseAuthorFormOptions = {}): UseAuthorFormResult {
  const { mode = "create", authorId } = options;

  const [values, setValues] = useState<AuthorFormValues>({
    ...DEFAULT_AUTHOR_FORM_VALUES,
    ...options.initialValues,
  });
  const [slugTouched, setSlugTouched] = useState(Boolean(options.initialValues?.slug));
  const [errors, setErrors] = useState<AuthorValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);

  const setField = useCallback<UseAuthorFormResult["setField"]>((field, value) => {
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
      delete next[field as keyof AuthorInsert];
      return next;
    });
  }, [slugTouched]);

  const selectPhotoFile = useCallback((file: File | null) => {
    setSelectedPhotoFile(file);
  }, []);

  const reset = useCallback(() => {
    setValues({ ...DEFAULT_AUTHOR_FORM_VALUES, ...options.initialValues });
    setSlugTouched(Boolean(options.initialValues?.slug));
    setErrors({});
    setSubmitError(null);
    setSelectedPhotoFile(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = useCallback(async (): Promise<ApiResponse<Author>> => {
    setSubmitError(null);

    const payload = toAuthorInsert(values);
    const validation = mode === "create" ? validateAuthorInsert(payload) : validateAuthorUpdate(payload);

    if (!validation.success) {
      setErrors(validation.errors ?? {});
      return { data: null, error: { message: "Please fix the highlighted fields.", code: "VALIDATION_ERROR" } };
    }
    setErrors({});

    let photoUrl = payload.photo_url ?? undefined;

    if (selectedPhotoFile) {
      setIsUploadingPhoto(true);
      const uploadResult = await uploadAuthorPhoto(selectedPhotoFile, authorId);
      setIsUploadingPhoto(false);

      if (uploadResult.error) {
        setSubmitError(uploadResult.error.message);
        return { data: null, error: uploadResult.error };
      }
      photoUrl = uploadResult.data.publicUrl;
    }

    setIsSubmitting(true);
    const result =
      mode === "edit" && authorId
        ? await authorService.update(authorId, { ...payload, photo_url: photoUrl })
        : await authorService.create({ ...payload, photo_url: photoUrl } as AuthorInsert);
    setIsSubmitting(false);

    if (result.error) {
      setSubmitError(result.error.message);
    }

    return result;
  }, [values, mode, authorId, selectedPhotoFile]);

  return {
    values,
    errors,
    isSubmitting,
    isUploadingPhoto,
    submitError,
    setField,
    selectPhotoFile,
    selectedPhotoFile,
    reset,
    submit,
  };
}
