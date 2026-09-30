export {};

declare global {
  interface RazorpayPaymentResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }

  interface RazorpayCheckoutOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    prefill?: { name?: string; email?: string; contact?: string };
    handler: (response: RazorpayPaymentResponse) => void | Promise<void>;
    modal?: { ondismiss?: () => void };
    theme?: { color?: string };
  }

  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => {
      open: () => void;
    };
  }
}