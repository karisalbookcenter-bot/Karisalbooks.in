interface PublicationQuoteEmailInput {
  name: string;
  email: string;
  requestNumber: string;
  bookTitle: string;
  amount: number;
  note?: string | null;
}

export async function sendPublicationQuoteEmail(input: PublicationQuoteEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ORDER_EMAIL_FROM;
  if (!apiKey || !from) return false;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [input.email],
      subject: `Your printing quotation · ${input.requestNumber}`,
      text: [
        `Vanakkam ${input.name},`,
        "",
        `Thank you for sharing “${input.bookTitle}” with Karisal Books. We have reviewed your printing request.`,
        `Quotation: INR ${input.amount.toFixed(2)}`,
        input.note ? `Details: ${input.note}` : "",
        "",
        `Please refer to ${input.requestNumber} if you contact us about this quotation.`,
        "This quotation is subject to final confirmation of manuscript and print specifications.",
      ].filter(Boolean).join("\n"),
    }),
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) console.error("PUBLICATION QUOTATION EMAIL FAILED", response.status);
  return response.ok;
}