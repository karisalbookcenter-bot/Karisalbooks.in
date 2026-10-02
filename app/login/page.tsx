"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

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
  const requestedRedirect = searchParams.get("redirectTo");
  const redirectTo = requestedRedirect?.startsWith("/") && !requestedRedirect.startsWith("//")
    ? requestedRedirect
    : "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const signupConfirmed = searchParams.get("signup") === "confirmed";
  const confirmationError = searchParams.get("error") === "email-confirmation";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        setError(
          signInError.code === "invalid_credentials"
            ? "Email or password is incorrect. Sign in with the admin email registered in Supabase Auth."
            : signInError.message
        );
        setIsSubmitting(false);
        return;
      }

      // A full navigation revalidates the Supabase cookie in server middleware.
      window.location.assign(redirectTo);
    } catch (signInFailure) {
      setError(signInFailure instanceof Error ? signInFailure.message : "Unable to sign in.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-md border border-border bg-card p-6">
        <h1 className="mb-1 text-xl font-semibold text-foreground">Sign in</h1>
        <p className="mb-6 text-sm text-muted-foreground">Sign in to continue.</p>
        {signupConfirmed && (
          <p role="status" className="mb-4 text-sm text-green-700">
            Email verified. You can now sign in.
          </p>
        )}
        {confirmationError && (
          <p role="alert" className="mb-4 text-sm text-destructive">
            Email verification link is invalid or expired. Please sign up again or contact support.
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="login-email">Admin email</Label>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Use your email address, not a username.</p>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="login-password">Password</Label>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="pr-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="text-right">
              <Link href="/forgot-password" className="text-sm text-primary underline-offset-4 hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={isSubmitting} className="mt-2">
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          New customer?{" "}
          <Link href="/signup" className="text-primary underline-offset-4 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
