interface OrderNotificationInput {
  type: "order" | "membership" | "prebooking" | "prebooking-ready";
  name: string;
  email?: string;
  mobile?: string;
  reference: string;
  amount: number;
  planName?: string;
  expiryDate?: string;
}

function plainText(input: OrderNotificationInput) {
  if (input.type === "membership") {
    return [
      `Vanakkam ${input.name},`,
      "",
      `Your ${input.planName ?? "Karisal Books"} membership is active.`,
      `Membership number: ${input.reference}`,
      `Paid: INR ${input.amount.toFixed(2)}`,
      `Valid through: ${input.expiryDate ?? ""}`,
      "",
      "Use your membership number at checkout for eligible book and courier discounts.",
    ].join("\n");
  }

  if (input.type === "prebooking") {
    return [
      `Vanakkam ${input.name},`,
      "",
      "Your Karisal Books pre-booking is confirmed.",
      `Pre-booking ID: ${input.reference}`,
      `Paid: INR ${input.amount.toFixed(2)}`,
      "We will email you when the book is ready for distribution.",
    ].join("\n");
  }

  if (input.type === "prebooking-ready") {
    return [
      `Vanakkam ${input.name},`,
      "",
      `Your pre-booked title is ready for distribution. Pre-booking ID: ${input.reference}`,
      "Our team will process your delivery next. Thank you for supporting forthcoming books.",
    ].join("\n");
  }

  return [
    `Vanakkam ${input.name},`,
    "",
    "Your Karisal Books order is confirmed.",
    `Order reference: ${input.reference}`,
    `Paid: INR ${input.amount.toFixed(2)}`,
    "We will update you when the order is packed and shipped.",
  ].join("\n");
}

async function sendEmail(input: OrderNotificationInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ORDER_EMAIL_FROM;
  if (!apiKey || !from || !input.email) return false;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.email],
      subject: input.type === "membership"
        ? `Your membership ${input.reference} is active`
        : input.type === "prebooking"
          ? `Pre-booking confirmed: ${input.reference}`
          : input.type === "prebooking-ready"
            ? `Your pre-booked book is ready · ${input.reference}`
            : `Karisal Books order ${input.reference} confirmed`,
      text: plainText(input),
    }),
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    console.error("ORDER EMAIL NOTIFICATION FAILED", response.status);
  }
  return response.ok;
}

async function sendWhatsApp(input: OrderNotificationInput) {
  if (input.type === "prebooking-ready") return false;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const template = input.type === "membership"
    ? process.env.WHATSAPP_MEMBERSHIP_TEMPLATE
    : process.env.WHATSAPP_ORDER_TEMPLATE;
  if (!accessToken || !phoneNumberId || !template || !input.mobile) return false;

  const recipient = input.mobile.replace(/\D/g, "");
  const to = recipient.length === 10 ? `91${recipient}` : recipient;
  const parameters = input.type === "membership"
    ? [input.name, input.reference, input.planName ?? "Membership", input.expiryDate ?? ""]
    : [input.name, input.reference, `INR ${input.amount.toFixed(2)}`];

  const response = await fetch(
    `https://graph.facebook.com/${process.env.WHATSAPP_GRAPH_API_VERSION ?? "v22.0"}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: template,
          language: { code: process.env.WHATSAPP_TEMPLATE_LANGUAGE ?? "en" },
          components: [{
            type: "body",
            parameters: parameters.map((text) => ({ type: "text", text })),
          }],
        },
      }),
      signal: AbortSignal.timeout(5000),
    }
  );

  if (!response.ok) {
    console.error("WHATSAPP NOTIFICATION FAILED", response.status);
  }
  return response.ok;
}

export async function sendPurchaseNotifications(input: OrderNotificationInput) {
  const results = await Promise.allSettled([sendEmail(input), sendWhatsApp(input)]);
  for (const result of results) {
    if (result.status === "rejected") {
      console.error("PURCHASE NOTIFICATION FAILED", result.reason);
    }
  }
  return { emailSent: results[0].status === "fulfilled" && results[0].value };
}