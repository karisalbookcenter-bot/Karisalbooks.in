import type { RecordStatus } from "@/types/common.types";

/**
 * The only RecordStatus value the public storefront ever queries for.
 * Single, typed source of truth (not a bare string literal) — every
 * storefront service imports this instead of repeating "active".
 */
export const PUBLIC_VISIBLE_STATUS: RecordStatus = "active";
