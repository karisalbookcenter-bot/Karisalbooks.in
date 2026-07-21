"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { slugify } from "@/lib/helpers/string.helpers";
import { CATEGORY_STATUS_FILTER_OPTIONS } from "@/config/categoryManagement";
import type { AuthorFormLayoutProps } from "@/features/admin/types/author-management.types";

/**
 * AuthorFormLayout — Sprint 11 (Task 14).
 *
 * Mirrors `CategoryFormLayout`/`SubcategoryFormLayout` (Sprints 08–09):
 * same field styling, same auto-slug-from-name UX, Save button
 * `type="button"` (never `type="submit"`) so this can never accidentally
 * persist. This *is* wired for real submission in
 * `useAuthorForm`/`authorService` (this sprint) — unlike Sprint 08/09's
 * Category/Subcategory forms, which had no backend to submit to yet — but
 * this component itself stays presentation-only; a future page composes
 * it with `useAuthorForm` the same way `docs/AUTHOR_PUBLISHER_MANAGEMENT.md`
 * shows.
 */
export function AuthorFormLayout({ defaultValues, mode = "create", onCancel, className }: AuthorFormLayoutProps) {
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
          <Label htmlFor="author-name">Name</Label>
          <Input
            id="author-name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. R. K. Narayan"
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="author-slug">Slug</Label>
          <Input
            id="author-slug"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            placeholder="e.g. r-k-narayan"
          />
          <p className="text-xs text-muted-foreground">Auto-generated from Name until edited directly.</p>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="author-photo">Photo URL</Label>
          <Input
            id="author-photo"
            type="url"
            defaultValue={defaultValues?.photoUrl}
            placeholder="https://..."
          />
          <p className="text-xs text-muted-foreground">
            A future file picker would call `useAuthorForm`'s `selectPhotoFile`, which uploads via the
            Image Upload Service on submit.
          </p>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="author-bio">Bio</Label>
          <Textarea
            id="author-bio"
            defaultValue={defaultValues?.bio}
            placeholder="A short biography shown on the author's page."
          />
        </div>

        <div className="grid gap-1.5 sm:max-w-xs">
          <Label htmlFor="author-status">Status</Label>
          <Select id="author-status" defaultValue={defaultValues?.status ?? "active"}>
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
        <Button type="button">{mode === "edit" ? "Save changes" : "Create author"}</Button>
      </div>
    </div>
  );
}
