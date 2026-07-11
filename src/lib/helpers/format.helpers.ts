import { CURRENCY, LOCALE } from "@/constants/app.constants";

/** Formats a number as INR currency, e.g. 499 -> "₹499.00". */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: CURRENCY.CODE,
  }).format(amount);
}

/** Formats an ISO date string into a readable date, e.g. "11 Jul 2026". */
export function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(isoDate));
}
