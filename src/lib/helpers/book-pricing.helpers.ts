export const GENERAL_BOOK_DISCOUNT_PERCENT = 7;
export const NO_DISCOUNT_CATEGORY_NAME = "மக்கள் பதிப்பு";

export function isBookDiscountEligible(categoryName?: string | null) {
  return categoryName?.trim().normalize("NFC") !== NO_DISCOUNT_CATEGORY_NAME;
}

export function calculatePercentageDiscountPaise(amountPaise: number, percentage: number) {
  return Math.round((amountPaise * percentage) / 100);
}

export function calculateBookPrice(price: number, discountEligible = true) {
  const pricePaise = Math.round(price * 100);
  const discountPaise = discountEligible
    ? calculatePercentageDiscountPaise(pricePaise, GENERAL_BOOK_DISCOUNT_PERCENT)
    : 0;

  return {
    originalPrice: pricePaise / 100,
    discountAmount: discountPaise / 100,
    discountedPrice: (pricePaise - discountPaise) / 100,
  };
}