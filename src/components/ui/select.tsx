import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

/**
 * Select — Sprint 08. A styled native `<select>`, not a Radix/combobox
 * component — consistent with this project's dependency-light approach
 * (see `MobileNavDrawer`'s doc comment, Sprint 06, for the same reasoning
 * applied to a dialog instead of a dropdown). A native select gets
 * keyboard/screen-reader support for free and needs no click-outside or
 * focus-trap logic. Used by `CategoryFormLayout` (Parent Category,
 * Status fields) and `CategoryFilters` (Status filter).
 */
const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 pr-9 text-sm text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
    </div>
  )
);
Select.displayName = "Select";

export { Select };
