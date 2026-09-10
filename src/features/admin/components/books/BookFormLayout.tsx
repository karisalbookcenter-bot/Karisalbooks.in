"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ParentCategorySelector } from "@/features/admin/components/subcategories";
import { useBookForm } from "@/features/books/hooks/useBookForm";
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

  const handleSave = async () => {
    const result = await submit();
    if (result?.data) onSuccess?.(result.data);
  };

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
          <Label>Category</Label>
          <ParentCategorySelector
            categories={categories}
            value={values.categoryId}
            onChange={(id) => setField("categoryId", id ?? "")}
            allowAll={false}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="book-author">Author</Label>
          <Select
            id="book-author"
            value={values.authorId}
            onChange={(e) => setField("authorId", e.target.value)}
          >
            <option value="">Select an author</option>
            {authors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
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
          <Select
            id="book-publisher"
            value={values.publisherId ?? ""}
            onChange={(e) => setField("publisherId", e.target.value)}
          >
            <option value="">None</option>
            {publishers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

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
