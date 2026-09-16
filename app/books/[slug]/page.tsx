"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MainLayout } from "@/components/layout/MainLayout";
import { formatCurrency } from "@/lib/helpers/format.helpers";
import { getPublicBookBySlug } from "@/features/storefront/services/book.storefront";
import { getPublicAuthorName, getPublicPublisherName } from "@/features/storefront/services/author-publisher.storefront";
import type { Book } from "@/types/book.types";

export default function BookDetailPage() {
  const params = useParams<{ slug: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [authorName, setAuthorName] = useState<string | null>(null);
  const [publisherName, setPublisherName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setNotFound(false);

      const result = await getPublicBookBySlug(params.slug);
      if (!result) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setBook(result);

      const [author, publisher] = await Promise.all([
        getPublicAuthorName(result.author_id),
        result.publisher_id ? getPublicPublisherName(result.publisher_id) : Promise.resolve(null),
      ]);
      setAuthorName(author);
      setPublisherName(publisher);
      setLoading(false);
    }
    load();
  }, [params.slug]);

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-16 text-center text-sm text-muted-foreground">Loading…</div>
      </MainLayout>
    );
  }

  if (notFound || !book) {
    return (
      <MainLayout>
        <div className="container flex flex-col items-center gap-4 py-16 text-center">
          <h1 className="text-2xl font-semibold">Book not found</h1>
          <Link href="/books" className="text-sm text-primary underline">
            Back to all books
          </Link>
        </div>
      </MainLayout>
    );
  }

  const inStock = book.stock_quantity > 0;

  return (
    <MainLayout>
      <div className="container grid gap-8 py-8 sm:grid-cols-[280px_1fr]">
        <div className="flex aspect-[2/3] items-center justify-center rounded-md bg-muted">
          {book.cover_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={book.cover_image_url} alt={book.title} className="h-full w-full rounded-md object-cover" />
          ) : (
            <span className="text-xs text-muted-foreground">No cover</span>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold">{book.title}</h1>
          {authorName && <p className="text-muted-foreground">by {authorName}</p>}
          {publisherName && <p className="text-sm text-muted-foreground">Published by {publisherName}</p>}

          <p className="text-2xl font-semibold">{formatCurrency(book.price)}</p>
          <p className={`text-sm ${inStock ? "text-muted-foreground" : "text-destructive"}`}>
            {inStock ? `In stock (${book.stock_quantity} available)` : "Out of stock"}
          </p>

          {book.isbn && <p className="text-sm text-muted-foreground">ISBN: {book.isbn}</p>}

          {book.description && (
            <div className="mt-4">
              <h2 className="mb-1 text-sm font-semibold">Description</h2>
              <p className="text-sm text-muted-foreground">{book.description}</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
