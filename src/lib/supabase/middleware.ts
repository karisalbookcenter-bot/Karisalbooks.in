import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Supabase client for use inside `middleware.ts` — a third context
 * alongside the existing `@/lib/supabase/client` (browser) and
 * `@/lib/supabase/server` (Server Components/Route Handlers), because
 * middleware reads/writes cookies through a `NextRequest`/`NextResponse`
 * pair rather than the `next/headers` cookie store the other two use.
 *
 * Returns both the Supabase client and the `NextResponse` it wrote refreshed
 * cookies onto — the caller (auth middleware) must return that response
 * (or a redirect built from the same request) so the refreshed session
 * cookie actually reaches the browser.
 */
export function createMiddlewareClient(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  return { supabase, response };
}
