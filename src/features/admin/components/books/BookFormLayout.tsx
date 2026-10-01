"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { calculateBookPrice, isBookDiscountEligible } from "@/lib/helpers/book-pricing.helpers";
import { formatCurrency } from "@/lib/helpers/format.helpers";
import { useBookForm } from "@/features/books/hooks/useBookForm";
import { authorService } from "@/features/authors/services/author.service";
import { publisherService } from "@/features/publishers/services/publisher.service";
import type { BookFormValues } from "@/features/books/types/book-form.types";
import type { Book } from "@/types/book.types";
import type { BookFormLayoutProps } from "@/features/admin/types/book-management.types";

// useBookForm expects Partial<BookFormValues> (camelCase, string-typed) for
// initialValues — not a Book entity (snake_case, correctly-typed). This is
// the same mapping useBookForm.ts's own internal `toBookInsert()` does in
// reverse; kept here rather than in the hook since it's presentation-layer
// concern (converting a fetched entity into editable form state), not
// something book-form.types.ts or useBookForm.ts's own contract covers.
function bookToFormValues(book: Book): Partial<BookFormValues> {
  return {
    title: book.title,
    slug: book.slug,
    description: book.description ?? "",
    categoryId: book.category_id,
    subcategoryId: book.subcategory_id ?? "",
    authorId: book.author_id,
    publisherId: book.publisher_id ?? "",
    isbn: book.isbn ?? "",
    price: String(book.price),
    stockQuantity: String(book.stock_quantity),
    coverImageUrl: book.cover_image_url ?? "",
    status: book.status,
  };
}

