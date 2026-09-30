import { Badge } from "@/components/ui/badge";

import type { OfferStatus } from "@/types/offer.types";

const STATUS_LABELS: Record<OfferStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  expired: "Expired",
};

const STATUS_VARIANTS: Record<
  OfferStatus,
  "success" | "secondary" | "outline"
> = {
  active: "success",
  inactive: "secondary",
  expired: "outline",
};

interface OfferStatusBadgeProps {
  status: OfferStatus;
  className?: string;
}

export function OfferStatusBadge({
  status,
  className,
}: OfferStatusBadgeProps) {
  return (
    <Badge
      variant={STATUS_VARIANTS[status]}
      className={className}
    >
      {STATUS_LABELS[status]}
    </Badge>
  );
}
