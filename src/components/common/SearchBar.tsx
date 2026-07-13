"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { getIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

export interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * SearchBar — Sprint 08.
 *
 * A generic search input (icon + input + clear button) — nothing about it
 * is category-specific, so it lives in `components/common/` rather than
 * `features/admin/components/categories/`; any future admin list (Books,
 * Orders, Customers) reuses this same component.
 *
 * Supports both controlled (`value`/`onChange` from a parent, e.g.
 * `CategoryToolbar` lifting state up to filter a table) and uncontrolled
 * (internal state only) usage — if `value` is omitted, the component
 * manages its own state so it still renders usefully standalone.
 *
 * No debouncing is implemented — `onChange` fires on every keystroke. A
 * future sprint wiring this to a real search (client-side filter or a
 * server query) can add debouncing at the call site without changing this
 * component's contract.
 */
export function SearchBar({ value, onChange, placeholder = "Search...", className }: SearchBarProps) {
  const [internalValue, setInternalValue] = useState("");
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;
  const SearchIcon = getIcon("search");
  const ClearIcon = getIcon("close");

  function handleChange(next: string) {
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  }

  return (
    <div className={cn("relative", className)}>
      <SearchIcon
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        value={currentValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="pl-9 pr-9"
      />
      {currentValue && (
        <button
          type="button"
          onClick={() => handleChange("")}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <ClearIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
