"use client";

import { useAuthContext } from "@/features/auth/context/AuthProvider";

/**
 * Base auth hook — Sprint 05 (Authentication Foundation).
 *
 * Returns the full auth context: `status`, `user`, `session`, and the
 * `signIn` / `signOut` / `refreshSession` actions. Every other auth hook
 * in this folder (`useSession`, `useRole`, `usePermission`) is a thin,
 * more specific view built on top of this one.
 *
 * Must be called from within an `<AuthProvider>` — throws otherwise (via
 * the `createSafeContext` factory), which surfaces a missing-provider bug
 * immediately instead of silently returning a fake default.
 */
export function useAuth() {
  return useAuthContext();
}
