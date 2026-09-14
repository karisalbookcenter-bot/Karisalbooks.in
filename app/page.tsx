import Link from "next/link";
import { MainLayout } from "@/components/layout/MainLayout";
import { BookGrid } from "@/features/storefront/components/BookGrid";
import { buildNameMap } from "@/features/storefront/utils";
import { PUBLIC_VISIBLE_STATUS } from "@/features/storefront/constants";
import * as bookService from "@/features/books/services/book.service";
import { authorService } from "@/features/authors/services/author.service";
import { publisherService } from "@/features/publishers/services/publisher.service";
import * as categoryService from "@/features/categories/services/category.service";

/**
 * Home page — Sprint 18
 * Server Component version.
 *
 * Removed "use client" because storefront data is fetched through
 * existing services which use server-side Supabase repository.
 */
export default async function HomePage() {
  const [
    booksResult,
    categoriesResult,
    authorsResult,
    publishersResult,
  ] = await Promise.all([
    bookService.listBooks({
      page: 1,
      pageSize: 8,
      statuses: [PUBLIC_VISIBLE_STATUS],
      sortBy: "created_at",
      sortDirection: "desc",
    }),

    categoryService.listCategories({
      status: PUBLIC_VISIBLE_STATUS,
      pageSize: 100,
    }),

    authorService.list({
      pageSize: 1000,
    }),

    publisherService.list({
      pageSize: 1000,
    }),
  ]);

  const recentBooks = booksResult.data?.items ?? [];

  const categories =
    categoriesResult.data?.items.filter(
      (category) => category.parent_id === null
    ) ?? [];

  const authorNamesById = authorsResult.data
    ? buildNameMap(authorsResult.data.items)
    : {};

  const publisherNamesById = publishersResult.data
    ? buildNameMap(publishersResult.data.items)
    : {};

  return (
    <MainLayout>
      <section className="container flex flex-col items-center gap-4 py-16 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Bookery
        </h1>

        <p className="max-w-md text-muted-foreground">
          Browse our catalog and find your next great read.
        </p>

        <Link
          href="/books"
          className="mt-2 rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground"
        >
          Browse all books
        </Link>
      </section>

      {categories.length > 0 && (
        <section className="container py-8">
          <h2 className="mb-4 text-xl font-semibold">
            Shop by category
          </h2>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="rounded-full border border-border px-4 py-2 text-sm hover:bg-muted"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="container py-8">
        <h2 className="mb-4 text-xl font-semibold">
          Recently added
        </h2>

        <BookGrid
          books={recentBooks}
          authorNamesById={authorNamesById}
          publisherNamesById={publisherNamesById}
        />
      </section>
    </MainLayout>
  );
}