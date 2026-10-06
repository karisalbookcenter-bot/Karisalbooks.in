import { NextResponse } from "next/server";
import { authConfig } from "@/config/auth";
import { isAtLeastRole } from "@/constants/roles.constants";
import { getServerAuthUser } from "@/features/auth/services/session.service";
import { createAdminClient } from "@/lib/supabase/admin";

const BOOK_FIELDS =
  "id, title, slug, price, cover_image_url, prebooking_enabled, prebooking_customize_enabled, prebooking_start_at, prebooking_end_at, prebooking_price, prebooking_offer_price, prebooking_offer_start_at, prebooking_offer_end_at, prebooking_ready_at, prebooking_professional_courier_charge, prebooking_postal_charge";

async function requireAdmin() {
  const user = await getServerAuthUser();

  return user &&
    isAtLeastRole(user.role, authConfig.minimumAdminRole)
    ? null
    : NextResponse.json(
        { error: "Admin access required." },
        { status: 403 }
      );
}

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("books")
      .select(BOOK_FIELDS)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return NextResponse.json({
      books: data ?? [],
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load pre-booking titles.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const input = (await request.json()) as {
      bookId?: string;
      startsAt?: string;
      endsAt?: string;
      price?: number;
      professionalCourierCharge?: number;
      postalCharge?: number;
      offerPrice?: number | null;
      offerStartsAt?: string | null;
      offerEndsAt?: string | null;
      customizeEnabled?: boolean;
    };

    const startsAt = input.startsAt ? new Date(input.startsAt) : null;
    const endsAt = input.endsAt ? new Date(input.endsAt) : null;

    const price = Number(input.price);
    const professionalCourierCharge = Number(
      input.professionalCourierCharge ?? 0
    );
    const postalCharge = Number(input.postalCharge ?? 0);

    const hasOffer =
      input.offerPrice !== null &&
      input.offerPrice !== undefined;

    const offerPrice = hasOffer
      ? Number(input.offerPrice)
      : null;

    const offerStartsAt = input.offerStartsAt
      ? new Date(input.offerStartsAt)
      : null;

    const offerEndsAt = input.offerEndsAt
      ? new Date(input.offerEndsAt)
      : null;

    if (
      !input.bookId ||
      !startsAt ||
      !endsAt ||
      !Number.isFinite(startsAt.getTime()) ||
      !Number.isFinite(endsAt.getTime()) ||
      endsAt <= startsAt ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isFinite(professionalCourierCharge) ||
      professionalCourierCharge < 0 ||
      !Number.isFinite(postalCharge) ||
      postalCharge < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Choose a book, valid booking dates, and non-negative book and courier prices.",
        },
        { status: 400 }
      );
    }

    if (
      hasOffer &&
      (
        !Number.isFinite(offerPrice) ||
        offerPrice! < 0 ||
        offerPrice! >= price ||
        !offerStartsAt ||
        !offerEndsAt ||
        !Number.isFinite(offerStartsAt.getTime()) ||
        !Number.isFinite(offerEndsAt.getTime()) ||
        offerStartsAt < startsAt ||
        offerEndsAt > endsAt ||
        offerEndsAt <= offerStartsAt
      )
    ) {
      return NextResponse.json(
        {
          error:
            "The limited-time price must be lower than the pre-booking price and stay within the booking period.",
        },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("books")
      .update({
        prebooking_enabled: true,
        prebooking_customize_enabled:
          input.customizeEnabled === true,
        prebooking_start_at: startsAt.toISOString(),
        prebooking_end_at: endsAt.toISOString(),
        prebooking_price: price,
        prebooking_professional_courier_charge:
          professionalCourierCharge,
        prebooking_postal_charge: postalCharge,
        prebooking_offer_price: offerPrice,
        prebooking_offer_start_at: hasOffer
          ? offerStartsAt!.toISOString()
          : null,
        prebooking_offer_end_at: hasOffer
          ? offerEndsAt!.toISOString()
          : null,
        prebooking_ready_at: null,
      })
      .eq("id", input.bookId)
      .eq("status", "active")
      .select(BOOK_FIELDS)
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({
      book: data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to save pre-booking.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const input = (await request.json()) as {
      bookId?: string;
      action?: "ready" | "close" | "customize";
      ready?: boolean;
      customizeEnabled?: boolean;
    };

    if (
      !input.bookId ||
      !["ready", "close", "customize"].includes(
        input.action ?? ""
      )
    ) {
      return NextResponse.json(
        { error: "Choose a valid pre-booking action." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    let update:
      | {
          prebooking_enabled?: boolean;
          prebooking_ready_at?: string | null;
          prebooking_customize_enabled?: boolean;
        }
      = {};

    if (input.action === "close") {
      update = {
        prebooking_enabled: false,
      };
    }

    if (input.action === "ready") {
      update = {
        prebooking_ready_at:
          input.ready === false
            ? null
            : new Date().toISOString(),
      };
    }

    if (input.action === "customize") {
      update = {
        prebooking_customize_enabled:
          input.customizeEnabled === true,
      };
    }

    const { data, error } = await supabase
      .from("books")
      .update(update)
      .eq("id", input.bookId)
      .select(BOOK_FIELDS)
      .single();

    if (error) throw new Error(error.message);

    if (
      input.action === "ready" &&
      input.ready !== false
    ) {
      const { data: items, error: itemsError } =
        await supabase
          .from("order_items")
          .select("order_id")
          .eq("book_id", input.bookId)
          .eq("is_prebooking", true);

      if (itemsError) {
        throw new Error(itemsError.message);
      }

      const orderIds = [
        ...new Set(
          (items ?? []).map((item) => item.order_id)
        ),
      ];

      if (orderIds.length) {
        const { data: orders, error: ordersError } =
          await supabase
            .from("orders")
            .select(
              "customer_name, customer_email, prebooking_id, total_amount"
            )
            .in("id", orderIds)
            .eq("payment_status", "paid");

        if (ordersError) {
          throw new Error(ordersError.message);
        }

        const {
          sendPurchaseNotifications,
        } = await import(
          "@/features/orders/notifications/order-notification.server"
        );

        await Promise.all(
          (orders ?? [])
            .filter((order) => order.customer_email)
            .map((order) =>
              sendPurchaseNotifications({
                type: "prebooking-ready",
                name: order.customer_name,
                email: order.customer_email,
                reference:
                  order.prebooking_id ?? "pre-booking",
                amount: Number(order.total_amount),
              })
            )
        );
      }
    }

    return NextResponse.json({
      book: data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update pre-booking status.",
      },
      { status: 500 }
    );
  }
}
