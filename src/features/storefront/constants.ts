import type { RecordStatus } from "@/types/common.types";

/**
 * The only RecordStatus value the public storefront ever queries for.
 *
 * No existing shared runtime constant for this was found in any verified
 * file — `common.types.ts` (never uploaded in this conversation) only
 * confirms the `RecordStatus` *type*; whether a companion runtime
 * constant (e.g. `RECORD_STATUS.ACTIVE`) exists elsewhere is unknown.
 * Rather than guess at an unverified import, this is a single, typed
 * (`: RecordStatus`, not a bare string) source of truth that every
 * storefront file below imports — so there is exactly one place to
 * change, and one place to redirect to a real shared constant later if
 * one turns out to already exist.
 */
export const PUBLIC_VISIBLE_STATUS: RecordStatus = "active";
