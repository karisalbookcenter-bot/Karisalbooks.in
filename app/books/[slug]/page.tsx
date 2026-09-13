"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MainLayout } from "@/components/layout/MainLayout";
import { formatCurrency } from "@/lib/helpers/format.helpers";
import * as bookService from "@/features/books/services/book.service";
import { authorService } from "@/features/authors/services/author.service";
import { publisherService } from "@/features/publishers/services/publisher.service";
import type { Book } from "@/types/book.types";
import type { Author } from "@/types/author.types";
import type { Publisher } from "@/types/publisher.types";

/**
 * Book detail page — Sprint 18. `useParams()` (Client Component), not a
 * `params` prop — this project's confirmed convention is every service
 * (`book`/`category`/`subcategory`/`author`/`publisher`) uses the browser
 * Supabase client, so a Server Component here couldn't call
 * `getBookBySlug` directly without introducing a new fetching pattern,
 * which is out of scope for this sprint.
 *
 * Author/Publisher resolved via `.get(id)` (confirmed real method,
 * `author.service.ts`) rather than fetching the full list — the more
 * efficient choice for a single-item detail page, unlike the listing
 * pages' "fetch once, resolve many" approach.
 */
export default function BookDetailPage() {
  const params = useParams<{ slug: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [author, setAuthor] = useState<Author | null>(null);
  const [publisher, setPublisher] = useState<Publisher | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setNotFound(false);

      const result = await bookService.getBookBySlug(params.slug);
      if (!result.data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setBook(result.data);

      const [authorResult, publisherResult] = await Promise.all([
        authorService.get(result.data.author_id),
        result.data.publisher_id ? publisherService.get(result.data.publisher_id) : Promise.resolve({ data: null }),
      ]);
      if (authorResult.data) setAuthor(authorResult.data);
      if (publisherResult.data) setPublisher(publisherResult.data);
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
          {author && <p className="text-muted-foreground">by {author.name}</p>}
          {publisher && <p className="text-sm text-muted-foreground">Published by {publisher.name}</p>}

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
