import { MainLayout } from "@/components/layout/MainLayout";
import { BookGrid } from "@/features/storefront/components/BookGrid";
import { SearchBar } from "@/components/common";
import { buildNameMap } from "@/features/storefront/utils";
import { PUBLIC_VISIBLE_STATUS } from "@/features/storefront/constants";
import * as bookService from "@/features/books/services/book.service";
import { authorService } from "@/features/authors/services/author.service";
import { publisherService } from "@/features/publishers/services/publisher.service";
import * as categoryService from "@/features/categories/services/category.service";

const PAGE_SIZE = 12;

export default async function BooksPage() {
  const [
    booksResult,
    categoriesResult,
    authorsResult,
    publishersResult,
  ] = await Promise.all([
    bookService.listBooks({
      page: 1,
      pageSize: PAGE_SIZE,
      statuses: [PUBLIC_VISIBLE_STATUS],
    }),

    categoryService.listCategories({
      status: PUBLIC_VISIBLE_STATUS,
      pageSize: 1000,
    }),

    authorService.list({
      pageSize: 1000,
    }),

    publisherService.list({
      pageSize: 1000,
    }),
  ]);

  const books = booksResult.data?.items ?? [];

  const categories = categoriesResult.data?.items ?? [];

  const authorNamesById = authorsResult.data
    ? buildNameMap(authorsResult.data.items)
    : {};

  const publisherNamesById = publishersResult.data
    ? buildNameMap(publishersResult.data.items)
    : {};

  return (
    <MainLayout>
      <div className="container flex flex-col gap-6 py-8">

        <h1 className="text-2xl font-semibold">
          All Books
        </h1>

        <SearchBar
          placeholder="Search by title, ISBN, or description…"
        />

        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              className="rounded-md border border-border px-3 py-2 text-sm"
            >
              {category.name}
            </button>
          ))}
        </div>

        <BookGrid
          books={books}
          authorNamesById={authorNamesById}
          publisherNamesById={publisherNamesById}
        />

      </div>
    </MainLayout>
  );
}