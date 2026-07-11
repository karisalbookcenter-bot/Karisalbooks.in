import type { LayoutProps } from "@/types/layout.types";

/**
 * Structural wrapper for a section within a page (e.g. a future "Featured
 * Books" block, a future "Offer Zone" block). Semantic only — a <section>
 * element and a `className` escape hatch. No visual design applied.
 */
export function SectionWrapper({ children, className }: LayoutProps) {
  return <section className={className}>{children}</section>;
}
