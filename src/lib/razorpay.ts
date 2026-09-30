import Razorpay from "razorpay";

export const razorpay = {
  orders: {
    create: async (params: Record<string, unknown>) => {
      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      if (!keyId || !keySecret) {
        throw new Error("Razorpay keys missing. Check .env.local");
      }

      const client = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

      return client.orders.create(params as any);
    },
  },
};