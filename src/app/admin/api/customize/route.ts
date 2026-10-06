import { NextRequest, NextResponse } from "next/server";
import { authConfig } from "@/config/auth";
import { isAtLeastRole } from "@/constants/roles.constants";
import { getServerAuthUser } from "@/features/auth/services/session.service";
import { createAdminClient } from "@/lib/supabase/admin";

const BOOK_FIELDS = [
  "id",
  "title",
  "slug",
  "cover_image_url",
  "price",
  "record_status",
  "prebooking_customize_enabled",
  "customize_price",
].join(", ");

async function requireAdmin() {
  const user = await getServerAuthUser();

  if (
    !user ||
    !isAtLeastRole(user.role, authConfig.minimumAdminRole)
  ) {
    return NextResponse.json(
      { error: "Admin access required." },
      { status: 403 },
    );
  }

  return null;
}

/**
 * GET
 *
 * Returns active books so the admin can:
 * - choose a title for Customize
 * - see currently enabled Customize titles
 * - see the configured Customize price
 */
export async function GET() {
  const denied = await requireAdmin();

  if (denied) {
    return denied;
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("books")
    .select(BOOK_FIELDS)
    .eq("record_status", "active")
    .order("title", { ascending: true });

  if (error) {
    console.error("Admin customize GET error:", error);

    return NextResponse.json(
      { error: "Unable to load Customize books." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    books: data ?? [],
  });
}

/**
 * POST
 *
 * Enable a book for Customize and set its Customize price.
 */
export async function POST(request: NextRequest) {
  const denied = await requireAdmin();

  if (denied) {
    return denied;
  }

  let input: {
    bookId?: string;
    customizeEnabled?: boolean;
    customizePrice?: number | string | null;
  };

  try {
    input = (await request.json()) as typeof input;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const bookId = input.bookId?.trim();

  if (!bookId) {
    return NextResponse.json(
      { error: "Book ID is required." },
      { status: 400 },
    );
  }

  const enabled = input.customizeEnabled === true;

  const parsedPrice =
    input.customizePrice === null ||
    input.customizePrice === undefined ||
    input.customizePrice === ""
      ? null
      : Number(input.customizePrice);

  if (
    enabled &&
    (parsedPrice === null ||
      !Number.isFinite(parsedPrice) ||
      parsedPrice < 0)
  ) {
    return NextResponse.json(
      {
        error:
          "A valid Customize price is required when Customize is enabled.",
      },
      { status: 400 },
    );
  }

  if (
    parsedPrice !== null &&
    (!Number.isFinite(parsedPrice) || parsedPrice < 0)
  ) {
    return NextResponse.json(
      { error: "Customize price must be a valid non-negative amount." },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();

  const { data: existingBook, error: bookError } = await supabase
    .from("books")
    .select("id, record_status")
    .eq("id", bookId)
    .maybeSingle();

  if (bookError) {
    console.error("Admin customize book lookup error:", bookError);

    return NextResponse.json(
      { error: "Unable to verify the selected book." },
      { status: 500 },
    );
  }

  if (!existingBook) {
    return NextResponse.json(
      { error: "Book not found." },
      { status: 404 },
    );
  }

  if (existingBook.record_status !== "active") {
    return NextResponse.json(
      { error: "Only active books can be enabled for Customize." },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("books")
    .update({
      prebooking_customize_enabled: enabled,
      customize_price: enabled ? parsedPrice : null,
    })
    .eq("id", bookId)
    .select(BOOK_FIELDS)
    .single();

  if (error) {
    console.error("Admin customize POST error:", error);

    return NextResponse.json(
      { error: "Unable to save Customize settings." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    book: data,
  });
}

/**
 * PATCH
 *
 * Edit Customize eligibility or Customize price.
 */
export async function PATCH(request: NextRequest) {
  const denied = await requireAdmin();

  if (denied) {
    return denied;
  }

  let input: {
    bookId?: string;
    customizeEnabled?: boolean;
    customizePrice?: number | string | null;
  };

  try {
    input = (await request.json()) as typeof input;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const bookId = input.bookId?.trim();

  if (!bookId) {
    return NextResponse.json(
      { error: "Book ID is required." },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();

  const { data: existingBook, error: bookError } = await supabase
    .from("books")
    .select(
      "id, record_status, prebooking_customize_enabled, customize_price",
    )
    .eq("id", bookId)
    .maybeSingle();

  if (bookError) {
    console.error("Admin customize PATCH lookup error:", bookError);

    return NextResponse.json(
      { error: "Unable to verify the selected book." },
      { status: 500 },
    );
  }

  if (!existingBook) {
    return NextResponse.json(
      { error: "Book not found." },
      { status: 404 },
    );
  }

  if (existingBook.record_status !== "active") {
    return NextResponse.json(
      { error: "Only active books can be used for Customize." },
      { status: 400 },
    );
  }

  const enabled =
    typeof input.customizeEnabled === "boolean"
      ? input.customizeEnabled
      : existingBook.prebooking_customize_enabled === true;

  let parsedPrice: number | null;

  if (
    input.customizePrice === undefined
  ) {
    parsedPrice = existingBook.customize_price;
  } else if (
    input.customizePrice === null ||
    input.customizePrice === ""
  ) {
    parsedPrice = null;
  } else {
    parsedPrice = Number(input.customizePrice);
  }

  if (
    enabled &&
    (parsedPrice === null ||
      !Number.isFinite(parsedPrice) ||
      parsedPrice < 0)
  ) {
    return NextResponse.json(
      {
        error:
          "A valid Customize price is required when Customize is enabled.",
      },
      { status: 400 },
    );
  }

  if (
    parsedPrice !== null &&
    (!Number.isFinite(parsedPrice) || parsedPrice < 0)
  ) {
    return NextResponse.json(
      { error: "Customize price must be a valid non-negative amount." },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("books")
    .update({
      prebooking_customize_enabled: enabled,
      customize_price: enabled ? parsedPrice : null,
    })
    .eq("id", bookId)
    .select(BOOK_FIELDS)
    .single();

  if (error) {
    console.error("Admin customize PATCH error:", error);

    return NextResponse.json(
      { error: "Unable to update Customize settings." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    book: data,
  });
}