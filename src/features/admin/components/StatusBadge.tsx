import { Badge } from "@/components/ui/badge";
import type { RecordStatus } from "@/types/common.types";

type StatusBadgeStatus = RecordStatus | "expired";

const STATUS_LABELS: Record<StatusBadgeStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  archived: "Archived",
  expired: "Expired",
};

const STATUS_VARIANTS: Record<
  StatusBadgeStatus,
  "success" | "secondary" | "outline"
> = {
  active: "success",
  inactive: "secondary",
  archived: "outline",
  expired: "outline",
};

export interface StatusBadgeProps {
  status: StatusBadgeStatus;
  className?: string;
}

export function StatusBadge({
  status,
  className,
}: StatusBadgeProps) {
  return (
    <Badge
      variant={STATUS_VARIANTS[status]}
      className={className}
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}