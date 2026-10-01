"use client";

import { useState } from "react";
import { CheckCircle2, FileText, Printer } from "lucide-react";

export function PublicationQuoteForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [requestNumber, setRequestNumber] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try {
      const response = await fetch("/api/publication-quotes", { method: "POST", body: form });
      const result = await response.json() as { requestNumber?: string; error?: string };
      if (!response.ok) throw new Error(result.error ?? "Unable to send your quotation request.");
      setRequestNumber(result.requestNumber ?? "");
      formElement.reset();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to send your quotation request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="quotation" className="scroll-mt-24 border-t border-border bg-card">
      <div className="container grid gap-8 py-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12 lg:py-14">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Start a conversation</p>
          <h2 className="mt-2 text-2xl font-semibold">Request a printing quotation</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Share your manuscript and production details. Our publishing team will review the files and email a tailored quotation with practical next steps.</p>
          <div className="mt-6 space-y-4 border-t border-border pt-5 text-sm">
            <div className="flex gap-3"><FileText size={18} className="mt-0.5 shrink-0 text-primary" /><p><strong className="font-semibold">Manuscript review</strong><span className="mt-1 block text-xs leading-5 text-muted-foreground">DOC, DOCX, or PDF files, handled privately by our team.</span></p></div>
            <div className="flex gap-3"><Printer size={18} className="mt-0.5 shrink-0 text-primary" /><p><strong className="font-semibold">Print planning</strong><span className="mt-1 block text-xs leading-5 text-muted-foreground">A quotation shaped around your page count, quantity, format, and finish.</span></p></div>
          </div>
        </div>

        <div>
          {requestNumber ? (
            <div role="status" className="border border-emerald-700/20 bg-emerald-50 p-5 text-emerald-950">
              <CheckCircle2 size={22} />
              <h3 className="mt-3 text-lg font-semibold">Your manuscript is with our publishing team.</h3>
              <p className="mt-2 text-sm">Request reference: <strong>{requestNumber}</strong></p>
              <p className="mt-1 text-sm">We’ll review the files and send the quotation to your email. Keep this reference for follow-up.</p>
              <button type="button" onClick={() => setRequestNumber("")} className="mt-4 text-sm font-semibold underline underline-offset-4">Submit another manuscript</button>
            </div>
          ) : (
            <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1 text-sm font-medium">Your name
                <input name="name" required maxLength={120} autoComplete="name" className="w-full rounded-md border bg-background px-3 py-2 font-normal" />
              </label>
              <label className="space-y-1 text-sm font-medium">Email for your quotation
                <input name="email" required type="email" maxLength={254} autoComplete="email" className="w-full rounded-md border bg-background px-3 py-2 font-normal" />
              </label>
              <label className="space-y-1 text-sm font-medium">Mobile
                <input name="phone" required type="tel" maxLength={24} autoComplete="tel" className="w-full rounded-md border bg-background px-3 py-2 font-normal" />
              </label>
              <label className="space-y-1 text-sm font-medium">Book title
                <input name="bookTitle" required maxLength={250} className="w-full rounded-md border bg-background px-3 py-2 font-normal" />
              </label>
              <label className="space-y-1 text-sm font-medium">Estimated pages
                <input name="estimatedPages" required type="number" min="1" max="5000" step="1" className="w-full rounded-md border bg-background px-3 py-2 font-normal" />
              </label>
              <label className="space-y-1 text-sm font-medium">Print quantity
                <input name="printQuantity" required type="number" min="1" max="100000" step="1" className="w-full rounded-md border bg-background px-3 py-2 font-normal" />
              </label>
              <label className="space-y-1 text-sm font-medium">Book size
                <select name="trimSize" required defaultValue="" className="w-full rounded-md border bg-background px-3 py-2 font-normal">
                  <option value="" disabled>Select a size</option>
                  <option value="5 x 8 in">5 × 8 in</option>
                  <option value="5.5 x 8.5 in">5.5 × 8.5 in</option>
                  <option value="6 x 9 in">6 × 9 in</option>
                  <option value="A5">A5</option>
                  <option value="Not decided">Help me choose</option>
                </select>
              </label>
              <label className="space-y-1 text-sm font-medium">Interior printing
                <select name="printType" required defaultValue="black-white" className="w-full rounded-md border bg-background px-3 py-2 font-normal">
                  <option value="black-white">Black and white</option>
                  <option value="colour">Colour</option>
                </select>
              </label>
              <label className="space-y-1 text-sm font-medium">Binding
                <select name="bindingType" required defaultValue="paperback" className="w-full rounded-md border bg-background px-3 py-2 font-normal">
                  <option value="paperback">Paperback</option>
                  <option value="hardcover">Hardcover</option>
                </select>
              </label>
              <label className="space-y-1 text-sm font-medium sm:col-span-2">About your book and print requirements
                <textarea name="description" required minLength={30} maxLength={5000} rows={4} placeholder="Tell us about the book, language, illustrations, and any production needs." className="w-full rounded-md border bg-background px-3 py-2 font-normal" />
              </label>
              <label className="space-y-1 text-sm font-medium">Manuscript file
                <input name="manuscript" required type="file" accept=".doc,.docx,.pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf" className="block w-full rounded-md border bg-background px-3 py-2 text-xs font-normal" />
                <span className="block text-xs font-normal text-muted-foreground">DOC, DOCX or PDF · up to 20 MB</span>
              </label>
              <label className="space-y-1 text-sm font-medium">Cover artwork
                <input name="cover" required type="file" accept=".jpg,.jpeg,.pdf,image/jpeg,application/pdf" className="block w-full rounded-md border bg-background px-3 py-2 text-xs font-normal" />
                <span className="block text-xs font-normal text-muted-foreground">JPG, JPEG or print-ready PDF · up to 20 MB</span>
              </label>

              {error && <p role="alert" className="sm:col-span-2 text-sm text-destructive">{error}</p>}
              <div className="sm:col-span-2 flex flex-wrap items-center gap-4 border-t border-border pt-4">
                <button type="submit" disabled={submitting} className="min-h-11 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                  {submitting ? "Sending files securely…" : "Request my quotation"}
                </button>
                <p className="max-w-md text-xs leading-5 text-muted-foreground">Your files are private and are only accessible to our publishing team. Sending a request does not commit you to print.</p>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}