import type { ReactNode } from "react";

/** Props shared by every structural layout wrapper in `src/layouts`. */
export interface LayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * Per-page metadata shape. Intentionally separate from Next.js's own
 * `Metadata` type so feature code can describe a page's meta needs without
 * importing anything Next-specific — a layout wrapper is responsible for
 * translating this into real `<head>` output when pages are built later.
 */
export interface PageMeta {
  title: string;
  description?: string;
  /** Relative or absolute path to a social preview image. */
  ogImage?: string;
}
