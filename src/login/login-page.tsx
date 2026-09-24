"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

/**
 * app/login/page.tsx.
 *
 * Built against `@/lib/supabase/client` directly (`signInWithPassword`)
 * rather than assuming an unverified `AuthProvider`/`useAuth()` API —
 * that component's real source has never been supplied in this
 * conversation, and guessing its shape risks the same kind of mismatch
 * that broke the admin build (server client called from client code).
 * `@supabase/ssr`'s browser client syncs the session into cookies on
 * sign-in, which is what `app/admin/layout.tsx`'s server-side
 * `getServerAuthUser()`/`hasMinimumRole()` check reads on the next
 * request — a full page redirect (`window.location.href`), not a
 * client-side `router.push`, is used after success so that check runs
 * against a fresh request with the new cookie already set.
 *
 * If a real `AuthProvider`/`auth.service.ts` sign-in method already
 * exists, this can be swapped to call that instead — the form/redirect
 * logic below wouldn't need to change either way.
 *
 * Wrapped in `<Suspense>` because `useSearchParams()` requires it in the
 * App Router, or the build can fail during static analysis.
 */
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setIsSubmitting(false);
      return;
    }

    // Full reload, not router.push — see doc comment above.
    window.location.href = redirectTo;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-md border border-border bg-card p-6">
        <h1 className="mb-1 text-xl font-semibold text-foreground">Sign in</h1>
        <p className="mb-6 text-sm text-muted-foreground">Sign in to continue.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={isSubmitting} className="mt-2">
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
