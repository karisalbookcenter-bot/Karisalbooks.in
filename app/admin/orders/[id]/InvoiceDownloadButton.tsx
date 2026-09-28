"use client";

import { generateInvoicePDF } from "@/features/orders/invoice/invoice-generator";

interface Props {
  order: any;
}

export function InvoiceDownloadButton({
  order,
}: Props) {
  return (
    <button
      type="button"
      onClick={() => generateInvoicePDF(order)}
      className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
    >
      Download Invoice PDF
    </button>
  );
}