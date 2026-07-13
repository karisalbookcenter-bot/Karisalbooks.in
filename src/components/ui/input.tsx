import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Input — Sprint 08. Same hand-written primitive pattern as Day 1's
 * `button.tsx` — a plain styled element plus `cn()`, no new dependency.
 * Added this sprint because `CategoryFormLayout` and `SearchBar` are the
 * first components in the project needing a styled text input; both use
 * this rather than each writing its own input classes.
 */
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
