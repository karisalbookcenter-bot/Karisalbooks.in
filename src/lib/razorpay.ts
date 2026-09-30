import Razorpay from "razorpay";

export function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error("Razorpay keys missing. Check .env.local");
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export const razorpay = {
  orders: {
    create: (params: Parameters<ReturnType<typeof getRazorpayClient>["orders"]["create"]>[0]) =>
      getRazorpayClient().orders.create(params),
    fetch: (id: string) => getRazorpayClient().orders.fetch(id),
  },
  payments: {
    fetch: (id: string) => getRazorpayClient().payments.fetch(id),
    capture: (id: string, amount: number, currency = "INR") =>
      getRazorpayClient().payments.capture(id, amount, currency),
  },
};