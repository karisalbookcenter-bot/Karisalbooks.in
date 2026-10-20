import { NextResponse } from "next/server";
import { authConfig } from "@/config/auth";
import { isAtLeastRole } from "@/constants/roles.constants";
import { getServerAuthUser } from "@/features/auth/services/session.service";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const user = await getServerAuthUser();

  return user &&
    isAtLeastRole(user.role, authConfig.minimumAdminRole)
    ? null
    : NextResponse.json({ error: "Admin access required." }, { status: 403 });
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const supabase = createAdminClient();
    const [{ data: books, error: booksError }, { data: offers, error: offersError }] =
      await Promise.all([
        supabase
          .from("books")
          .select("id, title, price, cover_image_url")
          .eq("status", "active")
          .order("title"),
        supabase
          .from("combo_offers")
          .select("id, title, description, offer_price, status, combo_offer_books(book_id)")
          .order("created_at", { ascending: false }),
      ]);

    if (booksError) throw new Error(booksError.message);
    if (offersError) throw new Error(offersError.message);

    return NextResponse.json({ books: books ?? [], offers: offers ?? [] });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load combo offers." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const input = (await request.json()) as {
      id?: string;
      title?: string;
      description?: string;
      offerPrice?: number;
      status?: "active" | "inactive";
      bookIds?: string[];
    };

    const title = input.title?.trim();
    const bookIds = Array.isArray(input.bookIds) ? [...new Set(input.bookIds)] : [];
    const offerPrice = Number(input.offerPrice);

    if (
      !title ||
      title.length > 160 ||
      !Number.isFinite(offerPrice) ||
      offerPrice < 1 ||
      Math.abs(Math.round(offerPrice * 100) - offerPrice * 100) > 0.000001 ||
      bookIds.length < 2 ||
      bookIds.some((id) => typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id)) ||
      (input.status !== "active" && input.status !== "inactive")
    ) {
      return NextResponse.json(
        { error: "Enter a title, a price of at least ₹1, a status, and select at least two books." },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();
    const { data: validBooks, error: booksError } = await supabase
      .from("books")
      .select("id")
      .in("id", bookIds)
      .eq("status", "active");

    if (booksError) throw new Error(booksError.message);
    if (validBooks?.length !== bookIds.length) {
      return NextResponse.json({ error: "One or more selected books are unavailable." }, { status: 400 });
    }

    const offerValues = {
      title,
      description: input.description?.trim() || null,
      offer_price: offerPrice,
      status: input.status,
    };

    const writeOffer = input.id
      ? await supabase.from("combo_offers").update(offerValues).eq("id", input.id).select("id").single()
      : await supabase.from("combo_offers").insert(offerValues).select("id").single();

    if (writeOffer.error) throw new Error(writeOffer.error.message);

    const offerId = writeOffer.data.id;
    const { error: deleteBooksError } = await supabase
      .from("combo_offer_books")
      .delete()
      .eq("combo_offer_id", offerId);

    if (deleteBooksError) throw new Error(deleteBooksError.message);

    const { error: insertBooksError } = await supabase
      .from("combo_offer_books")
      .insert(bookIds.map((bookId) => ({ combo_offer_id: offerId, book_id: bookId })));

    if (insertBooksError) throw new Error(insertBooksError.message);

    return NextResponse.json({ id: offerId });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save combo offer." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const input = (await request.json()) as { id?: string };
    if (!input.id) {
      return NextResponse.json({ error: "Choose a combo offer to delete." }, { status: 400 });
    }

    const { error } = await createAdminClient()
      .from("combo_offers")
      .delete()
      .eq("id", input.id);

    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete combo offer." },
      { status: 500 },
    );
  }
}
