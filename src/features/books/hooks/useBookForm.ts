"use client";

import { useCallback, useState } from "react";
import { slugify } from "@/lib/helpers/string.helpers";
import { validateBookInsert, validateBookUpdate, type BookValidationErrors } from "@/features/books/services/book.validation";
import * as bookService from "@/features/books/services/book.service";
import { uploadBookCoverImage } from "@/features/books/services/image-upload.service";
import { DEFAULT_BOOK_FORM_VALUES, type BookFormValues } from "@/features/books/types/book-form.types";
import type { Book, BookInsert } from "@/types/book.types";
import type { ApiResponse } from "@/types/common.types";

/**
 * useBookForm — Sprint 10 (Task 4: Book Form State Management).
 *
 * Owns everything a future Book create/edit form needs: field values,
 * auto-slug-from-title (via `slugify()`, Day 3 — the same UX
 * `CategoryFormLayout`/`SubcategoryFormLayout` give client-side, Sprints
 * 08–09), a pending cover-image file, field-level validation errors, and
 * submit/upload state. **State management only — no UI.** This sprint
 * does not build a `BookFormLayout` component (unlike Sprint 08/09's
 * `CategoryFormLayout`/`SubcategoryFormLayout`, which were explicit
 * tasks); that's a future sprint's job once the Book admin UI is built.
 * A future `BookFormLayout` would call this hook the same way a class
 * component might use a controller — every input's `value`/`onChange`
 * comes straight from this hook's returned `values`/`setField`.
 *
 * Validation reuses `validateBookInsert`/`validateBookUpdate`
 * (`book.validation.ts`) directly — the same schemas `book.service.ts`
 * validates against server-side — so a field error a user sees here is
 * guaranteed to be the same rule the service would enforce anyway; this
 * hook doesn't duplicate or reinterpret the validation rules, it just
 * runs them earlier, before a network round-trip.
 */

export interface UseBookFormOptions {
  mode?: "create" | "edit";
  bookId?: string;
  initialValues?: Partial<BookFormValues>;
}

export interface UseBookFormResult {
  values: BookFormValues;
  errors: BookValidationErrors;
  isSubmitting: boolean;
  isUploadingImage: boolean;
  submitError: string | null;
  setField: <K extends keyof BookFormValues>(field: K, value: BookFormValues[K]) => void;
  selectCoverImageFile: (file: File | null) => void;
  selectedCoverImageFile: File | null;
  reset: () => void;
  submit: () => Promise<ApiResponse<Book>>;
}

function toBookInsert(values: BookFormValues): BookInsert {
  return {
    title: values.title.trim(),
    slug: values.slug.trim() || slugify(values.title),
    description: values.description.trim() || null,
    category_id: values.categoryId,
    subcategory_id: values.subcategoryId || null,
    author_id: values.authorId,
    publisher_id: values.publisherId || null,
    isbn: values.isbn.trim() || null,
    price: Number(values.price),
    stock_quantity: Number(values.stockQuantity),
    cover_image_url: values.coverImageUrl || null,
    status: values.status,
  };
}

export function useBookForm(options: UseBookFormOptions = {}): UseBookFormResult {
  const { mode = "create", bookId } = options;

  const [values, setValues] = useState<BookFormValues>({
    ...DEFAULT_BOOK_FORM_VALUES,
    ...options.initialValues,
  });
  const [slugTouched, setSlugTouched] = useState(Boolean(options.initialValues?.slug));
  const [errors, setErrors] = useState<BookValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedCoverImageFile, setSelectedCoverImageFile] = useState<File | null>(null);

  const setField = useCallback<UseBookFormResult["setField"]>((field, value) => {
    setValues((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "title" && !slugTouched) {
        next.slug = slugify(String(value));
      }
      return next;
    });
    if (field === "slug") setSlugTouched(true);
    setErrors((prev) => {
      if (!(field in prev)) return prev;
      const next = { ...prev };
      delete next[field as keyof BookInsert];
      return next;
    });
  }, [slugTouched]);

  const selectCoverImageFile = useCallback((file: File | null) => {
    setSelectedCoverImageFile(file);
  }, []);

  const reset = useCallback(() => {
    setValues({ ...DEFAULT_BOOK_FORM_VALUES, ...options.initialValues });
    setSlugTouched(Boolean(options.initialValues?.slug));
    setErrors({});
    setSubmitError(null);
    setSelectedCoverImageFile(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = useCallback(async (): Promise<ApiResponse<Book>> => {
    setSubmitError(null);

    const payload = toBookInsert(values);
    const validation = mode === "create" ? validateBookInsert(payload) : validateBookUpdate(payload);

    if (!validation.success) {
      setErrors(validation.errors ?? {});
      return { data: null, error: { message: "Please fix the highlighted fields.", code: "VALIDATION_ERROR" } };
    }
    setErrors({});

    let coverImageUrl = payload.cover_image_url ?? undefined;

    if (selectedCoverImageFile) {
      setIsUploadingImage(true);
      const uploadResult = await uploadBookCoverImage(selectedCoverImageFile, bookId);
      setIsUploadingImage(false);

      if (uploadResult.error) {
        setSubmitError(uploadResult.error.message);
        return { data: null, error: uploadResult.error };
      }
      coverImageUrl = uploadResult.data.publicUrl;
    }

    setIsSubmitting(true);
    const result =
      mode === "edit" && bookId
        ? await bookService.updateBook(bookId, { ...payload, cover_image_url: coverImageUrl })
        : await bookService.createBook({ ...payload, cover_image_url: coverImageUrl } as BookInsert);
    setIsSubmitting(false);

    if (result.error) {
      setSubmitError(result.error.message);
    }

    return result;
  }, [values, mode, bookId, selectedCoverImageFile]);

  return {
    values,
    errors,
    isSubmitting,
    isUploadingImage,
    submitError,
    setField,
    selectCoverImageFile,
    selectedCoverImageFile,
    reset,
    submit,
  };
}
