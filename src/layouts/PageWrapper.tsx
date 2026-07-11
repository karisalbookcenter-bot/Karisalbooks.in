import type { LayoutProps } from "@/types/layout.types";

/**
 * Structural wrapper for a full page's content.
 *
 * This is architecture, not design: it exists purely to give every page a
 * single, consistent root element and a `className` escape hatch, so a
 * future page always composes as <PageWrapper>...</PageWrapper> instead of
 * every page re-deciding its own root tag. No visual styling (colors,
 * spacing, typography) is applied here — that is intentionally deferred to
 * the UI/design milestone.
 */
export function PageWrapper({ children, className }: LayoutProps) {
  return <div className={className}>{children}</div>;
}
