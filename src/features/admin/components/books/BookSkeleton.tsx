"use client";

import { TableSkeleton, CardSkeleton } from "@/features/admin/components/skeletons";

interface BookSkeletonProps {
  view: "table" | "card";
}

export function BookSkeleton({ view }: BookSkeletonProps) {
  return view === "table" ? <TableSkeleton rows={8} columns={7} /> : <CardSkeleton count={8} />;
}
