import { createAdminClient } from "@/lib/supabase/admin";
import {
  calculatePercentageDiscountPaise,
  GENERAL_BOOK_DISCOUNT_PERCENT,
  isBookDiscountEligible,
} from "@/lib/helpers/book-pricing.helpers";

export interface BookPurchaseInput {
  flow: "books";
  items: { book_id: string; quantity: number }[];
  shippingMethod?: ShippingMethod;
  state?: string;
  discountCode?: string;
}

export interface PrebookingPurchaseInput {
  flow: "prebooking";
  items: { book_id: string; quantity: number }[];
  shippingMethod?: ShippingMethod;
  state?: string;
}

export interface CustomizePurchaseInput {
  flow: "customize";
  items: {
    book_id: string;
    quantity: number;
    customizationDetails: string;
  }[];
  shippingMethod?: ShippingMethod;
  state?: string;
}

export type ShippingMethod =
  | "India Post"
  | "Professional Courier";

export interface MembershipPurchaseInput {
  flow: "membership";
  planId: string;
}

export type PurchaseInput =
  | BookPurchaseInput
  | PrebookingPurchaseInput
  | CustomizePurchaseInput
  | MembershipPurchaseInput;

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

export const CUSTOMIZE_MINIMUM_QUANTITY = 200;

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

  prebooking_customize_enabled?: boolean | null;
  customize_price?: number | null;
}

const MEMBER_DISCOUNT_PUBLISHERS = new Set([
  "kalasuvadu",
  "ethir veliyeedu",
  "ezhuthu prasuram",
  "zero degree",
]);

export function calculateMembershipCharge(
  planName: string,
  configuredPrice: number,
) {
  const baseAmount = planName
    .toLowerCase()
    .includes("standard")
    ? 699
    : configuredPrice;

  const basePaise = Math.round(baseAmount * 100);
  const taxPaise = Math.round(
    (basePaise * MEMBERSHIP_TAX_PERCENT) / 100,
  );
  const platformFeePaise = Math.round(
    (basePaise * MEMBERSHIP_PLATFORM_FEE_PERCENT) / 100,
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

export async function resolveDiscountCode(
  rawCode: string,
): Promise<ResolvedDiscount | null> {
  const code = rawCode.trim().toUpperCase();

  if (!code) return null;

  const supabase = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: membership, error: membershipError } =
    await supabase
      .from("memberships")
      .select(
        "membership_id, plan_id, payment_status, start_date, expiry_date, status",
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
        "This membership is not currently active.",
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
        "The membership plan is no longer active.",
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
      .select("coupon_code, title, discount_percentage")
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
      "That membership number or coupon code is invalid or expired.",
    );
  }

  return {
    code,
    kind: "coupon",
    percentage: Number(offer.discount_percentage),
    description: offer.title,
  };
}

