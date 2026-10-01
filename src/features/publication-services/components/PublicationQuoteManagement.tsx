"use client";

import { useEffect, useState } from "react";
import { ExternalLink, FileText } from "lucide-react";
import { PageContainer } from "@/components/common/PageContainer";

interface QuoteRequest {
  id: string;
  request_number: string;
  name: string;
  email: string;
  phone: string;
  book_title: string;
  description: string;
  estimated_pages: number;
  print_quantity: number;
  trim_size: string;
  print_type: string;
  binding_type: string;
  manuscriptUrl: string | null;
  coverUrl: string | null;
  quote_amount: number | null;
  quote_note: string | null;
  status: string;
  created_at: string;
}

export function PublicationQuoteManagement() {
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/publication-quotes");
      const result = await response.json() as { requests?: QuoteRequest[]; error?: string };
      if (!response.ok) throw new Error(result.error ?? "Unable to load requests.");
      setRequests(result.requests ?? []);
      setAmounts(Object.fromEntries((result.requests ?? []).map((item) => [item.id, item.quote_amount === null ? "" : String(item.quote_amount)])));
      setNotes(Object.fromEntries((result.requests ?? []).map((item) => [item.id, item.quote_note ?? ""])));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load requests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function update(request: QuoteRequest, status: string) {
    setBusyId(request.id);
    setMessage("");
    try {
      const response = await fetch("/api/admin/publication-quotes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: request.id, status, quoteAmount: amounts[request.id] ? Number(amounts[request.id]) : null, quoteNote: notes[request.id] }),
      });
      const result = await response.json() as { error?: string; emailSent?: boolean };
      if (!response.ok) throw new Error(result.error ?? "Unable to update request.");
      setMessage(status === "quoted" ? result.emailSent ? `Quotation emailed to ${request.email}.` : "Quotation saved. Set RESEND_API_KEY and ORDER_EMAIL_FROM to email it automatically." : `Request marked ${status}.`);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update request.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <PageContainer title="Publication enquiries" description="Review private manuscript submissions and send print quotations.">
      {message && <p role="status" className="mb-5 rounded-md border border-border bg-secondary/50 p-3 text-sm">{message}</p>}
      {loading ? <p className="py-10 text-sm text-muted-foreground">Loading submissions…</p> : requests.length === 0 ? (
        <p className="border-y border-border py-10 text-sm text-muted-foreground">No publication enquiries yet.</p>
      ) : (
        <div className="divide-y divide-border border-y border-border">
          {requests.map((request) => (
            <article key={request.id} className="grid gap-5 py-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold">{request.book_title}</h2>
                  <span className="rounded-sm bg-secondary px-2 py-1 text-[10px] font-medium uppercase">{request.status}</span>
                  <span className="text-xs text-muted-foreground">{request.request_number}</span>
                </div>
                <p className="mt-2 text-sm">{request.name} · <a href={`mailto:${request.email}`} className="text-primary underline">{request.email}</a> · {request.phone}</p>
                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">{request.description}</p>
                <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-xs sm:grid-cols-4">
                  <div><dt className="text-muted-foreground">Pages</dt><dd className="mt-1 font-medium">{request.estimated_pages}</dd></div>
                  <div><dt className="text-muted-foreground">Copies</dt><dd className="mt-1 font-medium">{request.print_quantity}</dd></div>
                  <div><dt className="text-muted-foreground">Size</dt><dd className="mt-1 font-medium">{request.trim_size}</dd></div>
                  <div><dt className="text-muted-foreground">Print / binding</dt><dd className="mt-1 font-medium">{request.print_type} · {request.binding_type}</dd></div>
                </dl>
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  {request.manuscriptUrl && <a href={request.manuscriptUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary underline"><FileText size={15} /> Manuscript <ExternalLink size={13} /></a>}
                  {request.coverUrl && <a href={request.coverUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary underline">Cover file <ExternalLink size={13} /></a>}
                </div>
              </div>

              <div className="h-fit space-y-3 border-t border-border pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                <label className="block space-y-1 text-sm font-medium">Quotation amount (₹)
                  <input type="number" min="0" step="0.01" value={amounts[request.id] ?? ""} onChange={(event) => setAmounts((current) => ({ ...current, [request.id]: event.target.value }))} className="w-full rounded-md border bg-background px-3 py-2 font-normal" />
                </label>
                <label className="block space-y-1 text-sm font-medium">Quotation details
                  <textarea rows={3} maxLength={2000} value={notes[request.id] ?? ""} onChange={(event) => setNotes((current) => ({ ...current, [request.id]: event.target.value }))} className="w-full rounded-md border bg-background px-3 py-2 font-normal" />
                </label>
                <div className="flex flex-wrap gap-2">
                  <button type="button" disabled={busyId === request.id} onClick={() => update(request, "reviewing")} className="h-9 rounded-md border px-3 text-xs font-semibold disabled:opacity-50">Mark reviewing</button>
                  <button type="button" disabled={busyId === request.id || !amounts[request.id]} onClick={() => update(request, "quoted")} className="h-9 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground disabled:opacity-50">{busyId === request.id ? "Saving…" : "Save & email quote"}</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </PageContainer>
  );
}