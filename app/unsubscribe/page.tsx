"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function UnsubscribePage() {
  return <Suspense fallback={<main className="mx-auto flex min-h-screen max-w-xl items-center px-5 text-sm text-muted-foreground">Loading email preferences…</main>}><UnsubscribeContent /></Suspense>;
}

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function unsubscribe() {
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/marketing/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Unable to update email preferences.");
      setDone(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to update email preferences.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-5 py-12">
      <p className="text-xs font-semibold uppercase text-primary">Karisal Books</p>
      <h1 className="mt-3 text-2xl font-semibold">Email preferences</h1>
      {done ? (
        <p className="mt-3 text-sm text-muted-foreground">You have been unsubscribed from offer emails. Order and account messages may still be sent when needed.</p>
      ) : (
        <>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Confirm that you no longer want to receive new-book and special-offer emails.</p>
          {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
          <button type="button" disabled={!token || saving} onClick={() => void unsubscribe()} className="mt-5 min-h-10 w-fit rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50">
            {saving ? "Updating…" : "Unsubscribe from offers"}
          </button>
        </>
      )}
    </main>
  );
}