```typescript
import { createAdminClient } from "@/lib/supabase/admin";
import {
  calculatePercentageDiscountPaise,
  GENERAL_BOOK_DISCOUNT_PERCENT,
  isBookDiscountEligible,
} from "@/lib/helpers/book-pricing.helpers";
import { normalizeIndianMobileNumber } from "@/lib/helpers/phone.helpers";

export interface BookPurchaseInput {
  flow: "books";
  items: { book_id: string; quantity: number }[];
  shippingMethod?: ShippingMethod;
  state?: string;
  totalWeightKg?: number;
  discountCode?: string;
  customerMobile?: string;
}

export interface PrebookingPurchaseInput {
  flow: "prebooking";
  items: { book_id: string; quantity: number }[];
  shippingMethod?: ShippingMethod;
  state?: string;
  totalWeightKg?: number;
}

export type ShippingMethod =
  | "India Post"
  | "Professional Courier"
  | "Transport";

export interface MembershipPurchaseInput {
  flow: "membership";
  planId: string;
}

export type PurchaseInput =
  | BookPurchaseInput
  | PrebookingPurchaseInput
  | MembershipPurchaseInput;

export interface ResolvedDiscount {
  code?: string;
  kind: "membership" | "coupon" | "phone";
  percentage: number;
  description: string;
  tier?: "standard" | "premium";
}

export const MEMBERSHIP_VALIDITY_DAYS = 350;
export const MEMBERSHIP_TAX_PERCENT = 8;
export const MEMBERSHIP_PLATFORM_FEE_PERCENT = 8;
export const MEMBER_COURIER_DISCOUNT_PERCENT = 30;

function isMissingPrebookingSchema(error: {
  code?: string;
  message?: string;
}) {
  return (
    error.code === "42703" &&
    Boolean(error.message?.includes("prebooking_"))
  );
}

interface PricingBookRow {
  id: string;
  category_id: string;
  title: string;
  price: number;
  stock_quantity: number;
  status: string;
  publisher_id: string | null;
  prebooking_enabled?: boolean | null;
  prebooking_start_at?: string | null;
  prebooking_end_at?: string | null;
  prebooking_price?: number | null;
  prebooking_offer_price?: number | null;
  prebooking_offer_start_at?: string | null;
  prebooking_offer_end_at?: string | null;
  prebooking_professional_courier_charge?: number | null;
  prebooking_postal_charge?: number | null;
}

const MEMBER_DISCOUNT_PUBLISHERS = new Set([
  "kalasuvadu",
  "ethir veliyeedu",
  "ezhuthu prasuram",
  "zero degree",
]);

export function calculateMembershipCharge(
  planName: string,
  configuredPrice: number
) {
  const baseAmount = planName.toLowerCase().includes("standard")
    ? 699
    : configuredPrice;

  const basePaise = Math.round(baseAmount * 100);
  const taxPaise = Math.round(
    (basePaise * MEMBERSHIP_TAX_PERCENT) / 100
  );
  const platformFeePaise = Math.round(
    (basePaise * MEMBERSHIP_PLATFORM_FEE_PERCENT) / 100
  );
  const totalPaise =
    basePaise + taxPaise + platformFeePaise;

  return {
    baseAmount: basePaise / 100,
    taxAmount: taxPaise / 100,
    platformFee: platformFeePaise / 100,
    totalAmount: totalPaise / 100,
    totalPaise,
  };
}

function getCourierChargePaise(state: string) {
  const normalizedState = state
    .trim()
    .toLowerCase()
    .replace(/[.\s]+/g, " ");

  const tamilNaduOrPuducherry = [
    "tamil nadu",
    "tamilnadu",
    "puducherry",
    "pondicherry",
  ].includes(normalizedState);

  return tamilNaduOrPuducherry ? 6000 : 12000;
}

interface TransportRule {
  states: string[];
  chargePaise: number;
  maxWeightKg: number;
}

const TRANSPORT_RULES: TransportRule[] = [
  {
    states: [
      "tamil nadu",
      "tamilnadu",
      "pondicherry",
      "puducherry",
    ],
    chargePaise: 30000,
    maxWeightKg: 25,
  },
  {
    states: [
      "karnataka",
    ],
    chargePaise: 40000,
    maxWeightKg: 25,
  },
];

function getTransportChargePaise(
  state: string,
  weightKg: number
) {
  const normalized = state
    .trim()
    .toLowerCase()
    .replace(/[.\s]+/g, " ");

  const rule = TRANSPORT_RULES.find((item) =>
    item.states.includes(normalized)
  );

  if (!rule) {
    throw new Error(
      "Transport is not available for this state."
    );
  }

  if (weightKg > rule.maxWeightKg) {
    throw new Error(
      "Transport shipping is available only up to 25kg."
    );
  }

  return rule.chargePaise;
}

export async function resolveDiscountCode(
  rawCode: string
): Promise<ResolvedDiscount | null> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return null;

  const supabase = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: membership, error: membershipError } =
    await supabase
      .from("memberships")
      .select(
        "membership_id, plan_id, payment_status, start_date, expiry_date, status"
      )
      .eq("membership_id", code)
      .maybeSingle();

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  if (membership) {
    const valid =
      membership.status === "active" &&
      membership.payment_status === "paid" &&
      membership.start_date <= today &&
      membership.expiry_date >= today;

    if (!valid) {
      throw new Error(
        "This membership is not currently active."
      );
    }

    const { data: plan, error: planError } =
      await supabase
        .from("membership_plans")
        .select("name, discount_percentage")
        .eq("id", membership.plan_id)
        .eq("status", "active")
        .maybeSingle();

    if (planError) {
      throw new Error(planError.message);
    }

    if (!plan) {
      throw new Error(
        "The membership plan is no longer active."
      );
    }

    const tier = plan.name
      .toLowerCase()
      .includes("premium")
      ? "premium"
      : "standard";

    return {
      code,
      kind: "membership",
      percentage: tier === "premium" ? 20 : 15,
      description:
        tier === "premium"
          ? "Premium member benefits"
          : "Standard member benefits",
      tier,
    };
  }

  const { data: offer, error: offerError } =
    await supabase
      .from("offers")
      .select(
        "coupon_code, title, discount_percentage"
      )
      .eq("coupon_code", code)
      .eq("status", "active")
      .lte("start_date", today)
      .gte("end_date", today)
      .maybeSingle();

  if (offerError) {
    throw new Error(offerError.message);
  }

  if (!offer) {
    throw new Error(
      "That membership number or coupon code is invalid or expired."
    );
  }

  return {
    code,
    kind: "coupon",
    percentage: Number(offer.discount_percentage),
    description: offer.title,
  };
}

async function resolvePhoneDiscount(
  rawMobile: string | undefined
): Promise<ResolvedDiscount | null> {
  const mobile = rawMobile
    ? normalizeIndianMobileNumber(rawMobile)
    : null;

  if (!mobile) return null;

  const supabase = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: phoneEntries, error: phoneError } =
    await supabase
      .from("offer_phone_discount_numbers")
      .select("offer_id")
      .eq("mobile_number", mobile);

  if (phoneError) {
    throw new Error(phoneError.message);
  }

  const offerIds = [
    ...new Set(
      (phoneEntries ?? []).map(
        (entry) => entry.offer_id
      )
    ),
  ];

  if (!offerIds.length) return null;

  const { data: offers, error } = await supabase
    .from("offers")
    .select("title, discount_percentage")
    .eq("phone_discount_enabled", true)
    .eq("status", "active")
    .in("id", offerIds)
    .lte("start_date", today)
    .gte("end_date", today);

  if (error) {
    throw new Error(error.message);
  }

  const offer = (offers ?? []).sort(
    (left, right) =>
      Number(right.discount_percentage) -
      Number(left.discount_percentage)
  )[0];

  if (!offer) return null;

  return {
    kind: "phone",
    percentage: Number(
      offer.discount_percentage
    ),
    description: offer.title,
  };
}

export async function pricePurchase(
  input: PurchaseInput
) {
  const supabase = createAdminClient();

  if (input.flow === "membership") {
    if (!input.planId) {
      throw new Error("Choose a membership plan.");
    }

    const { data: plan, error } = await supabase
      .from("membership_plans")
      .select(
        "id, name, price, validity_days, status"
      )
      .eq("id", input.planId)
      .eq("status", "active")
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!plan) {
      throw new Error(
        "This membership plan is unavailable."
      );
    }

    const charge = calculateMembershipCharge(
      plan.name,
      Number(plan.price)
    );

    const subtotalPaise =
      charge.baseAmount * 100;

    if (
      !Number.isSafeInteger(subtotalPaise) ||
      subtotalPaise < 100
    ) {
      throw new Error(
        "The membership plan has an invalid price."
      );
    }

    return {
      flow: input.flow,
      subtotalPaise,
      discountPaise: 0,
      bookDiscountPaise: 0,
      courierChargePaise: 0,
      courierDiscountPaise: 0,
      indiaPostCourierChargePaise: 0,
      professionalCourierChargePaise: 0,
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

  if (
    !Array.isArray(input.items) ||
    input.items.length === 0 ||
    input.items.length > 50
  ) {
    throw new Error(
      "Your cart is empty or contains too many items."
    );
  }

  const requested = new Map<string, number>();

  for (const item of input.items) {
    if (
      typeof item.book_id !== "string" ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 99
    ) {
      throw new Error(
        "The cart contains an invalid item quantity."
      );
    }

    requested.set(
      item.book_id,
      (requested.get(item.book_id) ?? 0) +
        item.quantity
    );
  }

  const booksResult = await supabase
    .from("books")
    .select(
      "id, category_id, title, price, stock_quantity, status, publisher_id, prebooking_enabled, prebooking_start_at, prebooking_end_at, prebooking_price, prebooking_offer_price, prebooking_offer_start_at, prebooking_offer_end_at, prebooking_professional_courier_charge, prebooking_postal_charge"
    )
    .in("id", [...requested.keys()]);

  let books: PricingBookRow[] | null =
    booksResult.data as PricingBookRow[] | null;

  let booksError = booksResult.error;

  if (
    input.flow === "books" &&
    booksResult.error &&
    isMissingPrebookingSchema(booksResult.error)
  ) {
    const legacyResult = await supabase
      .from("books")
      .select(
        "id, category_id, title, price, stock_quantity, status, publisher_id"
      )
      .in("id", [...requested.keys()]);

    books =
      legacyResult.data as PricingBookRow[] | null;

    booksError = legacyResult.error;
  }

  if (booksError) {
    throw new Error(booksError.message);
  }

  if (
    !books ||
    books.length !== requested.size
  ) {
    throw new Error(
      "One or more books are unavailable."
    );
  }

  const categoryIds = [
    ...new Set(
      books.map((book) => book.category_id)
    ),
  ];

  const { data: categories, error: categoryError } =
    await supabase
      .from("categories")
      .select("id, name")
      .in("id", categoryIds);

  if (categoryError) {
    throw new Error(categoryError.message);
  }

  const discountEligibleCategoryIds = new Set(
    (categories ?? [])
      .filter((category) =>
        isBookDiscountEligible(category.name)
      )
      .map((category) => category.id)
  );

  const publisherIds = [
    ...new Set(
      books
        .map((book) => book.publisher_id)
        .filter(
          (id): id is string => Boolean(id)
        )
    ),
  ];

  const {
    data: publishers,
    error: publisherError,
  } = publisherIds.length
    ? await supabase
        .from("publishers")
        .select("id, name")
        .in("id", publisherIds)
    : { data: [], error: null };

  if (publisherError) {
    throw new Error(publisherError.message);
  }

  const publisherNameById = new Map(
    (publishers ?? []).map((publisher) => [
      publisher.id,
      publisher.name,
    ])
  );

  const items = books.map((book) => {
    const quantity =
      requested.get(book.id) ?? 0;

    const now = Date.now();

    const bookingStart =
      book.prebooking_start_at
        ? new Date(
            book.prebooking_start_at
          ).getTime()
        : 0;

    const bookingEnd =
      book.prebooking_end_at
        ? new Date(
            book.prebooking_end_at
          ).getTime()
        : 0;

    const offerStart =
      book.prebooking_offer_start_at
        ? new Date(
            book.prebooking_offer_start_at
          ).getTime()
        : 0;

    const offerEnd =
      book.prebooking_offer_end_at
        ? new Date(
            book.prebooking_offer_end_at
          ).getTime()
        : 0;

    const bookingOpen =
      Boolean(book.prebooking_enabled) &&
      bookingStart <= now &&
      bookingEnd >= now;

    const offerOpen =
      book.prebooking_offer_price !== null &&
      book.prebooking_offer_price !==
        undefined &&
      offerStart <= now &&
      offerEnd >= now;

    if (
      input.flow === "prebooking" &&
      !bookingOpen
    ) {
      throw new Error(
        `${book.title} is outside its pre-booking period.`
      );
    }

    if (
      input.flow === "books" &&
      Boolean(book.prebooking_enabled) &&
      bookingEnd > now
    ) {
      throw new Error(
        `${book.title} is currently available for pre-booking only.`
      );
    }

    const price =
      input.flow === "prebooking"
        ? Number(
            offerOpen
              ? book.prebooking_offer_price
              : book.prebooking_price
          )
        : Number(book.price);

    if (
      book.status !== "active" ||
      (input.flow === "books" &&
        book.stock_quantity < quantity) ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      throw new Error(
        `${book.title} is unavailable in the requested quantity.`
      );
    }

    const professionalCourierCharge =
      Number(
        book.prebooking_professional_courier_charge ??
          0
      );

    const postalCharge = Number(
      book.prebooking_postal_charge ?? 0
    );

    if (
      input.flow === "prebooking" &&
      (!Number.isFinite(
        professionalCourierCharge
      ) ||
        professionalCourierCharge < 0 ||
        !Number.isFinite(postalCharge) ||
        postalCharge < 0)
    ) {
      throw new Error(
        `${book.title} has invalid pre-booking delivery charges.`
      );
    }

    return {
      book_id: book.id as string,
      title: book.title as string,
      price,
      quantity,
      professionalCourierCharge,
      postalCharge,
      publisherName: book.publisher_id
        ? publisherNameById.get(
            book.publisher_id
          ) ?? ""
        : "",
      discountEligible:
        discountEligibleCategoryIds.has(
          book.category_id
        ),
    };
  });

  const shippingMethod =
    input.shippingMethod ?? "India Post";

  const deliveryState = input.state?.trim();

  if (!deliveryState) {
    throw new Error(
      "Select your delivery state."
    );
  }

  if (
    shippingMethod !== "India Post" &&
    shippingMethod !== "Professional Courier" &&
    shippingMethod !== "Transport"
  ) {
    throw new Error(
      "Choose a valid shipping method."
    );
  }

  const subtotalPaise = items.reduce(
    (sum, item) =>
      sum +
      Math.round(item.price * 100) *
        item.quantity,
    0
  );

  const discountEligibleItems =
    input.flow === "books"
      ? items.filter(
          (item) => item.discountEligible
        )
      : [];

  const discountEligibleSubtotalPaise =
    discountEligibleItems.reduce(
      (sum, item) =>
        sum +
        Math.round(item.price * 100) *
          item.quantity,
      0
    );

  const discount =
    input.flow !== "books" ||
    discountEligibleItems.length === 0
      ? null
      : input.discountCode
      ? await resolveDiscountCode(
          input.discountCode
        )
      : await resolvePhoneDiscount(
          input.customerMobile
        );

  const indiaPostCourierChargePaise =
    input.flow === "prebooking"
      ? items.reduce(
          (sum, item) =>
            sum +
            Math.round(
              item.postalCharge * 100
            ) *
              item.quantity,
          0
        )
      : getCourierChargePaise(
          deliveryState
        );

  const professionalCourierChargePaise =
    input.flow === "prebooking"
      ? items.reduce(
          (sum, item) =>
            sum +
            Math.round(
              item.professionalCourierCharge *
                100
            ) *
              item.quantity,
          0
        )
      : getCourierChargePaise(
          deliveryState
        );

  let courierChargePaise: number;

  if (shippingMethod === "India Post") {
    courierChargePaise =
      indiaPostCourierChargePaise;
  } else if (
    shippingMethod === "Professional Courier"
  ) {
    courierChargePaise =
      professionalCourierChargePaise;
  } else {
    if (
      input.totalWeightKg === undefined ||
      !Number.isFinite(input.totalWeightKg) ||
      input.totalWeightKg <= 0
    ) {
      throw new Error(
        "Weight required for Transport shipping."
      );
    }

    courierChargePaise =
      getTransportChargePaise(
        deliveryState,
        input.totalWeightKg
      );
  }

  const qualifyingItems =
    discountEligibleItems.filter((item) => {
      const publisherName =
        item.publisherName
          .trim()
          .toLowerCase();

      return [
        ...MEMBER_DISCOUNT_PUBLISHERS,
      ].some((allowedName) =>
        publisherName.includes(allowedName)
      );
    });

  const qualifyingSubtotalPaise =
    qualifyingItems.reduce(
      (sum, item) =>
        sum +
        Math.round(item.price * 100) *
          item.quantity,
      0
    );

  const automaticBookDiscountPaise =
    discountEligibleItems.reduce(
      (sum, item) =>
        sum +
        calculatePercentageDiscountPaise(
          Math.round(item.price * 100),
          GENERAL_BOOK_DISCOUNT_PERCENT
        ) *
          item.quantity,
      0
    );

  let bookDiscountPaise =
    automaticBookDiscountPaise;

  let courierDiscountPaise = 0;

  if (
    input.flow === "books" &&
    discount?.kind === "coupon"
  ) {
    bookDiscountPaise +=
      calculatePercentageDiscountPaise(
        discountEligibleSubtotalPaise,
        discount.percentage
      );
  } else if (
    input.flow === "books" &&
    discount?.kind === "phone"
  ) {
    bookDiscountPaise +=
      calculatePercentageDiscountPaise(
        discountEligibleSubtotalPaise,
        discount.percentage
      );
  } else if (
    input.flow === "books" &&
    discount?.tier === "premium"
  ) {
    bookDiscountPaise +=
      calculatePercentageDiscountPaise(
        qualifyingSubtotalPaise,
        20
      );

    courierDiscountPaise = Math.round(
      (courierChargePaise *
        MEMBER_COURIER_DISCOUNT_PERCENT) /
        100
    );
  } else if (
    input.flow === "books" &&
    discount?.tier === "standard"
  ) {
    if (
      qualifyingItems.length > 0 ||
      discountEligibleSubtotalPaise >= 70000
    ) {
      bookDiscountPaise +=
        calculatePercentageDiscountPaise(
          discountEligibleSubtotalPaise,
          15
        );
    }

    courierDiscountPaise = Math.round(
      (courierChargePaise *
        MEMBER_COURIER_DISCOUNT_PERCENT) /
        100
    );
  }

  bookDiscountPaise = Math.min(
    bookDiscountPaise,
    subtotalPaise
  );

  const discountPaise =
    bookDiscountPaise +
    courierDiscountPaise;

  const totalPaise =
    subtotalPaise -
    bookDiscountPaise +
    courierChargePaise -
    courierDiscountPaise;

  if (
    !Number.isSafeInteger(totalPaise) ||
    totalPaise < 100
  ) {
    throw new Error(
      "The checkout total is below the minimum payment amount."
    );
  }

  return {
    flow: input.flow,
    subtotalPaise,
    discountPaise,
    bookDiscountPaise,
    automaticBookDiscountPaise,
    courierChargePaise,
    courierDiscountPaise,
    indiaPostCourierChargePaise,
    professionalCourierChargePaise,
    shippingMethod,
    deliveryState,
    totalPaise,
    discount,
    plan: null,
    items,
  };
}
```
