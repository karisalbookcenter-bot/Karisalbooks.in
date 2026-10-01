import { cn } from "@/lib/utils";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled";


interface Props {
  status: string;
}


export function OrderStatusBadge({
  status,
}: Props) {

  const styles: Record<string, string> = {

    pending:
      "bg-yellow-100 text-yellow-800",

    confirmed:
      "bg-blue-100 text-blue-800",

    processing:
      "bg-blue-100 text-blue-800",

    packed:
      "bg-orange-100 text-orange-800",

    shipped:
      "bg-purple-100 text-purple-800",

    delivered:
      "bg-green-100 text-green-800",

    cancelled:
      "bg-red-100 text-red-800",

  };


  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-xs font-semibold capitalize",
        styles[status] ??
          "bg-gray-100 text-gray-800"
      )}
    >
      {status === "pending" ? "New Orders" : status === "packed" ? "Packed" : status}
    </span>
  );
}