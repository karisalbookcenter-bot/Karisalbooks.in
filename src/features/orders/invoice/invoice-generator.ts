import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type InvoiceItem = {
  title: string;
  quantity: number;
  price: number;
};

type InvoiceOrder = {
  id: string;
  customer_name: string;
  mobile: string;
  address: string;
  district: string;
  pincode: string;
  total_amount: number;
  courier_charge: number | null;
  payment_status: string | null;
  payment_method: string | null;
  courier_name: string | null;
  tracking_number: string | null;
  created_at: string;
  order_items: InvoiceItem[];
};

export function generateInvoicePDF(
  order: InvoiceOrder
) {
  const pdf = new jsPDF();

  pdf.setFontSize(18);
  pdf.text("Karisal Book Centre", 14, 18);

  pdf.setFontSize(11);
  pdf.text("WhatsApp : 9626915677", 14, 26);

  pdf.setFontSize(16);
  pdf.text("INVOICE", 150, 18);

  pdf.setFontSize(11);

  pdf.text(
    `Order ID : ${order.id}`,
    14,
    40
  );

  pdf.text(
    `Date : ${new Date(order.created_at).toLocaleDateString("en-IN")}`,
    14,
    48
  );

  pdf.text(
    `Customer : ${order.customer_name}`,
    14,
    62
  );

  pdf.text(
    `Mobile : ${order.mobile}`,
    14,
    70
  );

  pdf.text(
    `Address : ${order.address}`,
    14,
    78
  );

  pdf.text(
    `${order.district} - ${order.pincode}`,
    14,
    86
  );

  autoTable(pdf, {
    startY: 98,
    head: [
      [
        "Book",
        "Qty",
        "Price"
      ]
    ],
    body: order.order_items.map((item) => [
      item.title,
      item.quantity.toString(),
      `₹${item.price}`,
    ]),
  });

  const finalY =
    (pdf as any).lastAutoTable.finalY + 12;

  const courier =
    order.courier_charge ?? 0;

  const booksTotal =
    order.total_amount - courier;

  pdf.text(
    `Books Total : ₹${booksTotal}`,
    14,
    finalY
  );

  pdf.text(
    `Courier Charge : ₹${courier}`,
    14,
    finalY + 8
  );

  pdf.setFontSize(13);

  pdf.text(
    `Grand Total : ₹${order.total_amount}`,
    14,
    finalY + 20
  );

  pdf.setFontSize(11);

  pdf.text(
    `Payment Status : ${order.payment_status ?? "-"}`,
    14,
    finalY + 34
  );

  pdf.text(
    `Payment Method : ${order.payment_method ?? "-"}`,
    14,
    finalY + 42
  );

  pdf.text(
    `Courier : ${order.courier_name ?? "-"}`,
    14,
    finalY + 50
  );

  pdf.text(
    `Tracking ID : ${order.tracking_number ?? "-"}`,
    14,
    finalY + 58
  );

  pdf.text(
    "Thank you for shopping with Karisal Book Centre",
    14,
    finalY + 74
  );

  pdf.save(
    `Invoice-${order.id}.pdf`
  );
}