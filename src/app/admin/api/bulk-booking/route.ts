import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type BulkBookingRequestBody = {
  bookTitle?: unknown;
  author?: unknown;
  quantity?: unknown;
  customerMessage?: unknown;
  customerName?: unknown;
  customerEmail?: unknown;
  customerMobile?: unknown;
};

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BulkBookingRequestBody;

    const bookTitle = cleanText(body.bookTitle);
    const author = cleanText(body.author);
    const customerMessage = cleanText(body.customerMessage);
    const customerName = cleanText(body.customerName);
    const customerEmail = cleanText(body.customerEmail).toLowerCase();
    const customerMobile = cleanText(body.customerMobile);

    const quantity = Number(body.quantity);

    if (!bookTitle) {
      return NextResponse.json(
        { error: "Book title is required." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json(
        { error: "Enter a valid quantity." },
        { status: 400 }
      );
    }

    if (quantity > 100000) {
      return NextResponse.json(
        { error: "The requested quantity is too large." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("bulk_booking_requests")
      .insert({
        book_title: bookTitle,
        author: author || null,
        quantity,
        customer_message: customerMessage || null,
        customer_name: customerName || null,
        customer_email: customerEmail || null,
        customer_mobile: customerMobile || null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Bulk booking request error:", error);

      return NextResponse.json(
        { error: "Unable to submit the bulk booking request." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        requestId: data.id,
        message:
          "Your bulk booking request has been submitted successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Bulk booking request POST error:", error);

    return NextResponse.json(
      { error: "Unable to submit the bulk booking request." },
      { status: 500 }
    );
  }
}