import type { NextRequest } from "next/server";
import { handleAuthMiddleware } from "@/features/auth/middleware/auth.middleware";

/**
 * Root middleware entry point — Sprint 05 (Authentication Foundation).
 *
 * Kept deliberately thin: all actual logic lives in
 * `@/features/auth/middleware/auth.middleware`. If a second, unrelated
 * kind of middleware is ever needed (e.g. geo-redirects), it composes here
 * rather than growing this file into a monolith.
 */
export async function middleware(request: NextRequest) {
  return handleAuthMiddleware(request);
}

export const config = {
  /**
   * Run on every route except static assets and Next.js internals, so the
   * Supabase session cookie is refreshed on any real navigation. This is
   * intentionally broad — it does NOT mean every route is protected; see
   * `authConfig.protectedRoutePrefixes` / `adminRoutePrefixes` for which
   * paths actually enforce a redirect.
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
