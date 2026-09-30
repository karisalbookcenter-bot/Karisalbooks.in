import { createAdminClient } from "@/lib/supabase/admin";

export interface BookPurchaseInput {
  flow: "books";
  items: { book_id: string; quantity: number }[];
  discountCode?: string;
}

export interface MembershipPurchaseInput {
  flow: "membership";
  planId: string;
}

export type PurchaseInput = BookPurchaseInput | MembershipPurchaseInput;

export interface ResolvedDiscount {
  code: string;
  kind: "membership" | "coupon";
  percentage: number;
  description: string;
}

export async function resolveDiscountCode(rawCode: string): Promise<ResolvedDiscount | null> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return null;

  const supabase = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data: membership, error: membershipError } = await supabase
    .from("memberships")
    .select("membership_id, plan_id, payment_status, start_date, expiry_date, status")
    .eq("membership_id", code)
    .maybeSingle();

  if (membershipError) throw new Error(membershipError.message);

  if (membership) {
    const valid = membership.status === "active" &&
      membership.payment_status === "paid" &&
      membership.start_date <= today &&
      membership.expiry_date >= today;
    if (!valid) throw new Error("This membership is not currently active.");

    const { data: plan, error: planError } = await supabase
      .from("membership_plans")
      .select("discount_percentage")
      .eq("id", membership.plan_id)
      .eq("status", "active")
      .maybeSingle();
    if (planError) throw new Error(planError.message);
    if (!plan) throw new Error("The membership plan is no longer active.");

    return {
      code,
      kind: "membership",
      percentage: Number(plan.discount_percentage),
      description: "Membership discount",
    };
  }

  const { data: offer, error: offerError } = await supabase
    .from("offers")
    .select("coupon_code, title, discount_percentage")
    .ilike("coupon_code", code)
    .eq("status", "active")
    .lte("start_date", today)
    .gte("end_date", today)
    .maybeSingle();

  if (offerError) throw new Error(offerError.message);
  if (!offer) throw new Error("That membership number or coupon code is invalid or expired.");

  return {
    code,
    kind: "coupon",
    percentage: Number(offer.discount_percentage),
    description: offer.title,
  };
}

export async function pricePurchase(input: PurchaseInput) {
  const supabase = createAdminClient();

  if (input.flow === "membership") {
    if (!input.planId) throw new Error("Choose a membership plan.");
    const { data: plan, error } = await supabase
      .from("membership_plans")
      .select("id, name, price, validity_days, status")
      .eq("id", input.planId)
      .eq("status", "active")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!plan) throw new Error("This membership plan is unavailable.");

    const subtotalPaise = Math.round(Number(plan.price) * 100);
    if (!Number.isSafeInteger(subtotalPaise) || subtotalPaise < 100) {
      throw new Error("The membership plan has an invalid price.");
    }

    return {
      flow: input.flow,
      subtotalPaise,
      discountPaise: 0,
      totalPaise: subtotalPaise,
      discount: null,
      plan: {
        id: plan.id,
        name: plan.name,
        price: Number(plan.price),
        validityDays: Number(plan.validity_days),
      },
      items: [],
    };
  }

  if (!Array.isArray(input.items) || input.items.length === 0 || input.items.length > 50) {
    throw new Error("Your cart is empty or contains too many items.");
  }

  const requested = new Map<string, number>();
  for (const item of input.items) {
    if (
      typeof item.book_id !== "string" ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 99
    ) {
      throw new Error("The cart contains an invalid item quantity.");
    }
    requested.set(item.book_id, (requested.get(item.book_id) ?? 0) + item.quantity);
  }

  const { data: books, error } = await supabase
    .from("books")
    .select("id, title, price, stock_quantity, status")
    .in("id", [...requested.keys()]);
  if (error) throw new Error(error.message);
  if (!books || books.length !== requested.size) throw new Error("One or more books are unavailable.");

  const items = books.map((book) => {
    const quantity = requested.get(book.id) ?? 0;
    const price = Number(book.price);
    if (book.status !== "active" || book.stock_quantity < quantity || !Number.isFinite(price) || price < 0) {
      throw new Error(`${book.title} is unavailable in the requested quantity.`);
    }
    return { book_id: book.id as string, title: book.title as string, price, quantity };
  });

  const subtotalPaise = items.reduce(
    (sum, item) => sum + Math.round(item.price * 100) * item.quantity,
    0
  );
  const discount = input.discountCode ? await resolveDiscountCode(input.discountCode) : null;
  const discountPaise = discount ? Math.round((subtotalPaise * discount.percentage) / 100) : 0;
  const totalPaise = subtotalPaise - discountPaise;

  if (!Number.isSafeInteger(totalPaise) || totalPaise < 100) {
    throw new Error("The checkout total is below the minimum payment amount.");
  }

  return {
    flow: input.flow,
    subtotalPaise,
    discountPaise,
    totalPaise,
    discount,
    plan: null,
    items,
  };
}