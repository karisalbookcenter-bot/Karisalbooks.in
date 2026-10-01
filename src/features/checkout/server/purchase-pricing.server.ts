import { createAdminClient } from "@/lib/supabase/admin";

export interface BookPurchaseInput {
  flow: "books";
  items: { book_id: string; quantity: number }[];
  shippingMethod?: ShippingMethod;
  state?: string;
  discountCode?: string;
}

export type ShippingMethod = "India Post" | "Professional Courier";

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
  tier?: "standard" | "premium";
}

export const MEMBERSHIP_VALIDITY_DAYS = 350;
export const MEMBERSHIP_TAX_PERCENT = 8;
export const MEMBERSHIP_PLATFORM_FEE_PERCENT = 8;
export const MEMBER_COURIER_DISCOUNT_PERCENT = 30;

const MEMBER_DISCOUNT_PUBLISHERS = new Set([
  "kalasuvadu",
  "ethir veliyeedu",
  "ezhuthu prasuram",
  "zero degree",
]);

export function calculateMembershipCharge(planName: string, configuredPrice: number) {
  const baseAmount = planName.toLowerCase().includes("standard") ? 699 : configuredPrice;
  const basePaise = Math.round(baseAmount * 100);
  const taxPaise = Math.round((basePaise * MEMBERSHIP_TAX_PERCENT) / 100);
  const platformFeePaise = Math.round((basePaise * MEMBERSHIP_PLATFORM_FEE_PERCENT) / 100);
  const totalPaise = basePaise + taxPaise + platformFeePaise;

  return {
    baseAmount: basePaise / 100,
    taxAmount: taxPaise / 100,
    platformFee: platformFeePaise / 100,
    totalAmount: totalPaise / 100,
    totalPaise,
  };
}

function getCourierChargePaise(state: string) {
  const normalizedState = state.trim().toLowerCase().replace(/[.\s]+/g, " ");
  const tamilNaduOrPuducherry = [
    "tamil nadu",
    "tamilnadu",
    "puducherry",
    "pondicherry",
  ].includes(normalizedState);

  return tamilNaduOrPuducherry ? 6000 : 12000;
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
      .select("name, discount_percentage")
      .eq("id", membership.plan_id)
      .eq("status", "active")
      .maybeSingle();
    if (planError) throw new Error(planError.message);
    if (!plan) throw new Error("The membership plan is no longer active.");

    const tier = plan.name.toLowerCase().includes("premium") ? "premium" : "standard";
    return {
      code,
      kind: "membership",
      percentage: tier === "premium" ? 20 : 15,
      description: tier === "premium" ? "Premium member benefits" : "Standard member benefits",
      tier,
    };
  }

  const { data: offer, error: offerError } = await supabase
    .from("offers")
    .select("coupon_code, title, discount_percentage")
    .eq("coupon_code", code)
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

    const charge = calculateMembershipCharge(plan.name, Number(plan.price));
    const subtotalPaise = charge.baseAmount * 100;
    if (!Number.isSafeInteger(subtotalPaise) || subtotalPaise < 100) {
      throw new Error("The membership plan has an invalid price.");
    }

    return {
      flow: input.flow,
      subtotalPaise,
      discountPaise: 0,
      bookDiscountPaise: 0,
      courierChargePaise: 0,
      courierDiscountPaise: 0,
      totalPaise: charge.totalPaise,
      discount: null,
      plan: {
        id: plan.id,
        name: plan.name,
        price: charge.baseAmount,
        taxAmount: charge.taxAmount,
        platformFee: charge.platformFee,
        totalAmount: charge.totalAmount,
        validityDays: MEMBERSHIP_VALIDITY_DAYS,
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
    .select("id, title, price, stock_quantity, status, publisher_id")
    .in("id", [...requested.keys()]);
  if (error) throw new Error(error.message);
  if (!books || books.length !== requested.size) throw new Error("One or more books are unavailable.");

  const publisherIds = [...new Set(books.map((book) => book.publisher_id).filter((id): id is string => Boolean(id)))];
  const { data: publishers, error: publisherError } = publisherIds.length
    ? await supabase.from("publishers").select("id, name").in("id", publisherIds)
    : { data: [], error: null };
  if (publisherError) throw new Error(publisherError.message);
  const publisherNameById = new Map((publishers ?? []).map((publisher) => [publisher.id, publisher.name]));

  const items = books.map((book) => {
    const quantity = requested.get(book.id) ?? 0;
    const price = Number(book.price);
    if (book.status !== "active" || book.stock_quantity < quantity || !Number.isFinite(price) || price < 0) {
      throw new Error(`${book.title} is unavailable in the requested quantity.`);
    }
    return {
      book_id: book.id as string,
      title: book.title as string,
      price,
      quantity,
      publisherName: book.publisher_id ? publisherNameById.get(book.publisher_id) ?? "" : "",
    };
  });

  const shippingMethod = input.shippingMethod ?? "India Post";
  const deliveryState = input.state?.trim();
  if (!deliveryState) throw new Error("Select your delivery state.");
  if (shippingMethod !== "India Post" && shippingMethod !== "Professional Courier") {
    throw new Error("Choose a valid shipping method.");
  }
  const subtotalPaise = items.reduce(
    (sum, item) => sum + Math.round(item.price * 100) * item.quantity,
    0
  );
  const discount = input.discountCode ? await resolveDiscountCode(input.discountCode) : null;
  const courierChargePaise = getCourierChargePaise(deliveryState);
  const qualifyingItems = items.filter((item) => {
    const publisherName = item.publisherName.trim().toLowerCase();
    return [...MEMBER_DISCOUNT_PUBLISHERS].some((allowedName) =>
      publisherName.includes(allowedName)
    );
  });
  const qualifyingSubtotalPaise = qualifyingItems.reduce(
    (sum, item) => sum + Math.round(item.price * 100) * item.quantity,
    0
  );

  let bookDiscountPaise = 0;
  let courierDiscountPaise = 0;
  if (discount?.kind === "coupon") {
    bookDiscountPaise = Math.round((subtotalPaise * discount.percentage) / 100);
  } else if (discount?.tier === "premium") {
    bookDiscountPaise = Math.round((qualifyingSubtotalPaise * 20) / 100);
    courierDiscountPaise = Math.round((courierChargePaise * MEMBER_COURIER_DISCOUNT_PERCENT) / 100);
  } else if (discount?.tier === "standard") {
    if (qualifyingItems.length > 0 || subtotalPaise >= 70000) {
      bookDiscountPaise = Math.round((subtotalPaise * 15) / 100);
    }
    courierDiscountPaise = Math.round((courierChargePaise * MEMBER_COURIER_DISCOUNT_PERCENT) / 100);
  }

  const discountPaise = bookDiscountPaise + courierDiscountPaise;
  const totalPaise = subtotalPaise - bookDiscountPaise + courierChargePaise - courierDiscountPaise;

  if (!Number.isSafeInteger(totalPaise) || totalPaise < 100) {
    throw new Error("The checkout total is below the minimum payment amount.");
  }

  return {
    flow: input.flow,
    subtotalPaise,
    discountPaise,
    bookDiscountPaise,
    courierChargePaise,
    courierDiscountPaise,
    shippingMethod,
    deliveryState,
    totalPaise,
    discount,
    plan: null,
    items,
  };
}