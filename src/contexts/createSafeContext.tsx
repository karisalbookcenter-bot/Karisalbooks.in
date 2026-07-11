"use client";

import { createContext, useContext } from "react";

/**
 * Factory for a type-safe React Context + hook pair, without ever needing
 * a fake/dummy default value. Every future context (e.g. a future
 * `CartContext`, `UserPreferencesContext`) should be created via this
 * factory rather than hand-rolling `createContext` + `useContext` each time.
 *
 * No app-specific context (cart, auth, etc.) is created in this milestone —
 * this file only establishes the reusable pattern.
 *
 * Usage (future milestone):
 *   const [CartProvider, useCart] = createSafeContext<CartContextValue>();
 */
export function createSafeContext<ContextValue>() {
  const Context = createContext<ContextValue | undefined>(undefined);

  function useSafeContext(): ContextValue {
    const value = useContext(Context);
    if (value === undefined) {
      throw new Error(
        "useSafeContext must be called within its matching Provider."
      );
    }
    return value;
  }

  return [Context.Provider, useSafeContext] as const;
}