export async function pricePurchase(input: PurchaseInput) {
  const supabase = createAdminClient();

  /*
   * Membership pricing
   */
  if (input.flow === "membership") {
    if (!input.planId) {
      throw new Error("Choose a membership plan.");
    }

    const { data: plan, error } = await supabase
      .from("membership_plans")
      .select(
        "id, name, price, validity_days, status",
      )
      .eq("id", input.planId)
      .eq("status", "active")
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!plan) {
      throw new Error(
        "This membership plan is unavailable.",
      );
    }

    const charge = calculateMembershipCharge(
      plan.name,
      Number(plan.price),
    );

    const subtotalPaise = charge.baseAmount * 100;

    if (
      !Number.isSafeInteger(subtotalPaise) ||
      subtotalPaise < 100
    ) {
      throw new Error(
        "The membership plan has an invalid price.",
      );
    }

    return {
      flow: input.flow,
      subtotalPaise,
      discountPaise: 0,
      bookDiscountPaise: 0,
      automaticBookDiscountPaise: 0,
      courierChargePaise: 0,
      courierDiscountPaise: 0,
      indiaPostCourierChargePaise: 0,
      professionalCourierChargePaise: 0,
      totalPaise: charge.totalPaise,
      discount: null,
      shippingMethod: undefined,
      deliveryState: undefined,
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

  /*
   * Cart validation
   */
  if (
    !Array.isArray(input.items) ||
    input.items.length === 0 ||
    input.items.length > 50
  ) {
    throw new Error(
      "Your cart is empty or contains too many items.",
    );
  }

  const requested = new Map<string, number>();

  for (const item of input.items) {
    const isCustomize = input.flow === "customize";

    const validQuantity =
      typeof item.quantity === "number" &&
      Number.isInteger(item.quantity) &&
      item.quantity >= (isCustomize ? CUSTOMIZE_MINIMUM_QUANTITY : 1) &&
      item.quantity <= (isCustomize ? 10000 : 99);

    if (
      typeof item.book_id !== "string" ||
      !validQuantity
    ) {
      throw new Error(
        isCustomize
          ? `Customize orders require at least ${CUSTOMIZE_MINIMUM_QUANTITY} copies for each title.`
          : "The cart contains an invalid item quantity.",
      );
    }

    requested.set(
      item.book_id,
      (requested.get(item.book_id) ?? 0) +
        item.quantity,
    );
  }

  /*
   * Customize-specific validation
   *
   * Each title must independently satisfy the 200-copy
   * minimum. Different titles are never combined to satisfy
   * the minimum.
   */
  if (input.flow === "customize") {
    for (const item of input.items) {
      if (
        !Number.isInteger(item.quantity) ||
        item.quantity < CUSTOMIZE_MINIMUM_QUANTITY
      ) {
        throw new Error(
          `Customize requires a minimum of ${CUSTOMIZE_MINIMUM_QUANTITY} copies for each title.`,
        );
      }

      if (
        typeof item.customizationDetails !== "string" ||
        !item.customizationDetails.trim()
      ) {
        throw new Error(
          "Function / event details are required for Customize orders.",
        );
      }

      if (item.customizationDetails.trim().length > 5000) {
        throw new Error(
          "Function / event details are too long.",
        );
      }
    }
  }

  /*
   * Load books.
   *
   * Customize price and eligibility are read directly from
   * the database. Customer-supplied prices are never trusted.
   */
  const booksResult = await supabase
    .from("books")
    .select(
      [
        "id",
        "category_id",
        "title",
        "price",
        "stock_quantity",
        "status",
        "publisher_id",
        "prebooking_enabled",
        "prebooking_start_at",
        "prebooking_end_at",
        "prebooking_price",
        "prebooking_offer_price",
        "prebooking_offer_start_at",
        "prebooking_offer_end_at",
        "prebooking_professional_courier_charge",
        "prebooking_postal_charge",
        "prebooking_customize_enabled",
        "customize_price",
      ].join(", "),
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
        "id, category_id, title, price, stock_quantity, status, publisher_id",
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
      "One or more books are unavailable.",
    );
  }

  /*
   * Categories
   */
  const categoryIds = [
    ...new Set(
      books.map((book) => book.category_id),
    ),
  ];

  const {
    data: categories,
    error: categoryError,
  } = await supabase
    .from("categories")
    .select("id, name")
    .in("id", categoryIds);

  if (categoryError) {
    throw new Error(categoryError.message);
  }

  const discountEligibleCategoryIds = new Set(
    (categories ?? [])
      .filter((category) =>
        isBookDiscountEligible(category.name),
      )
      .map((category) => category.id),
  );

  /*
   * Publishers
   */
  const publisherIds = [
    ...new Set(
      books
        .map((book) => book.publisher_id)
        .filter(
          (id): id is string => Boolean(id),
        ),
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
    ]),
  );

  /*
   * Resolve each cart item from the database.
   */
  const items = books.map((book) => {
    const quantity =
      requested.get(book.id) ?? 0;

    /*
     * CUSTOMIZE
     */
    if (input.flow === "customize") {
      if (book.status !== "active") {
        throw new Error(
          `${book.title} is unavailable.`,
        );
      }

      if (
        book.prebooking_customize_enabled !== true
      ) {
        throw new Error(
          `${book.title} is not currently available for Customize.`,
        );
      }

      const customizePrice =
        Number(book.customize_price);

      if (
        book.customize_price === null ||
        book.customize_price === undefined ||
        !Number.isFinite(customizePrice) ||
        customizePrice < 0
      ) {
        throw new Error(
          `${book.title} does not have a valid Customize price.`,
        );
      }

      const customizeItem =
        input.items.find(
          (item) => item.book_id === book.id,
        );

      const customizationDetails =
        customizeItem?.customizationDetails
          ?.trim() ?? "";

      if (!customizationDetails) {
        throw new Error(
          `Function / event details are required for ${book.title}.`,
        );
      }

      if (
        quantity < CUSTOMIZE_MINIMUM_QUANTITY
      ) {
        throw new Error(
          `${book.title} requires a minimum of ${CUSTOMIZE_MINIMUM_QUANTITY} copies.`,
        );
      }

      return {
        book_id: book.id,
        title: book.title,
        price: customizePrice,
        quantity,
        professionalCourierCharge: 0,
        postalCharge: 0,
        publisherName: book.publisher_id
          ? publisherNameById.get(
              book.publisher_id,
            ) ?? ""
          : "",
        discountEligible: false,
        customizationDetails,
      };
    }

    /*
     * PRE-BOOKING / REGULAR BOOKS
     */
    const quantityForBook = quantity;

    const now = Date.now();

    const bookingStart =
      book.prebooking_start_at
        ? new Date(
            book.prebooking_start_at,
          ).getTime()
        : 0;

    const bookingEnd =
      book.prebooking_end_at
        ? new Date(
            book.prebooking_end_at,
          ).getTime()
        : 0;

    const offerStart =
      book.prebooking_offer_start_at
        ? new Date(
            book.prebooking_offer_start_at,
          ).getTime()
        : 0;

    const offerEnd =
      book.prebooking_offer_end_at
        ? new Date(
            book.prebooking_offer_end_at,
          ).getTime()
        : 0;

    const bookingOpen =
      Boolean(book.prebooking_enabled) &&
      bookingStart <= now &&
      bookingEnd >= now;

    const offerOpen =
      book.prebooking_offer_price !== null &&
      book.prebooking_offer_price !== undefined &&
      offerStart <= now &&
      offerEnd >= now;

    if (
      input.flow === "prebooking" &&
      !bookingOpen
    ) {
      throw new Error(
        `${book.title} is outside its pre-booking period.`,
      );
    }

    if (
      input.flow === "books" &&
      Boolean(book.prebooking_enabled) &&
      bookingEnd > now
    ) {
      throw new Error(
        `${book.title} is currently available for pre-booking only.`,
      );
    }

    const price =
      input.flow === "prebooking"
        ? Number(
            offerOpen
              ? book.prebooking_offer_price
              : book.prebooking_price,
          )
        : Number(book.price);

    if (
      book.status !== "active" ||
      (input.flow === "books" &&
        book.stock_quantity <
          quantityForBook) ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      throw new Error(
        `${book.title} is unavailable in the requested quantity.`,
      );
    }

    const professionalCourierCharge =
      Number(
        book.prebooking_professional_courier_charge ??
          0,
      );

    const postalCharge = Number(
      book.prebooking_postal_charge ?? 0,
    );

    if (
      input.flow === "prebooking" &&
      (
        !Number.isFinite(
          professionalCourierCharge,
        ) ||
        professionalCourierCharge < 0 ||
        !Number.isFinite(postalCharge) ||
        postalCharge < 0
      )
    ) {
      throw new Error(
        `${book.title} has invalid pre-booking delivery charges.`,
      );
    }

    return {
      book_id: book.id,
      title: book.title,
      price,
      quantity,
      professionalCourierCharge,
      postalCharge,
      publisherName: book.publisher_id
        ? publisherNameById.get(
            book.publisher_id,
          ) ?? ""
        : "",
      discountEligible:
        discountEligibleCategoryIds.has(
          book.category_id,
        ),
    };
  });

  /*
   * Delivery state
   */
  const shippingMethod =
    input.shippingMethod ?? "India Post";

  const deliveryState =
    input.state?.trim();

  if (!deliveryState) {
    throw new Error(
      "Select your delivery state.",
    );
  }

  if (
    shippingMethod !== "India Post" &&
    shippingMethod !== "Professional Courier"
  ) {
    throw new Error(
      "Choose a valid shipping method.",
    );
  }

  /*
   * CUSTOMIZE has fixed admin-set pricing.
   *
   * No automatic 7% discount.
   * No membership discount.
   * No coupon discount.
   * No courier discount.
   */
  if (input.flow === "customize") {
    const subtotalPaise = items.reduce(
      (sum, item) =>
        sum +
        Math.round(item.price * 100) *
          item.quantity,
      0,
    );

    const indiaPostCourierChargePaise =
      getCourierChargePaise(deliveryState);

    const professionalCourierChargePaise =
      getCourierChargePaise(deliveryState);

    const courierChargePaise =
      shippingMethod === "India Post"
        ? indiaPostCourierChargePaise
        : professionalCourierChargePaise;

    const totalPaise =
      subtotalPaise + courierChargePaise;

    if (
      !Number.isSafeInteger(totalPaise) ||
      totalPaise < 100
    ) {
      throw new Error(
        "The checkout total is below the minimum payment amount.",
      );
    }

    return {
      flow: input.flow,
      subtotalPaise,
      discountPaise: 0,
      bookDiscountPaise: 0,
      automaticBookDiscountPaise: 0,
      courierChargePaise,
      courierDiscountPaise: 0,
      indiaPostCourierChargePaise,
      professionalCourierChargePaise,
      shippingMethod,
      deliveryState,
      totalPaise,
      discount: null,
      plan: null,
      items,
    };
  }

  /*
   * Existing regular / pre-booking pricing
   */
  const subtotalPaise = items.reduce(
    (sum, item) =>
      sum +
      Math.round(item.price * 100) *
        item.quantity,
    0,
  );

  const discountEligibleItems =
    input.flow === "books"
      ? items.filter(
          (item) => item.discountEligible,
        )
      : [];

  const discountEligibleSubtotalPaise =
    discountEligibleItems.reduce(
      (sum, item) =>
        sum +
        Math.round(item.price * 100) *
          item.quantity,
      0,
    );

  const discount =
    input.flow === "books" &&
    input.discountCode &&
    discountEligibleItems.length > 0
      ? await resolveDiscountCode(
          input.discountCode,
        )
      : null;

  const indiaPostCourierChargePaise =
    input.flow === "prebooking"
      ? items.reduce(
          (sum, item) =>
            sum +
            Math.round(
              item.postalCharge * 100,
            ) *
              item.quantity,
          0,
        )
      : getCourierChargePaise(
          deliveryState,
        );

  const professionalCourierChargePaise =
    input.flow === "prebooking"
      ? items.reduce(
          (sum, item) =>
            sum +
            Math.round(
              item.professionalCourierCharge *
                100,
            ) *
              item.quantity,
          0,
        )
      : getCourierChargePaise(
          deliveryState,
        );

  const courierChargePaise =
    shippingMethod === "India Post"
      ? indiaPostCourierChargePaise
      : professionalCourierChargePaise;

  const qualifyingItems =
    discountEligibleItems.filter((item) => {
      const publisherName =
        item.publisherName
          .trim()
          .toLowerCase();

      return [
        ...MEMBER_DISCOUNT_PUBLISHERS,
      ].some((allowedName) =>
        publisherName.includes(
          allowedName,
        ),
      );
    });

  const qualifyingSubtotalPaise =
    qualifyingItems.reduce(
      (sum, item) =>
        sum +
        Math.round(item.price * 100) *
          item.quantity,
      0,
    );

  const automaticBookDiscountPaise =
    discountEligibleItems.reduce(
      (sum, item) =>
        sum +
        calculatePercentageDiscountPaise(
          Math.round(item.price * 100),
          GENERAL_BOOK_DISCOUNT_PERCENT,
        ) *
          item.quantity,
      0,
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
        discount.percentage,
      );
  } else if (
    input.flow === "books" &&
    discount?.tier === "premium"
  ) {
    bookDiscountPaise +=
      calculatePercentageDiscountPaise(
        qualifyingSubtotalPaise,
        20,
      );

    courierDiscountPaise = Math.round(
      (courierChargePaise *
        MEMBER_COURIER_DISCOUNT_PERCENT) /
        100,
    );
  } else if (
    input.flow === "books" &&
    discount?.tier === "standard"
  ) {
    if (
      qualifyingItems.length > 0 ||
      discountEligibleSubtotalPaise >=
        70000
    ) {
      bookDiscountPaise +=
        calculatePercentageDiscountPaise(
          discountEligibleSubtotalPaise,
          15,
        );
    }

    courierDiscountPaise = Math.round(
      (courierChargePaise *
        MEMBER_COURIER_DISCOUNT_PERCENT) /
        100,
    );
  }

  bookDiscountPaise = Math.min(
    bookDiscountPaise,
    subtotalPaise,
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
      "The checkout total is below the minimum payment amount.",
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