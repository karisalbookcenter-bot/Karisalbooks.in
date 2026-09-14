import Link from "next/link";
import { MainLayout } from "@/components/layout/MainLayout";
import { formatCurrency } from "@/lib/helpers/format.helpers";
import * as bookService from "@/features/books/services/book.service";
import { authorService } from "@/features/authors/services/author.service";
import { publisherService } from "@/features/publishers/services/publisher.service";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function BookDetailPage({ params }: Props) {
  const { slug } = await params;

  const bookResult = await bookService.getBookBySlug(slug);

  if (!bookResult.data) {
    return (
      <MainLayout>
        <div className="container flex flex-col items-center gap-4 py-16 text-center">
          <h1 className="text-2xl font-semibold">
            Book not found
          </h1>

          <Link
            href="/books"
            className="text-sm text-primary underline"
          >
            Back to all books
          </Link>
        </div>
      </MainLayout>
    );
  }

  const book = bookResult.data;

  const [authorResult, publisherResult] = await Promise.all([
    authorService.get(book.author_id),
    book.publisher_id
      ? publisherService.get(book.publisher_id)
      : Promise.resolve({ data: null }),
  ]);

  const author = authorResult.data;
  const publisher = publisherResult.data;

  const inStock = book.stock_quantity > 0;

  return (
    <MainLayout>
      <div className="container grid gap-8 py-8 sm:grid-cols-[280px_1fr]">

        <div className="flex aspect-[2/3] items-center justify-center rounded-md bg-muted">
          {book.cover_image_url ? (
            <img
              src={book.cover_image_url}
              alt={book.title}
              className="h-full w-full rounded-md object-cover"
            />
          ) : (
            <span className="text-xs text-muted-foreground">
              No cover
            </span>
          )}
        </div>


        <div className="flex flex-col gap-3">

          <h1 className="text-3xl font-semibold">
            {book.title}
          </h1>


          {author && (
            <p className="text-muted-foreground">
              by {author.name}
            </p>
          )}


          {publisher && (
            <p className="text-sm text-muted-foreground">
              Published by {publisher.name}
            </p>
          )}


          <p className="text-2xl font-semibold">
            {formatCurrency(book.price)}
          </p>


          <p className={`text-sm ${inStock ? "text-muted-foreground" : "text-destructive"}`}>
            {inStock
              ? `In stock (${book.stock_quantity} available)`
              : "Out of stock"}
          </p>


          {book.isbn && (
            <p className="text-sm text-muted-foreground">
              ISBN: {book.isbn}
            </p>
          )}


          {book.description && (
            <div className="mt-4">
              <h2 className="mb-1 text-sm font-semibold">
                Description
              </h2>

              <p className="text-sm text-muted-foreground">
                {book.description}
              </p>
            </div>
          )}

        </div>

      </div>
    </MainLayout>
  );
}