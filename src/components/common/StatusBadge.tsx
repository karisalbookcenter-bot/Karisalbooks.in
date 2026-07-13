import { Badge } from "@/components/ui/badge";
import type { RecordStatus } from "@/types/common.types";

const STATUS_LABELS: Record<RecordStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  archived: "Archived",
};

const STATUS_VARIANTS: Record<RecordStatus, "success" | "secondary" | "outline"> = {
  active: "success",
  inactive: "secondary",
  archived: "outline",
};

export interface StatusBadgeProps {
  status: RecordStatus;
  className?: string;
}

/**
 * StatusBadge — Sprint 08.
 *
 * Maps the shared `RecordStatus` type (`@/types/common.types`, Day 3 —
 * the same `"active" | "inactive" | "archived"` union every
 * `BaseEntity`-derived table uses) to a consistently-colored `Badge`.
 * Promoted to `components/common/` rather than kept inside
 * `features/admin/components/categories/`, since every future admin table
 * with a `status` column (Products, Authors, Publishers, Coupons — none
 * built yet) needs the exact same mapping; `CategoryTable`/`CategoryCard`/
 * `CategoryTreeView` are just its first consumers.
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant={STATUS_VARIANTS[status]} className={className}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
