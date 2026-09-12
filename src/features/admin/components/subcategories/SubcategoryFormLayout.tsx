"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/helpers/string.helpers";
import { CATEGORY_STATUS_FILTER_OPTIONS } from "@/config/categoryManagement";
import { ParentCategorySelector } from "./ParentCategorySelector";
import * as subcategoryService from "@/features/subcategories/services/subcategory.service";
import type { SubcategoryInsert } from "@/features/subcategories/repositories/subcategory.repository";
import type { RecordStatus } from "@/types/common.types";
import type { SubcategoryFormLayoutProps } from "@/features/admin/types/subcategory-management.types";

/**
 * SubcategoryFormLayout — Sprint 09 (Task 5 — UI only), completed in
 * Sprint 17. Same treatment as `CategoryFormLayout`: extends the existing
 * local `useState` pattern (no new hook — single caller, same reasoning),
 * adds `isSubmitting`/`submitError`/`errors`, and a real `handleSave`.
 * `ParentCategorySelector` usage is untouched — still `allowAll={false}`,
 * still required, exactly as Sprint 09 built it.
 */
export function SubcategoryFormLayout({
  defaultValues,
  categories,
  mode = "create",
  subcategoryId,
  onSuccess,
  onCancel,
  className,
}: SubcategoryFormLayoutProps) {
  const [name, setName] = useState(defaultValues?.name ?? "");
  const [slug, setSlug] = useState(defaultValues?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(defaultValues?.slug));
  const [categoryId, setCategoryId] = useState<string | null>(defaultValues?.categoryId ?? null);
  const [description, setDescription] = useState(defaultValues?.description ?? "");
  const [status, setStatus] = useState<RecordStatus>(defaultValues?.status ?? "active");

  const [errors, setErrors] = useState<{ name?: string; slug?: string; categoryId?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function handleNameChange(next: string) {
    setName(next);
    if (!slugTouched) setSlug(slugify(next));
  }

  const statusOptions = CATEGORY_STATUS_FILTER_OPTIONS.filter((opt) => opt.value !== null);

  async function handleSave() {
    setSubmitError(null);

    // Same reasoning as CategoryFormLayout: no subcategory.validation.ts
    // exists, so this checks only what the schema requires (name, slug,
    // category_id — see subcategory.types.ts's own doc comment: category_id
    // is `not null`).
    const nextErrors: { name?: string; slug?: string; categoryId?: string } = {};
    if (!name.trim()) nextErrors.name = "Name is required.";
    if (!slug.trim()) nextErrors.slug = "Slug is required.";
    if (!categoryId) nextErrors.categoryId = "Category is required.";
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});

    const payload: SubcategoryInsert = {
      category_id: categoryId!,
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || null,
      status,
    };

    setIsSubmitting(true);
    const result =
      mode === "edit" && subcategoryId
        ? await subcategoryService.updateSubcategory(subcategoryId, payload)
        : await subcategoryService.createSubcategory(payload);
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
          <Label htmlFor="subcategory-name">Name</Label>
          <Input
            id="subcategory-name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. High Fantasy"
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="subcategory-slug">Slug</Label>
          <Input
            id="subcategory-slug"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            placeholder="e.g. high-fantasy"
          />
          <p className="text-xs text-muted-foreground">
            Auto-generated from Name until edited directly.
          </p>
          {errors.slug && <p className="text-xs text-destructive">{errors.slug}</p>}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="subcategory-category">Category</Label>
          <ParentCategorySelector
            id="subcategory-category"
            categories={categories}
            value={categoryId}
            onChange={setCategoryId}
            allowAll={false}
            placeholder="Select a category"
          />
          <p className="text-xs text-muted-foreground">
            Every subcategory belongs to exactly one category.
          </p>
          {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId}</p>}
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="subcategory-description">Description</Label>
          <Textarea
            id="subcategory-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional short description shown to customers."
          />
        </div>

        <div className="grid gap-1.5 sm:max-w-xs">
          <Label htmlFor="subcategory-status">Status</Label>
          <Select
            id="subcategory-status"
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

        {submitError && <p className="text-sm text-destructive">{submitError}</p>}
      </div>

      <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" onClick={handleSave} disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : mode === "edit" ? "Save changes" : "Create subcategory"}
        </Button>
      </div>
    </div>
  );
}
