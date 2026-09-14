import Link from "next/link";
import { MainLayout } from "@/components/layout/MainLayout";
import { BookGrid } from "@/features/storefront/components/BookGrid";
import { buildNameMap } from "@/features/storefront/utils";
import { PUBLIC_VISIBLE_STATUS } from "@/features/storefront/constants";

import * as bookService from "@/features/books/services/book.service";
import * as categoryService from "@/features/categories/services/category.service";
import * as subcategoryService from "@/features/categories/services/subcategory.service";

import { authorService } from "@/features/authors/services/author.service";
import { publisherService } from "@/features/publishers/services/publisher.service";

import type { Category } from "@/types/category.types";
import type { Book } from "@/types/book.types";


type Props = {
  params: Promise<{
    slug: string;
  }>;
};


export default async function CategoryPage({ params }: Props) {

  const { slug } = await params;


  const categoriesResult =
    await categoryService.listCategories({
      status: PUBLIC_VISIBLE_STATUS,
      pageSize: 1000,
    });


  const category =
    categoriesResult.data?.items.find(
      (c: Category) => c.slug === slug
    );


  if (!category) {
    return (
      <MainLayout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-semibold">
            Category not found
          </h1>
        </div>
      </MainLayout>
    );
  }


  const [
    booksResult,
    subcategoriesResult,
    authorsResult,
    publishersResult,
  ] = await Promise.all([

    bookService.listBooks({
      categoryId: category.id,
      statuses: [PUBLIC_VISIBLE_STATUS],
      page: 1,
      pageSize: 50,
    }),

    subcategoryService.listSubcategories({
      categoryId: category.id,
      pageSize: 100,
    }),

    authorService.list({
      pageSize: 1000,
    }),

    publisherService.list({
      pageSize: 1000,
    }),
  ]);


  const books: Book[] =
    booksResult.data?.items ?? [];


  const authorNamesById =
    authorsResult.data
      ? buildNameMap(authorsResult.data.items)
      : {};


  const publisherNamesById =
    publishersResult.data
      ? buildNameMap(publishersResult.data.items)
      : {};



  return (
    <MainLayout>

      <div className="container flex flex-col gap-8 py-8">


        <h1 className="text-3xl font-semibold">
          {category.name}
        </h1>


        {subcategoryResultHasItems(subcategoriesResult.data?.items) && (

          <div className="flex flex-wrap gap-2">

            {subcategoriesResult.data!.items.map((sub) => (

              <span
                key={sub.id}
                className="rounded-full border px-4 py-2 text-sm"
              >
                {sub.name}
              </span>

            ))}

          </div>

        )}


        <BookGrid
          books={books}
          authorNamesById={authorNamesById}
          publisherNamesById={publisherNamesById}
        />


        {books.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No books found.
          </p>
        )}


        <Link
          href="/books"
          className="text-sm text-primary underline"
        >
          View all books
        </Link>


      </div>

    </MainLayout>
  );
}



function subcategoryResultHasItems(items: unknown[] | undefined) {
  return !!items && items.length > 0;
}