export function BookFormLayout({
  mode,
  initialBook,
  categories,
  subcategories,
  authors,
  publishers,
  onSuccess,
  onCancel,
}: BookFormLayoutProps) {
  const [authorMode, setAuthorMode] = useState<"existing" | "manual">("existing");
  const [publisherMode, setPublisherMode] = useState<"existing" | "manual">("existing");
  const [manualAuthorName, setManualAuthorName] = useState("");
  const [manualPublisherName, setManualPublisherName] = useState("");
  const [manualEntryError, setManualEntryError] = useState<string | null>(null);

  const {
    values,
    errors,
    isSubmitting,
    isUploadingImage,
    submitError,
    setField,
    selectCoverImageFile,
    submit,
  } = useBookForm({
    mode,
    bookId: initialBook?.id,
    initialValues: initialBook ? bookToFormValues(initialBook) : undefined,
  });
  const selectedCategory = categories.find((category) => category.id === values.categoryId);
  const enteredPrice = Number(values.price);
  const pricePreview = selectedCategory && Number.isFinite(enteredPrice) && enteredPrice > 0
    ? calculateBookPrice(enteredPrice, isBookDiscountEligible(selectedCategory.name))
    : null;

  const handleSave = async () => {
    setManualEntryError(null);

    try {
      let authorId = values.authorId;
      if (authorMode === "manual") {
        if (!manualAuthorName.trim()) {
          setManualEntryError("Enter an author name.");
          return;
        }
        authorId = await resolveAuthorId(manualAuthorName);
      }

      let publisherId = values.publisherId ?? "";
      if (publisherMode === "manual") {
        publisherId = manualPublisherName.trim()
          ? await resolvePublisherId(manualPublisherName)
          : "";
      }

      const result = await submit({ authorId, publisherId });
      if (result?.data) onSuccess?.(result.data);
    } catch (error) {
      setManualEntryError(error instanceof Error ? error.message : "Unable to save author or publisher.");
    }
  };

  async function resolveAuthorId(rawName: string) {
    const name = rawName.trim();
    const existing = await authorService.list({ page: 1, pageSize: 1000, search: name });
    if (existing.error) throw new Error(existing.error.message);
    const match = existing.data.items.find((author) => author.name.trim().toLowerCase() === name.toLowerCase());
    if (match) return match.id;

    const created = await authorService.create({ name });
    if (created.error) throw new Error(created.error.message);
    return created.data.id;
  }

  async function resolvePublisherId(rawName: string) {
    const name = rawName.trim();
    const existing = await publisherService.list({ page: 1, pageSize: 1000, search: name });
    if (existing.error) throw new Error(existing.error.message);
    const match = existing.data.items.find((publisher) => publisher.name.trim().toLowerCase() === name.toLowerCase());
    if (match) return match.id;

    const created = await publisherService.create({ name });
    if (created.error) throw new Error(created.error.message);
    return created.data.id;
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label htmlFor="book-title">Title</Label>
        <Input
          id="book-title"
          value={values.title}
          onChange={(e) => setField("title", e.target.value)}
        />
        {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title}</p>}
      </div>

      <div>
        <Label htmlFor="book-slug">Slug</Label>
        <Input id="book-slug" value={values.slug} onChange={(e) => setField("slug", e.target.value)} />
        {errors.slug && <p className="mt-1 text-xs text-destructive">{errors.slug}</p>}
      </div>

      <div>
        <Label htmlFor="book-description">Description</Label>
        <Textarea
          id="book-description"
          value={values.description ?? ""}
          onChange={(e) => setField("description", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="book-isbn">ISBN</Label>
          <Input id="book-isbn" value={values.isbn ?? ""} onChange={(e) => setField("isbn", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="book-price">Price (INR)</Label>
          <Input
            id="book-price"
            type="number"
            value={values.price}
            onChange={(e) => setField("price", e.target.value)}
          />
          {errors.price && <p className="mt-1 text-xs text-destructive">{errors.price}</p>}
          {pricePreview && (
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {pricePreview.discountAmount > 0
                ? `7% discount: save ${formatCurrency(pricePreview.discountAmount)} · customer pays ${formatCurrency(pricePreview.discountedPrice)}`
                : "No discount for this category."}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="book-stock">Stock quantity</Label>
          <Input
            id="book-stock"
            type="number"
            value={values.stockQuantity}
            onChange={(e) => setField("stockQuantity", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="book-category">Category</Label>
          {/* Plain Select, same as Author/Publisher below — no ParentCategorySelector
              dependency. That component's existence at
              @/features/admin/components/subcategories was never independently
              confirmed, so it's removed rather than left as an unverified import. */}
          <Select
            id="book-category"
            value={values.categoryId}
            onChange={(e) => {
              setField("categoryId", e.target.value);
              // A subcategory only makes sense within its parent category —
              // clear any stale selection when category changes.
              // useBookForm.ts's own setField doesn't know about this
              // cross-field relationship, so it's handled here instead of
              // touching that file.
              if (values.subcategoryId) setField("subcategoryId", "");
            }}
          >
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          {errors.category_id && (
            <p className="mt-1 text-xs text-destructive">{errors.category_id}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="book-subcategory">Subcategory</Label>
        <Select
          id="book-subcategory"
          value={values.subcategoryId}
          onChange={(e) => setField("subcategoryId", e.target.value)}
          disabled={!values.categoryId}
        >
          <option value="">None</option>
          {subcategories
            .filter((s) => s.category_id === values.categoryId)
            .map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
        </Select>
        {!values.categoryId && (
          <p className="mt-1 text-xs text-muted-foreground">Pick a category first.</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="book-author">Author</Label>
          <div className="mb-2 mt-1 inline-flex rounded-md border border-border p-0.5" role="group" aria-label="Author entry mode">
            <button type="button" aria-pressed={authorMode === "existing"} onClick={() => setAuthorMode("existing")} className={`rounded px-3 py-1.5 text-xs ${authorMode === "existing" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Existing</button>
            <button type="button" aria-pressed={authorMode === "manual"} onClick={() => setAuthorMode("manual")} className={`rounded px-3 py-1.5 text-xs ${authorMode === "manual" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Type new</button>
          </div>
          {authorMode === "existing" ? (
            <Select id="book-author" value={values.authorId} onChange={(event) => setField("authorId", event.target.value)}>
              <option value="">Select an author</option>
              {authors.map((author) => <option key={author.id} value={author.id}>{author.name}</option>)}
            </Select>
          ) : (
            <Input id="book-author" value={manualAuthorName} onChange={(event) => setManualAuthorName(event.target.value)} placeholder="Type author name" />
          )}
          {/* Keyed as "author_id", not "authorId" — errors come from
              validateBookInsert/Update, which validate toBookInsert(values)'s
              snake_case, BookInsert-shaped payload (useBookForm.ts §setField),
              not the camelCase BookFormValues themselves. "title"/"slug"/
              "price" above happen to be spelled identically in both shapes,
              which is why they didn't need this same fix. */}
          {errors.author_id && <p className="mt-1 text-xs text-destructive">{errors.author_id}</p>}
        </div>
        <div>
          <Label htmlFor="book-publisher">Publisher</Label>
          <div className="mb-2 mt-1 inline-flex rounded-md border border-border p-0.5" role="group" aria-label="Publisher entry mode">
            <button type="button" aria-pressed={publisherMode === "existing"} onClick={() => setPublisherMode("existing")} className={`rounded px-3 py-1.5 text-xs ${publisherMode === "existing" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Existing</button>
            <button type="button" aria-pressed={publisherMode === "manual"} onClick={() => setPublisherMode("manual")} className={`rounded px-3 py-1.5 text-xs ${publisherMode === "manual" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Type new</button>
          </div>
          {publisherMode === "existing" ? (
            <Select id="book-publisher" value={values.publisherId ?? ""} onChange={(event) => setField("publisherId", event.target.value)}>
              <option value="">None</option>
              {publishers.map((publisher) => <option key={publisher.id} value={publisher.id}>{publisher.name}</option>)}
            </Select>
          ) : (
            <Input id="book-publisher" value={manualPublisherName} onChange={(event) => setManualPublisherName(event.target.value)} placeholder="Type publisher name (optional)" />
          )}
        </div>
      </div>

      {manualEntryError && <p role="alert" className="text-sm text-destructive">{manualEntryError}</p>}

      <div>
        <Label htmlFor="book-cover">Cover image</Label>
        <Input
          id="book-cover"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => e.target.files?.[0] && selectCoverImageFile(e.target.files[0])}
        />
        {isUploadingImage && <p className="mt-1 text-xs text-muted-foreground">Uploading cover…</p>}
      </div>

      {submitError && <p className="text-sm text-destructive">{submitError}</p>}

      <div className="flex justify-end gap-3 border-t border-border pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        {/* type="button", not "submit" — matches CategoryFormLayout / AuthorFormLayout's
            no-native-<form> convention throughout this project. */}
        <Button type="button" onClick={handleSave} disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : mode === "create" ? "Add Book" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
