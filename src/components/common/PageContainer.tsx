import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface PageContainerProps {
  /** Page heading, e.g. "Books". */
  title?: string;
  /** One-line supporting text under the title. */
  description?: string;
  /** Rendered above the title — typically a `<Breadcrumb>`. */
  breadcrumb?: ReactNode;
  /** Rendered on the same row as the title (right-aligned) — typically a
   *  primary action button, e.g. a future "Add Book". No action is wired
   *  up by this component itself; the caller supplies real buttons. */
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * PageContainer — Sprint 06.
 *
 * The standard shape for any content page's header area (breadcrumb,
 * title + description, actions row) plus its body, so every future admin
 * screen (Books, Orders, Reports, ...) composes the same way instead of
 * re-implementing this header pattern each time.
 *
 * Distinct from Day 3's `@/layouts` primitives (`PageWrapper`,
 * `SectionWrapper`, `ContentContainer`), which are pure structural
 * shells with no opinion about headings or actions. `PageContainer` is
 * one level up: a specific, reusable *pattern* (not just a wrapper tag)
 * that a page can either use directly or compose inside those Day 3
 * primitives.
 */
export function PageContainer({
  title,
  description,
  breadcrumb,
  actions,
  children,
  className,
}: PageContainerProps) {
  const hasHeader = title || description || breadcrumb || actions;

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {hasHeader && (
        <div className="flex flex-col gap-4">
          {breadcrumb}
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              {title && (
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  {title}
                </h1>
              )}
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
            {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
          </div>
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}
