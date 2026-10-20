"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

interface ShareBookButtonProps {
  title: string;
  slug?: string;
  url?: string;
  compact?: boolean;
}

export function ShareBookButton({
  title,
  slug,
  url,
  compact = false,
}: ShareBookButtonProps) {
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  async function copyLink(url: string) {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.createElement("textarea");
      input.value = url;
      input.setAttribute("readonly", "");
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      const copiedToClipboard = document.execCommand("copy");
      input.remove();

      if (!copiedToClipboard) {
        throw new Error("Copying the book link is not supported in this browser.");
      }
    }

    setCopied(true);
    setMessage("Link copied.");
    window.setTimeout(() => setCopied(false), 2000);
  }

  async function shareBook() {
    const shareUrl = url
      ? new URL(url, window.location.origin).toString()
      : new URL(`/books/${encodeURIComponent(slug ?? "")}`, window.location.origin).toString();
    setMessage("");

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text: `Take a look at ${title}`, url: shareUrl });
        setMessage("Link shared.");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setMessage(error instanceof Error ? error.message : "Unable to share this link.");
      }
      return;
    }

    try {
      await copyLink(shareUrl);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to copy the link.");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => void shareBook()}
        aria-label={`Share ${title}`}
        title={copied ? "Book link copied" : `Share ${title}`}
        className={compact
          ? "inline-flex min-h-11 min-w-0 items-center justify-center gap-1 rounded-md border border-border bg-white px-2 text-[11px] font-semibold text-foreground hover:bg-secondary sm:min-h-8"
          : "grid h-11 w-11 place-items-center rounded-full border border-border/80 bg-white/95 text-slate-700 shadow-md backdrop-blur transition-all hover:scale-105 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"}
      >
        {copied ? <Check size={18} aria-hidden="true" /> : <Share2 size={18} aria-hidden="true" />}
        {compact && <span>{copied ? "Copied" : "Share"}</span>}
      </button>
      <span className="sr-only" role="status" aria-live="polite">{message}</span>
    </>
  );
}
