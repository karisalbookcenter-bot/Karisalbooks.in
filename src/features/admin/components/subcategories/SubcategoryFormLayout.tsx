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
import type { SubcategoryFormLayoutProps } from "@/features/admin/types/subcategory-management.types";

/**
 * SubcategoryFormLayout — Sprint 09 (Task 5 — UI only).
 *
 * Mirrors `CategoryFormLayout` (Sprint 08) closely — same field styling,
 * same auto-slug-from-name UX via `slugify()` (Day 3), same "Save button
 * is `type=\"button\"`, never `type=\"submit\"`" safety net so this can
 * never accidentally persist anything. The one structural difference:
 * "Parent Category" is `ParentCategorySelector` (`allowAll={false}`) —
 * **required**, not optional, since a subcategory's `category_id` is
 * `not null` in the schema, unlike a top-level category's optional
 * parent. No submit handler exists; a future CRUD sprint wires Save to a
 * real create/update call — see `docs/SUBCATEGORY_MANAGEMENT.md`
 * §Future CRUD Integration.
 */
export function SubcategoryFormLayout({
  defaultValues,
  categories,
  mode = "create",
  onCancel,
  className,
}: SubcategoryFormLayoutProps) {
  const [name, setName] = useState(defaultValues?.name ?? "");
  const [slug, setSlug] = useState(defaultValues?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(defaultValues?.slug));
  const [categoryId, setCategoryId] = useState<string | null>(defaultValues?.categoryId ?? null);

  function handleNameChange(next: string) {
    setName(next);
    if (!slugTouched) setSlug(slugify(next));
  }

  const statusOptions = CATEGORY_STATUS_FILTER_OPTIONS.filter((opt) => opt.value !== null);

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
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="subcategory-description">Description</Label>
          <Textarea
            id="subcategory-description"
            defaultValue={defaultValues?.description}
            placeholder="Optional short description shown to customers."
          />
        </div>

        <div className="grid gap-1.5 sm:max-w-xs">
          <Label htmlFor="subcategory-status">Status</Label>
          <Select id="subcategory-status" defaultValue={defaultValues?.status ?? "active"}>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value ?? undefined}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button">
          {mode === "edit" ? "Save changes" : "Create subcategory"}
        </Button>
      </div>
    </div>
  );
}
