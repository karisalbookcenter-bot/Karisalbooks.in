"use client";

import { useCallback, useState } from "react";

/**
 * Generic boolean toggle state, reusable by any future feature that needs
 * an open/closed or on/off flag (e.g. a future mobile nav menu, a future
 * modal). No UI is rendered here — this is state logic only.
 */
export function useToggle(initialValue = false): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue((prev) => !prev), []);

  return [value, toggle, setValue];
}
