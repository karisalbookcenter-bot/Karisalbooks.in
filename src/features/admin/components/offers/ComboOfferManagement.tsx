"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/helpers/format.helpers";

interface ComboBook {
  id: string;
  title: string;
  price: number;
  cover_image_url: string | null;
}

interface ComboOffer {
  id: string;
  title: string;
  description: string | null;
  offer_price: number;
  poster_url: string | null;
  status: "active" | "inactive";
  combo_offer_books: { book_id: string }[];
}

interface ComboOfferForm {
  title: string;
  description: string;
  offerPrice: string;
  posterUrl: string;
  status: "active" | "inactive";
  bookIds: string[];
}

const emptyForm: ComboOfferForm = {
  title: "",
  description: "",
  offerPrice: "",
  posterUrl: "",
  status: "inactive",
  bookIds: [],
};

export function ComboOfferManagement() {
  const [books, setBooks] = useState<ComboBook[]>([]);
  const [offers, setOffers] = useState<ComboOffer[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/combo-offers");
      const result = await response.json() as {
        books?: ComboBook[];
        offers?: ComboOffer[];
        error?: string;
      };
      if (!response.ok) throw new Error(result.error ?? "Unable to load combo offers.");
      setBooks(result.books ?? []);
      setOffers(result.offers ?? []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load combo offers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function startEditing(offer: ComboOffer) {
    setEditingId(offer.id);
    setForm({
      title: offer.title,
      description: offer.description ?? "",
      offerPrice: String(offer.offer_price),
      posterUrl: offer.poster_url ?? "",
      status: offer.status,
      bookIds: offer.combo_offer_books.map((entry) => entry.book_id),
    });
    setMessage("");
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
  }

  async function uploadPoster(file: File | undefined) {
    if (!file) return;
    setMessage("");
    setUploadingPoster(true);
    try {
      const upload = new FormData();
      upload.set("file", file);
      upload.set("assetType", "combo-poster");
      const response = await fetch("/api/admin/site-assets", {
        method: "POST",
        body: upload,
      });
      const result = await response.json() as { url?: string; error?: string };
      if (!response.ok || !result.url) {
        throw new Error(result.error ?? "Unable to upload combo poster.");
      }
      setForm((current) => ({ ...current, posterUrl: result.url! }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to upload combo poster.");
    } finally {
      setUploadingPoster(false);
    }
  }

  async function saveOffer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/combo-offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          id: editingId ?? undefined,
          offerPrice: Number(form.offerPrice),
        }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Unable to save combo offer.");
      resetForm();
      setMessage("Combo offer saved.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save combo offer.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteOffer(offer: ComboOffer) {
    if (!window.confirm(`Delete "${offer.title}"?`)) return;
    try {
      const response = await fetch("/api/admin/combo-offers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: offer.id }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Unable to delete combo offer.");
      if (editingId === offer.id) resetForm();
      setMessage("Combo offer deleted.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete combo offer.");
    }
  }

  return (
    <section className="mt-10 border-t border-border pt-7">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Combo offers</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Select two or more books and enter one manual combo price. This amount includes delivery and never uses catalog discounts or courier calculations. Active combos appear in the Combo offers section of Offer Zone, above current coupon offers.
        </p>
        <Link href="/offer-zone" target="_blank" className="mt-2 inline-flex text-sm font-semibold text-primary underline underline-offset-2">
          View Offer Zone
        </Link>
      </div>

      {message && <p role="status" className="mb-4 rounded-md border border-border bg-secondary/50 p-3 text-sm">{message}</p>}

      <form onSubmit={saveOffer} className="mb-7 grid gap-4 rounded-lg border border-border p-4 md:grid-cols-2">
        <label className="space-y-1 text-sm font-medium">
          Combo title
          <input required maxLength={160} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="w-full rounded-md border bg-background px-3 py-2 font-normal" />
        </label>
        <label className="space-y-1 text-sm font-medium">
          Combo offer price (₹, delivery included)
          <input required type="number" min="1" step="0.01" value={form.offerPrice} onChange={(event) => setForm({ ...form, offerPrice: event.target.value })} className="w-full rounded-md border bg-background px-3 py-2 font-normal" />
        </label>
        <label className="space-y-1 text-sm font-medium md:col-span-2">
          Description (optional)
          <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={2} className="w-full rounded-md border bg-background px-3 py-2 font-normal" />
        </label>
        <div className="space-y-2 text-sm font-medium md:col-span-2">
          <label htmlFor="combo-offer-poster">Combo offer poster (optional)</label>
          <input
            id="combo-offer-poster"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={uploadingPoster}
            onChange={(event) => {
              void uploadPoster(event.target.files?.[0]);
              event.currentTarget.value = "";
            }}
            className="block w-full rounded-md border bg-background px-3 py-2 font-normal"
          />
          <p className="text-xs font-normal text-muted-foreground">JPG, PNG, or WEBP · maximum 5 MB. This poster will appear on Offer Zone and in the shared combo link.</p>
          {uploadingPoster && <p role="status" className="text-xs text-muted-foreground">Uploading poster…</p>}
          {form.posterUrl && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative h-28 w-40 overflow-hidden rounded-md border bg-secondary">
                <Image src={form.posterUrl} alt={`${form.title || "Combo offer"} poster preview`} fill sizes="160px" className="object-contain" />
              </div>
              <button type="button" onClick={() => setForm({ ...form, posterUrl: "" })} className="rounded-md border px-3 py-2 text-sm">Remove poster</button>
            </div>
          )}
        </div>
        <label className="space-y-1 text-sm font-medium">
          Offer status
          <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as "active" | "inactive" })} className="w-full rounded-md border bg-background px-3 py-2 font-normal">
            <option value="inactive">Inactive</option>
            <option value="active">Active</option>
          </select>
        </label>
        <fieldset className="space-y-2 md:col-span-2">
          <legend className="mb-1 text-sm font-semibold">Books in this combo (select at least two)</legend>
          {books.length ? (
            <div className="grid max-h-64 gap-2 overflow-y-auto rounded-md border p-3 sm:grid-cols-2">
              {books.map((book) => (
                <label key={book.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.bookIds.includes(book.id)}
                    onChange={(event) => setForm({
                      ...form,
                      bookIds: event.target.checked
                        ? [...form.bookIds, book.id]
                        : form.bookIds.filter((id) => id !== book.id),
                    })}
                    className="h-4 w-4 accent-primary"
                  />
                  <span>{book.title} <span className="text-muted-foreground">· catalog {formatCurrency(Number(book.price))}</span></span>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No active books available to select.</p>
          )}
          <p className="text-xs text-muted-foreground">Selected: {form.bookIds.length}</p>
        </fieldset>
        <div className="flex gap-2 md:col-span-2">
          <button type="submit" disabled={saving || form.bookIds.length < 2} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {saving ? "Saving…" : editingId ? "Update combo" : "Create combo"}
          </button>
          {editingId && <button type="button" onClick={resetForm} className="rounded-md border px-4 py-2 text-sm">Cancel edit</button>}
        </div>
      </form>

      {loading ? <p role="status" className="py-4 text-sm text-muted-foreground">Loading combo offers…</p> : offers.length ? (
        <div className="space-y-3">
          {offers.map((offer) => (
            <article key={offer.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4">
              <div>
                <h3 className="font-semibold">{offer.title} <span className="text-xs font-normal uppercase text-muted-foreground">· {offer.status}</span></h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {offer.combo_offer_books.length} books · {formatCurrency(Number(offer.offer_price))} total, delivery included
                </p>
              </div>
              {offer.poster_url && (
                <div className="relative h-20 w-28 overflow-hidden rounded-md border bg-secondary">
                  <Image src={offer.poster_url} alt={`${offer.title} poster`} fill sizes="112px" className="object-contain" />
                </div>
              )}
              <div className="flex gap-2">
                <button type="button" onClick={() => startEditing(offer)} className="rounded-md border px-3 py-2 text-sm">Edit</button>
                <button type="button" onClick={() => void deleteOffer(offer)} className="rounded-md border border-destructive/30 px-3 py-2 text-sm text-destructive">Delete</button>
              </div>
            </article>
          ))}
        </div>
      ) : <p className="py-4 text-sm text-muted-foreground">No combo offers created yet.</p>}
    </section>
  );
}
