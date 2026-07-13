"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/helpers/string.helpers";
import { CATEGORY_STATUS_FILTER_OPTIONS } from "@/config/categoryManagement";
import type { CategoryFormLayoutProps } from "@/features/admin/types/category-management.types";

/**
 * CategoryFormLayout — Sprint 08 (Task 5 — UI only).
 *
 * The Add/Edit Category form's layout: Name, Slug (auto-derived from Name
 * via Day 3's `slugify()` helper unless hand-edited), Description, Parent
 * Category (a `Select` populated from `parentOptions`), and Status (a
 * `Select` reusing `CATEGORY_STATUS_FILTER_OPTIONS`'s labels, minus its
 * "All statuses" entry). Local `useState` only tracks what's needed for
 * the slug auto-fill UX — **no submit handler exists**, and the Save
 * button is `type="button"` (not `type="submit"`), so this can never
 * accidentally persist anything even if dropped inside a real `<form>`
 * later. A future CRUD sprint replaces the Save button's no-op with a
 * real submit, validation, and a service call — see
 * `docs/CATEGORY_MANAGEMENT.md` §Future CRUD Integration.
 */
export function CategoryFormLayout({
  defaultValues,
  parentOptions = [],
  mode = "create",
  onCancel,
  className,
}: CategoryFormLayoutProps) {
  const [name, setName] = useState(defaultValues?.name ?? "");
  const [slug, setSlug] = useState(defaultValues?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(defaultValues?.slug));

  function handleNameChange(next: string) {
    setName(next);
    if (!slugTouched) setSlug(slugify(next));
  }

  const statusOptions = CATEGORY_STATUS_FILTER_OPTIONS.filter((opt) => opt.value !== null);

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
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="category-description">Description</Label>
          <Textarea
            id="category-description"
            defaultValue={defaultValues?.description}
            placeholder="Optional short description shown to customers."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="category-parent">Parent Category</Label>
            <Select id="category-parent" defaultValue={defaultValues?.parentId ?? ""}>
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
            <Select id="category-status" defaultValue={defaultValues?.status ?? "active"}>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value ?? undefined}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button">
          {mode === "edit" ? "Save changes" : "Create category"}
        </Button>
      </div>
    </div>
  );
}
