"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function requestCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error: requestError } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (requestError) {
        setError(requestError.message);
        return;
      }
      setCodeSent(true);
    } catch (requestFailure) {
      setError(requestFailure instanceof Error ? requestFailure.message : "Unable to send the reset code.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function updatePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (code.trim().length !== 6) {
      setError("Enter the 6-digit code sent to your email.");
      return;
    }
    if (password.length < 8) {
      setError("Your new password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code.trim(),
        type: "recovery",
      });
      if (verifyError) {
        setError(verifyError.message);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        return;
      }

      setPasswordUpdated(true);
    } catch (updateFailure) {
      setError(updateFailure instanceof Error ? updateFailure.message : "Unable to update the password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <section className="w-full max-w-sm rounded-md border border-border bg-card p-6">
        <h1 className="mb-1 text-xl font-semibold text-foreground">
          {passwordUpdated ? "Password updated" : "Reset your password"}
        </h1>
        {passwordUpdated ? (
          <>
            <p className="mb-6 text-sm text-muted-foreground">
              Your password has been changed. You can now sign in with your new password.
            </p>
            <Link
              href="/login"
              className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Go to sign in
            </Link>
          </>
        ) : !codeSent ? (
          <>
            <p className="mb-6 text-sm text-muted-foreground">
              Enter the email address on your account. We will send a one-time code to reset your password.
            </p>
            <form onSubmit={requestCode} className="flex flex-col gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="recovery-email">Email</Label>
                <Input
                  id="recovery-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Sending code…" : "Send reset code"}
              </Button>
            </form>
          </>
        ) : (
          <>
            <p className="mb-6 text-sm text-muted-foreground">
              Enter the 6-digit code sent to <span className="font-medium text-foreground">{email}</span> and choose a new password.
            </p>
            <form onSubmit={updatePassword} className="flex flex-col gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="recovery-code">Email verification code</Label>
                <Input
                  id="recovery-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="new-password">New password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    minLength={8}
                    required
                    className="pr-11"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground"
                    aria-label={showPassword ? "Hide new password" : "Show new password"}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((visible) => !visible)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">Use at least 8 characters.</p>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="confirm-password">Confirm new password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    minLength={8}
                    required
                    className="pr-11"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground"
                    aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}
                    aria-pressed={showConfirmPassword}
                    onClick={() => setShowConfirmPassword((visible) => !visible)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating password…" : "Save new password"}
              </Button>
              <button
                type="button"
                className="text-sm text-muted-foreground underline underline-offset-4"
                disabled={isSubmitting}
                onClick={() => {
                  setCodeSent(false);
                  setCode("");
                  setError(null);
                }}
              >
                Use a different email
              </button>
            </form>
          </>
        )}
        {!passwordUpdated && (
          <p className="mt-5 text-center text-sm text-muted-foreground">
            <Link href="/login" className="underline underline-offset-4">Back to sign in</Link>
          </p>
        )}
      </section>
    </main>
  );
}
