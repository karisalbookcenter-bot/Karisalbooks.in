import type { LayoutProps } from "@/types/layout.types";

/**
 * Structural wrapper that constrains content width. Left deliberately
 * free of any actual max-width/padding styling for now — a future design
 * milestone decides those values. This file's only job is to establish
 * that a `ContentContainer` is the composable unit every layout will use.
 */
export function ContentContainer({ children, className }: LayoutProps) {
  return <div className={className}>{children}</div>;
}
