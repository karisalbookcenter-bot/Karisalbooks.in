"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";

/**
 * Returns just the session/status pair — for components that only need to
 * branch on "is there a session yet?" without pulling in the full auth
 * actions (`signIn`/`signOut`) that `useAuth()` also exposes.
 */
export function useSession() {
  const { session, status } = useAuth();
  return { session, status };
}
