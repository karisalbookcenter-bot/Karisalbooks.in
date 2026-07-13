import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Label — Sprint 08. A plain `<label>` with consistent form-field
 * typography, used by `CategoryFormLayout`. Kept as a native element
 * (not a Radix `Label` primitive) to stay dependency-light, consistent
 * with every other `components/ui/*` primitive in this project.
 */
const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  )
);
Label.displayName = "Label";

export { Label };
