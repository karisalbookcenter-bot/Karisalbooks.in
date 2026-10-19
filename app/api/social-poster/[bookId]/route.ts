import { ImageResponse } from "next/og";
import { NextResponse } from "next/server";
import { createElement } from "react";

import { BookSocialPoster } from "@/features/marketing/components/BookSocialPoster";
import {
  calculateBookPrice,
  isBookDiscountEligible,
} from "@/lib/helpers/book-pricing.helpers";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "edge";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ bookId: string }>;
}

function formatPosterPrice(amount: number) {
  return `Rs. ${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { bookId } = await params;
    const supabase = createAdminClient();
    const { data: book, error } = await supabase
      .from("books")
      .select("title, slug, price, category_id, cover_image_url, status, is_free_delivery")
      .eq("id", bookId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!book || book.status !== "active" || !book.cover_image_url) {
      return NextResponse.json(
        { error: "An active book with a cover image is required." },
        { status: 404 },
      );
    }

    const [{ data: category, error: categoryError }, { data: settings, error: settingsError }] =
      await Promise.all([
        supabase
          .from("categories")
          .select("name")
          .eq("id", book.category_id)
          .maybeSingle(),
        supabase
          .from("site_settings")
          .select("site_logo_url")
          .eq("id", "public")
          .maybeSingle(),
      ]);
    if (categoryError) throw new Error(categoryError.message);
    if (settingsError) throw new Error(settingsError.message);

    const price = calculateBookPrice(
      Number(book.price),
      isBookDiscountEligible(category?.name),
    );
    const discountLabel =
      price.discountAmount > 0
        ? `SAVE ${Math.round(
            (price.discountAmount / price.originalPrice) * 100,
          )}%`
        : "";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
    if (!siteUrl) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_SITE_URL is required to create the poster." },
        { status: 503 },
      );
    }
    const fontResponse = await fetch(
      `${siteUrl}/font/NotoSansTamil-VariableFont_wdth,wght.ttf`,
    );
    if (!fontResponse.ok) {
      throw new Error("The Tamil font could not be loaded for the poster.");
    }
    const tamilFont = await fontResponse.arrayBuffer();

    return new ImageResponse(
      createElement(BookSocialPoster, {
        title: book.title,
        coverImageUrl: book.cover_image_url,
        logoUrl: settings?.site_logo_url ?? "",
        categoryName: category?.name ?? "",
        originalPrice: formatPosterPrice(price.originalPrice),
        discountedPrice: formatPosterPrice(price.discountedPrice),
        discountLabel,
        freeDelivery: book.is_free_delivery === true,
        orderUrl: `${siteUrl}/books/${book.slug}`,
        storeName: new URL(siteUrl).host,
      }),
      {
        width: 1080,
        height: 1350,
        fonts: [
          {
            name: "Noto Sans Tamil",
            data: tamilFont,
            weight: 400,
            style: "normal",
          },
        ],
        headers: { "Cache-Control": "public, max-age=300" },
      },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create the book poster.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
