"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpenCheck } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { BookCard } from "@/features/storefront/components/BookCard";
import { listRecommendationShelves, type RecommendationShelf } from "@/features/recommendations/recommendation.service";

export default function RecommendationsPage() {
  const [shelves, setShelves] = useState<RecommendationShelf[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listRecommendationShelves(false)
      .then(setShelves)
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Recommendations are unavailable right now."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <MainLayout>
      <div className="container py-7 sm:py-10">
        <header className="mb-8 border-b border-border pb-5">
          <p className="text-xs font-semibold uppercase text-primary">Handpicked for your next read</p>
          <h1 className="mt-1 text-3xl font-semibold">Recommendations</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Thoughtful collections for every kind of reader, selected by our team.</p>
        </header>

        {loading ? <p className="py-12 text-sm text-muted-foreground">Finding your next read…</p> : error ? (
          <p role="alert" className="py-12 text-sm text-destructive">{error}</p>
        ) : shelves.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <BookOpenCheck size={28} className="text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Fresh picks are on the way</h2>
            <p className="max-w-sm text-sm text-muted-foreground">Our team is putting together thoughtful reading lists. Browse the full collection in the meantime.</p>
            <Link href="/books" className="mt-1 inline-flex min-h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground">Browse books</Link>
          </div>
        ) : (
          <div className="space-y-10">
            {shelves.map((shelf) => (
              <section key={shelf.id} aria-labelledby={`shelf-${shelf.id}`}>
                <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-3">
                  <div>
                    <div className="mb-1 flex flex-wrap gap-2">
                      {shelf.variety_tag && <span className="text-[10px] font-semibold uppercase text-primary">{shelf.variety_tag}</span>}
                      {shelf.category_name && <span className="text-[10px] text-muted-foreground">{shelf.category_name}</span>}
                    </div>
                    <h2 id={`shelf-${shelf.id}`} className="text-xl font-semibold">{shelf.title}</h2>
                    {shelf.description && <p className="mt-1 text-sm text-muted-foreground">{shelf.description}</p>}
                  </div>
                  <span className="text-xs text-muted-foreground">{shelf.books.length} {shelf.books.length === 1 ? "book" : "books"}</span>
                </div>
                {shelf.books.length ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                    {shelf.books.map((book) => <BookCard key={book.id} book={book} />)}
                  </div>
                ) : <p className="py-6 text-sm text-muted-foreground">Books are being added to this list.</p>}
              </section>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}