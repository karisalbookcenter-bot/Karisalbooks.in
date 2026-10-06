"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Pencil, Plus, X } from "lucide-react";
import { PageContainer } from "@/components/common/PageContainer";
import type { Book } from "@/types/book.types";

type CustomizeBook = Book & {
  prebooking_customize_enabled: boolean;
  customize_price: number | null;
};

export default function CustomizeManagementPage() {
  const [books, setBooks] = useState<CustomizeBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [onlyEnabled, setOnlyEnabled] = useState(false);

  const [selectedBookId, setSelectedBookId] = useState("");
  const [customizePrice, setCustomizePrice] = useState("");
  const [editing, setEditing] = useState(false);

  const selectedBook = useMemo(
    () => books.find((book) => book.id === selectedBookId) ?? null,
    [books, selectedBookId],
  );

  const enabledBooks = useMemo(
    () =>
      books.filter(
        (book) => book.prebooking_customize_enabled === true,
      ),
    [books],
  );

  const filteredBooks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return books.filter((book) => {
      const matchesSearch =
        !query ||
        book.title.toLowerCase().includes(query) ||
        book.slug?.toLowerCase().includes(query);

      const matchesStatus =
        !onlyEnabled || book.prebooking_customize_enabled === true;

      return matchesSearch && matchesStatus;
    });
  }, [books, search, onlyEnabled]);

  async function loadBooks() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/customize", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to load Customize books.",
        );
      }

      setBooks(data.books ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load Customize books.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadBooks();
  }, []);

  function resetForm() {
    setSelectedBookId("");
    setCustomizePrice("");
    setEditing(false);
  }

  function startEdit(book: CustomizeBook) {
    setSelectedBookId(book.id);
    setCustomizePrice(
      book.customize_price !== null
        ? String(book.customize_price)
        : "",
    );
    setEditing(true);
    setError("");
    setSuccess("");
  }

  function startEnable(book: CustomizeBook) {
    setSelectedBookId(book.id);
    setCustomizePrice(
      book.customize_price !== null
        ? String(book.customize_price)
        : "",
    );
    setEditing(false);
    setError("");
    setSuccess("");
  }

  async function saveCustomize() {
    setError("");
    setSuccess("");

    if (!selectedBookId) {
      setError("Please select a book.");
      return;
    }

    const price = Number(customizePrice);

    if (!Number.isFinite(price) || price < 0) {
      setError("Please enter a valid Customize price.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch("/api/admin/customize", {
        method: editing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookId: selectedBookId,
          customizeEnabled: true,
          customizePrice: price,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to save Customize settings.",
        );
      }

      setSuccess(
        editing
          ? "Customize settings updated successfully."
          : "Book added to Customize successfully.",
      );

      resetForm();
      await loadBooks();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save Customize settings.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function disableCustomize(book: CustomizeBook) {
    const confirmed = window.confirm(
      `Disable Customize for "${book.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/admin/customize", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookId: book.id,
          customizeEnabled: false,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to disable Customize.",
        );
      }

      setSuccess(`Customize disabled for "${book.title}".`);

      if (selectedBookId === book.id) {
        resetForm();
      }

      await loadBooks();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to disable Customize.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Customize
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage books available for Customize orders.
            </p>
          </div>

          <button
            type="button"
            onClick={resetForm}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Add Customize Book
          </button>
        </div>

        {/* Rule */}
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-sm font-medium">
            Customize minimum order
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Minimum <strong>200 copies for one title</strong>.
            Different titles cannot be combined to meet the minimum.
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="flex items-center justify-between gap-3 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {success && (
          <div className="flex items-center justify-between gap-3 rounded-md border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400">
            <span>{success}</span>

            <button
              type="button"
              onClick={() => setSuccess("")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Form */}
        <section className="rounded-lg border bg-card p-5">
          <div className="mb-4">
            <h2 className="text-base font-semibold">
              {editing
                ? "Edit Customize Book"
                : "Add Book to Customize"}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Set the fixed Customize price for this title.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_220px_auto] md:items-end">
            <div>
              <label
                htmlFor="customize-book"
                className="mb-2 block text-sm font-medium"
              >
                Book Title
              </label>

              <select
                id="customize-book"
                value={selectedBookId}
                onChange={(event) =>
                  setSelectedBookId(event.target.value)
                }
                disabled={editing || saving}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">Select a book</option>

                {books.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="customize-price"
                className="mb-2 block text-sm font-medium"
              >
                Customize Price
              </label>

              <input
                id="customize-price"
                type="number"
                min="0"
                step="0.01"
                value={customizePrice}
                onChange={(event) =>
                  setCustomizePrice(event.target.value)
                }
                disabled={saving}
                placeholder="0.00"
                className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void saveCustomize()}
                disabled={saving}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
              >
                <Check className="h-4 w-4" />

                {saving
                  ? "Saving..."
                  : editing
                    ? "Update"
                    : "Enable"}
              </button>

              {(selectedBookId || editing) && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium hover:bg-muted disabled:opacity-60"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {selectedBook && (
            <div className="mt-4 rounded-md bg-muted/40 p-3 text-sm">
              <span className="font-medium">
                {selectedBook.title}
              </span>

              <span className="ml-2 text-muted-foreground">
                {selectedBook.prebooking_customize_enabled
                  ? "Customize enabled"
                  : "Customize disabled"}
              </span>
            </div>
          )}
        </section>

        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">
              Customize Eligible Titles
            </p>

            <p className="mt-1 text-2xl font-semibold">
              {enabledBooks.length}
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">
              Minimum Per Title
            </p>

            <p className="mt-1 text-2xl font-semibold">
              200 copies
            </p>
          </div>
        </div>

        {/* Search */}
        <section className="rounded-lg border bg-card p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search book title..."
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring md:max-w-sm"
            />

            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={onlyEnabled}
                onChange={(event) =>
                  setOnlyEnabled(event.target.checked)
                }
                className="h-4 w-4 rounded border"
              />

              Show only Customize eligible
            </label>
          </div>
        </section>

        {/* Books */}
        <section className="overflow-hidden rounded-lg border bg-card">
          <div className="border-b px-5 py-4">
            <h2 className="font-semibold">
              Book Catalogue
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Enable, edit or disable Customize for individual titles.
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Loading books...
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No books found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="border-b bg-muted/30">
                  <tr>
                    <th className="px-5 py-3 text-left font-medium">
                      Book
                    </th>

                    <th className="px-5 py-3 text-left font-medium">
                      Regular Price
                    </th>

                    <th className="px-5 py-3 text-left font-medium">
                      Customize Price
                    </th>

                    <th className="px-5 py-3 text-left font-medium">
                      Status
                    </th>

                    <th className="px-5 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredBooks.map((book) => {
                    const enabled =
                      book.prebooking_customize_enabled === true;

                    return (
                      <tr
                        key={book.id}
                        className="border-b last:border-b-0"
                      >
                        <td className="px-5 py-4">
                          <div className="font-medium">
                            {book.title}
                          </div>

                          {book.slug && (
                            <div className="mt-1 text-xs text-muted-foreground">
                              {book.slug}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          {book.price ?? "—"}
                        </td>

                        <td className="px-5 py-4">
                          {enabled &&
                          book.customize_price !== null
                            ? book.customize_price
                            : "—"}
                        </td>

                        <td className="px-5 py-4">
                          {enabled ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-700 dark:text-green-400">
                              <Check className="h-3.5 w-3.5" />
                              Enabled
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                              Disabled
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            {enabled ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => startEdit(book)}
                                  disabled={saving}
                                  className="inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-medium hover:bg-muted disabled:opacity-50"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    void disableCustomize(book)
                                  }
                                  disabled={saving}
                                  className="inline-flex items-center gap-1.5 rounded-md border border-destructive/30 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
                                >
                                  <X className="h-3.5 w-3.5" />
                                  Disable
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => startEnable(book)}
                                disabled={saving}
                                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                Enable
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </PageContainer>
  );
}