"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarClock, Check, ExternalLink, Plus } from "lucide-react";
import { PageContainer } from "@/components/common/PageContainer";
import type { Book } from "@/types/book.types";

type AdminBook = Book & {
  prebooking_enabled: boolean;
  prebooking_start_at: string | null;
  prebooking_end_at: string | null;
  prebooking_price: number | null;
  prebooking_offer_price: number | null;
  prebooking_offer_start_at: string | null;
  prebooking_offer_end_at: string | null;
  prebooking_ready_at: string | null;
};

const localDateTime = (date: Date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
const formatDate = (value: string | null) => value ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Not set";

export function PreBookingManagement() {
  const [books, setBooks] = useState<AdminBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedBookId, setSelectedBookId] = useState("");
  const [startsAt, setStartsAt] = useState(() => localDateTime(new Date()));
  const [endsAt, setEndsAt] = useState(() => localDateTime(new Date(Date.now() + 14 * 86400000)));
  const [price, setPrice] = useState("");
  const [offerEnabled, setOfferEnabled] = useState(false);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerStartsAt, setOfferStartsAt] = useState(() => localDateTime(new Date()));
  const [offerEndsAt, setOfferEndsAt] = useState(() => localDateTime(new Date(Date.now() + 3 * 86400000)));

  const availableBooks = useMemo(() => books.filter((book) => !book.prebooking_enabled), [books]);
  const campaigns = useMemo(() => books.filter((book) => book.prebooking_enabled), [books]);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/pre-booking");
      const result = await response.json() as { books?: AdminBook[]; error?: string };
      if (!response.ok) throw new Error(result.error ?? "Unable to load pre-booking titles.");
      setBooks(result.books ?? []);
      setSelectedBookId((current) => current || (result.books ?? []).find((book) => !book.prebooking_enabled)?.id || "");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load pre-booking titles.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function saveCampaign(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/pre-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: selectedBookId,
          startsAt: new Date(startsAt).toISOString(),
          endsAt: new Date(endsAt).toISOString(),
          price: Number(price),
          offerPrice: offerEnabled ? Number(offerPrice) : null,
          offerStartsAt: offerEnabled ? new Date(offerStartsAt).toISOString() : null,
          offerEndsAt: offerEnabled ? new Date(offerEndsAt).toISOString() : null,
        }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Unable to save pre-booking.");
      setPrice("");
      setOfferPrice("");
      setOfferEnabled(false);
      setMessage("Pre-booking period saved.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save pre-booking.");
    } finally {
      setSaving(false);
    }
  }

  async function updateCampaign(bookId: string, action: "ready" | "close", ready?: boolean) {
    setMessage("");
    try {
      const response = await fetch("/api/admin/pre-booking", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, action, ready }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Unable to update pre-booking.");
      setMessage(action === "ready" && ready !== false ? "Distribution readiness recorded." : "Pre-booking updated.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update pre-booking.");
    }
  }

  return (
    <PageContainer title="Pre-booking" description="Schedule reservations, limited-time prices, and distribution readiness.">
      {message && <p role="status" className="mb-5 rounded-md border border-border bg-secondary/50 p-3 text-sm">{message}</p>}

      <section className="mb-8 border-b border-border pb-7">
        <h2 className="mb-4 text-lg font-semibold">Schedule a title</h2>
        {availableBooks.length === 0 ? (
          <p className="text-sm text-muted-foreground">Add an active book in Books before scheduling its pre-booking period. Its regular category and price remain in the catalog for release.</p>
        ) : (
          <form onSubmit={saveCampaign} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <label className="space-y-1 text-sm font-medium xl:col-span-2">Book
              <select required value={selectedBookId} onChange={(event) => setSelectedBookId(event.target.value)} className="w-full rounded-md border bg-background px-3 py-2 font-normal">
                <option value="">Choose a book</option>
                {availableBooks.map((book) => <option key={book.id} value={book.id}>{book.title} · ₹{book.price}</option>)}
              </select>
            </label>
            <label className="space-y-1 text-sm font-medium">Pre-booking price (₹)
              <input required type="number" min="0" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} className="w-full rounded-md border bg-background px-3 py-2 font-normal" />
            </label>
            <label className="space-y-1 text-sm font-medium">Bookings open
              <input required type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} className="w-full rounded-md border bg-background px-3 py-2 font-normal" />
            </label>
            <label className="space-y-1 text-sm font-medium">Bookings close
              <input required type="datetime-local" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} className="w-full rounded-md border bg-background px-3 py-2 font-normal" />
            </label>

            <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium sm:col-span-2">
              <input type="checkbox" checked={offerEnabled} onChange={(event) => setOfferEnabled(event.target.checked)} className="h-4 w-4 accent-primary" />
              Add a separate limited-time offer (membership discounts excluded)
            </label>
            {offerEnabled && <>
              <label className="space-y-1 text-sm font-medium">Offer price (₹)
                <input required type="number" min="0" step="0.01" value={offerPrice} onChange={(event) => setOfferPrice(event.target.value)} className="w-full rounded-md border bg-background px-3 py-2 font-normal" />
              </label>
              <label className="space-y-1 text-sm font-medium">Offer starts
                <input required type="datetime-local" value={offerStartsAt} onChange={(event) => setOfferStartsAt(event.target.value)} className="w-full rounded-md border bg-background px-3 py-2 font-normal" />
              </label>
              <label className="space-y-1 text-sm font-medium">Offer ends
                <input required type="datetime-local" value={offerEndsAt} onChange={(event) => setOfferEndsAt(event.target.value)} className="w-full rounded-md border bg-background px-3 py-2 font-normal" />
              </label>
            </>}
            <div className="flex flex-wrap items-center gap-3 sm:col-span-2 xl:col-span-4">
              <button type="submit" disabled={saving || !selectedBookId} className="inline-flex min-h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                <Plus size={16} /> {saving ? "Saving…" : "Schedule pre-booking"}
              </button>
              <Link href="/admin/books" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">Edit regular book price or category <ExternalLink size={14} /></Link>
            </div>
          </form>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2"><CalendarClock size={18} /><h2 className="text-lg font-semibold">Scheduled and active</h2></div>
        {loading ? <p className="py-8 text-sm text-muted-foreground">Loading titles…</p> : campaigns.length === 0 ? (
          <p className="border-y border-border py-8 text-sm text-muted-foreground">No pre-booking campaigns yet.</p>
        ) : (
          <div className="divide-y divide-border border-y border-border">
            {campaigns.map((book) => {
              const ended = book.prebooking_end_at ? new Date(book.prebooking_end_at).getTime() < Date.now() : false;
              const scheduled = book.prebooking_start_at ? new Date(book.prebooking_start_at).getTime() > Date.now() : false;
              const label = ended ? "In regular catalog" : scheduled ? "Scheduled" : "Open";
              return (
                <article key={book.id} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{book.title}</h3>
                      <span className="rounded-sm bg-secondary px-2 py-1 text-[10px] font-medium uppercase">{book.prebooking_ready_at ? "Distribution ready" : label}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{formatDate(book.prebooking_start_at)} – {formatDate(book.prebooking_end_at)}</p>
                    <p className="mt-1 text-sm">Pre-booking ₹{book.prebooking_price} · Regular catalog ₹{book.price}{book.prebooking_offer_price !== null ? ` · Limited offer ₹${book.prebooking_offer_price}` : ""}</p>
                    {ended && <p className="mt-1 text-xs text-muted-foreground">The booking window has ended. The title is visible in its regular category at the regular book price.</p>}
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {!book.prebooking_ready_at && <button type="button" onClick={() => updateCampaign(book.id, "ready", true)} className="inline-flex h-9 items-center gap-2 rounded-md border px-3 text-xs font-semibold hover:bg-secondary"><Check size={14} /> Mark distribution ready</button>}
                    {book.prebooking_ready_at && <button type="button" onClick={() => updateCampaign(book.id, "ready", false)} className="h-9 rounded-md border px-3 text-xs font-semibold hover:bg-secondary">Undo ready status</button>}
                    <button type="button" onClick={() => updateCampaign(book.id, "close")} className="h-9 rounded-md border px-3 text-xs font-semibold text-destructive hover:bg-destructive/5">Close campaign</button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </PageContainer>
  );
}