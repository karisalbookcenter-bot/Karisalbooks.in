"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/helpers/string.helpers";
import { CATEGORY_STATUS_FILTER_OPTIONS } from "@/config/categoryManagement";
import * as categoryService from "@/features/categories/services/category.service";
import type { CategoryInsert } from "@/features/categories/repositories/category.repository";
import type { RecordStatus } from "@/types/common.types";
import type { CategoryFormLayoutProps } from "@/features/admin/types/category-management.types";

/**
 * CategoryFormLayout — Sprint 08 (Task 5 — UI only), completed in Sprint 17
 * (Task: Future CRUD Integration, as this file's own doc comment already
 * named it).
 *
 * Sprint 17 extends this component's EXISTING local `useState` pattern —
 * `description`/`parentId`/`status` are now controlled the same way
 * `name`/`slug` already were, plus `isSubmitting`/`submitError`/`errors`
 * for the new submit step. No hook was introduced: this component has
 * exactly one caller (`CategoryManagementOverview`), so there's no reuse
 * pressure a hook would serve, unlike Book's `useBookForm` (its own,
 * independent Sprint 10 task). Save is now a real `async` handler; it
 * remains `type="button"`, unchanged from Sprint 08 — persistence now
 * happens through an explicit click handler, not a native form submit.
 */
export function CategoryFormLayout({
  defaultValues,
  parentOptions = [],
  mode = "create",
  categoryId,
  onSuccess,
  onCancel,
  className,
}: CategoryFormLayoutProps) {
  const [name, setName] = useState(defaultValues?.name ?? "");
  const [slug, setSlug] = useState(defaultValues?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(defaultValues?.slug));
  const [description, setDescription] = useState(defaultValues?.description ?? "");
  const [parentId, setParentId] = useState(defaultValues?.parentId ?? "");
  const [status, setStatus] = useState<RecordStatus>(defaultValues?.status ?? "active");

  const [errors, setErrors] = useState<{ name?: string; slug?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function handleNameChange(next: string) {
    setName(next);
    if (!slugTouched) setSlug(slugify(next));
  }

  const statusOptions = CATEGORY_STATUS_FILTER_OPTIONS.filter((opt) => opt.value !== null);

  async function handleSave() {
    setSubmitError(null);

    // Minimal inline validation — no shared validation file exists for
    // Category the way `book.validation.ts` does for Book (never
    // supplied), so this mirrors only the two fields the schema actually
    // requires (`name`, `slug` — see category.types.ts), rather than
    // guessing at a fuller, unseen validation pattern.
    const nextErrors: { name?: string; slug?: string } = {};
    if (!name.trim()) nextErrors.name = "Name is required.";
    if (!slug.trim()) nextErrors.slug = "Slug is required.";
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});

    const payload: CategoryInsert = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || null,
      parent_id: parentId || null,
      status,
    };

    setIsSubmitting(true);
    const result =
      mode === "edit" && categoryId
        ? await categoryService.updateCategory(categoryId, payload)
        : await categoryService.createCategory(payload);
    setIsSubmitting(false);

    if (result.error) {
      setSubmitError(result.error.message);
      return;
    }
    if (result.data) onSuccess?.(result.data);
  }

  return (
    <div className={className}>
      <div className="grid gap-5">
        <div className="grid gap-1.5">
          <Label htmlFor="category-name">Name</Label>
          <Input
            id="category-name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Fantasy"
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="category-slug">Slug</Label>
          <Input
            id="category-slug"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            placeholder="e.g. fantasy"
          />
          <p className="text-xs text-muted-foreground">
            Auto-generated from Name until edited directly.
          </p>
          {errors.slug && <p className="text-xs text-destructive">{errors.slug}</p>}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="category-description">Description</Label>
          <Textarea
            id="category-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional short description shown to customers."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="category-parent">Parent Category</Label>
            <Select
              id="category-parent"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
            >
              <option value="">No parent (top-level)</option>
              {parentOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="category-status">Status</Label>
            <Select
              id="category-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as RecordStatus)}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value ?? undefined}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {submitError && <p className="text-sm text-destructive">{submitError}</p>}
      </div>

      <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" onClick={handleSave} disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : mode === "edit" ? "Save changes" : "Create category"}
        </Button>
      </div>
    </div>
  );
}

