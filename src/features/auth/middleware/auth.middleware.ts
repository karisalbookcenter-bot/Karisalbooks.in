import { NextResponse, type NextRequest } from "next/server";

import { createMiddlewareClient } from "@/lib/supabase/middleware";
import { authConfig } from "@/config/auth";
import { DEFAULT_ROLE, isAtLeastRole, type Role } from "@/constants/roles.constants";

/**
 * Auth Middleware — Sprint 05 (Authentication Foundation).
 *
 * Runs on (almost) every request. Two jobs, always in this order:
 *
 *  1. Refresh the Supabase session cookie (via `createMiddlewareClient`),
 *     so a signed-in user's session survives across server requests instead
 *     of silently expiring mid-visit. This happens on every matched
 *     request regardless of whether the route is protected.
 *  2. If the requested path matches a protected/admin prefix in
 *     `authConfig`, enforce it — redirect to login (no session) or to the
 *     unauthorized page (insufficient role).
 *
 * Both `protectedRoutePrefixes` and `adminRoutePrefixes` are empty in this
 * sprint (no protected pages exist yet), so step 2 is currently a no-op on
 * every real request — but the enforcement logic is complete and ready for
 * the moment those arrays gain entries.
 */

function matchesPrefix(pathname: string, prefixes: readonly string[]): boolean {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export async function handleAuthMiddleware(
  request: NextRequest
): Promise<NextResponse> {
  const { supabase, response } = createMiddlewareClient(request);

  // getUser() revalidates the token against Supabase Auth rather than
  // trusting the cookie's contents — the correct call whenever a request
  // is about to make an authorization decision (same reasoning as
  // `session.service.ts`'s `getServerAuthUser`).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const requiresAuth = matchesPrefix(pathname, authConfig.protectedRoutePrefixes);
  const requiresAdmin = matchesPrefix(pathname, authConfig.adminRoutePrefixes);

  if ((requiresAuth || requiresAdmin) && !user) {
    const loginUrl = new URL(authConfig.routes.login, request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (requiresAdmin && user) {
    const role = (user.app_metadata?.role as Role | undefined) ?? DEFAULT_ROLE;
    if (!isAtLeastRole(role, authConfig.minimumAdminRole)) {
      return NextResponse.redirect(new URL(authConfig.routes.unauthorized, request.url));
    }
  }

  return response;
}
