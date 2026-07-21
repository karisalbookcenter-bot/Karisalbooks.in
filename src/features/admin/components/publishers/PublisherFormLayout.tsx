"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/helpers/string.helpers";
import { CATEGORY_STATUS_FILTER_OPTIONS } from "@/config/categoryManagement";
import type { PublisherFormLayoutProps } from "@/features/admin/types/publisher-management.types";

/**
 * PublisherFormLayout — Sprint 11 (Task 15). Mirrors `AuthorFormLayout`,
 * with a "Website URL" field in place of "Photo URL" (no image upload —
 * `Publisher` has no image field, matching `usePublisherForm`'s simpler
 * scope).
 */
export function PublisherFormLayout({ defaultValues, mode = "create", onCancel, className }: PublisherFormLayoutProps) {
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
          <Label htmlFor="publisher-name">Name</Label>
          <Input
            id="publisher-name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Penguin Books"
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="publisher-slug">Slug</Label>
          <Input
            id="publisher-slug"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            placeholder="e.g. penguin-books"
          />
          <p className="text-xs text-muted-foreground">Auto-generated from Name until edited directly.</p>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="publisher-website">Website URL</Label>
          <Input
            id="publisher-website"
            type="url"
            defaultValue={defaultValues?.websiteUrl}
            placeholder="https://..."
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="publisher-description">Description</Label>
          <Textarea
            id="publisher-description"
            defaultValue={defaultValues?.description}
            placeholder="A short description shown on the publisher's page."
          />
        </div>

        <div className="grid gap-1.5 sm:max-w-xs">
          <Label htmlFor="publisher-status">Status</Label>
          <Select id="publisher-status" defaultValue={defaultValues?.status ?? "active"}>
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
        <Button type="button">{mode === "edit" ? "Save changes" : "Create publisher"}</Button>
      </div>
    </div>
  );
}
