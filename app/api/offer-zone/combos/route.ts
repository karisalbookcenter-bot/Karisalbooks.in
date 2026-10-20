import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("combo_offers")
      .select(`
        id,
        title,
        description,
        offer_price,
        combo_offer_books(book_id)
      `)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    const bookIds = [...new Set(
      (data ?? []).flatMap((offer) =>
        offer.combo_offer_books.map((entry) => entry.book_id),
      ),
    )];
    const { data: books, error: booksError } = bookIds.length
      ? await supabase
          .from("books")
          .select("id, title, slug, price, cover_image_url, status")
          .in("id", bookIds)
      : { data: [], error: null };

    if (booksError) throw new Error(booksError.message);
    const booksById = new Map((books ?? []).map((book) => [book.id, book]));

    const offers = (data ?? [])
      .map((offer) => ({
        ...offer,
        books: offer.combo_offer_books.flatMap((entry) => {
          const book = booksById.get(entry.book_id);
          return book?.status === "active"
            ? [{
                id: book.id,
                title: book.title,
                slug: book.slug,
                price: book.price,
                cover_image_url: book.cover_image_url,
              }]
            : [];
        }),
      }))
      .filter((offer) => offer.books.length >= 2);

    return NextResponse.json({ offers });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load combo offers." },
      { status: 500 },
    );
  }
}
