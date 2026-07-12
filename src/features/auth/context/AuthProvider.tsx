"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

import { createSafeContext } from "@/contexts/createSafeContext";
import { AuthService } from "@/features/auth/services/auth.service";
import type { AuthSession, AuthState, AuthStatus } from "@/features/auth/types/auth.types";

/**
 * AuthProvider — Sprint 05 (Authentication Foundation).
 *
 * Client-side auth state, built on the generic `createSafeContext` factory
 * from Day 3 rather than hand-rolling a new Context — that factory exists
 * precisely for cases like this one. Holds the current session in React
 * state, hydrates it on mount, and stays in sync via
 * `AuthService.onAuthStateChange`.
 *
 * No page wraps the app in this provider yet (there is no `<html>`/root
 * layout change in this sprint) — that one-line wiring happens whenever
 * the first feature that needs client-side auth state is built.
 */

export interface AuthContextValue extends AuthState {
  signIn: typeof AuthService.signInWithPassword;
  signOut: typeof AuthService.signOut;
  refreshSession: () => Promise<void>;
}

const [AuthContextProvider, useAuthContext] = createSafeContext<AuthContextValue>();

export { useAuthContext };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [session, setSession] = useState<AuthSession | null>(null);

  async function refreshSession() {
    const result = await AuthService.getCurrentSession();
    setSession(result.data ?? null);
    setStatus(result.data ? "authenticated" : "unauthenticated");
  }

  useEffect(() => {
    refreshSession();

    const unsubscribe = AuthService.onAuthStateChange((nextSession) => {
      setSession(nextSession);
      setStatus(nextSession ? "authenticated" : "unauthenticated");
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      user: session?.user ?? null,
      signIn: AuthService.signInWithPassword,
      signOut: AuthService.signOut,
      refreshSession,
    }),
    [status, session]
  );

  return <AuthContextProvider value={value}>{children}</AuthContextProvider>;
}
