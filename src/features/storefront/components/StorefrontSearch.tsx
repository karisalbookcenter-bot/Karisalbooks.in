"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import {
  listPublicAuthorNames,
  type PublicNameRecord,
} from "@/features/storefront/services/author-publisher.storefront";
import { listPublicBooks } from "@/features/storefront/services/book.storefront";
import type { Book } from "@/types/book.types";

interface StorefrontSearchProps {
  variant?: "icon" | "field";
}

export function StorefrontSearch({ variant = "icon" }: StorefrontSearchProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [authors, setAuthors] = useState<PublicNameRecord[]>([]);
  const [authorsLoaded, setAuthorsLoaded] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [matchedAuthor, setMatchedAuthor] = useState<PublicNameRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const requestId = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open || authorsLoaded) return;

    let active = true;
    listPublicAuthorNames()
      .then((items) => {
        if (!active) return;
        setAuthors(items);
        setAuthorsLoaded(true);
      })
      .catch(() => {
        if (active) {
          setAuthorsLoaded(true);
          setError("Search suggestions are temporarily unavailable.");
        }
      });

    return () => {
      active = false;
    };
  }, [open, authorsLoaded]);

  useEffect(() => {
    const value = query.trim();
    const currentRequest = ++requestId.current;

    if (!open || value.length < 2) {
      setBooks([]);
      setMatchedAuthor(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    if (!authorsLoaded) return;
    setError("");
    const timer = window.setTimeout(async () => {
      const author = authors.find((item) =>
        item.name.toLocaleLowerCase().includes(value.toLocaleLowerCase())
      );

      try {
        const [titleResults, authorResults] = await Promise.all([
          listPublicBooks({ search: value, pageSize: 4 }),
          author
            ? listPublicBooks({ authorId: author.id, pageSize: 4 })
            : Promise.resolve(null),
        ]);

        if (currentRequest !== requestId.current) return;

        const combined = [...titleResults.items, ...(authorResults?.items ?? [])];
        const unique = combined.filter(
          (book, index) => combined.findIndex((item) => item.id === book.id) === index
        );

        setBooks(unique.slice(0, 5));
        setMatchedAuthor(authorResults?.items.length ? author ?? null : null);
      } catch {
        if (currentRequest === requestId.current) {
          setBooks([]);
          setMatchedAuthor(null);
          setError("Search could not be completed. Please try again.");
        }
      } finally {
        if (currentRequest === requestId.current) setLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [authors, authorsLoaded, open, query]);

  function close() {
    setOpen(false);
    setQuery("");
    setBooks([]);
    setMatchedAuthor(null);
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;
    close();
    router.push(`/books?search=${encodeURIComponent(value)}`);
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={open ? "Close book search" : "Search books"}
        aria-expanded={open}
        onClick={() => {
          setOpen((value) => !value);
          if (!open) window.setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className={
          variant === "field"
            ? "inline-flex min-h-12 w-full items-center gap-3 rounded-xl border border-[#d8d1c3] bg-white px-4 text-left text-sm text-muted-foreground shadow-sm transition-all hover:border-[#1d513e]/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            : "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        }
      >
        {open ? <X size={19} aria-hidden="true" /> : <Search size={19} aria-hidden="true" />}
        {variant === "field" && (
          <span className="flex-1">Search books</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[60] mt-2 w-[min(92vw,28rem)] rounded-xl border border-border bg-background p-3 shadow-xl sm:right-0">
          <form id="storefront-search-form" onSubmit={submitSearch} role="search">
            <label className="relative block">
              <span className="sr-only">Search books and authors</span>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") close();
                }}
                placeholder="Book title or author"
                autoComplete="off"
                className="min-h-12 w-full rounded-lg border border-border bg-card pl-10 pr-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </label>
          </form>

          {query.trim().length >= 2 && (
            <div className="mt-2 max-h-[60vh] overflow-y-auto" aria-live="polite">
              {loading && (
                <p className="px-3 py-3 text-sm text-muted-foreground">
                  Searching books…
                </p>
              )}
              {error && (
                <p role="alert" className="px-3 py-3 text-sm text-destructive">
                  {error}
                </p>
              )}
              {!loading && !error && matchedAuthor && (
                <Link
                  href={`/books?authorId=${encodeURIComponent(matchedAuthor.id)}`}
                  onClick={close}
                  className="block rounded-lg px-3 py-3 text-sm font-semibold text-primary hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Browse books by {matchedAuthor.name}
                </Link>
              )}
              {!loading && !error && books.length === 0 && !matchedAuthor && (
                <p className="px-3 py-3 text-sm text-muted-foreground">
                  No matching books found.
                </p>
              )}
              {!loading && !error && books.map((book) => {
                const authorName = authors.find((author) => author.id === book.author_id)?.name;
                return (
                  <Link
                    key={book.id}
                    href={`/books/${book.slug}`}
                    onClick={close}
                    className="block rounded-lg px-3 py-3 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <span className="line-clamp-2 block text-sm font-medium">
                      {book.title}
                    </span>
                    {authorName && (
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {authorName}
                      </span>
                    )}
                  </Link>
                );
              })}
              {!loading && !error && books.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const value = query.trim();
                    close();
                    router.push(`/books?search=${encodeURIComponent(value)}`);
                  }}
                  className="mt-1 min-h-11 w-full rounded-lg px-3 text-left text-sm font-semibold text-primary hover:bg-secondary"
                >
                  View all results for “{query.trim()}”
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
