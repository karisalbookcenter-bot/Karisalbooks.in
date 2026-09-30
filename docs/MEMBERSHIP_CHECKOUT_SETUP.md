# Membership Checkout Setup

1. Apply `supabase/migrations/0004_membership_checkout_promotions.sql` to the Supabase project. It adds offer coupon codes and assigns a unique `KBM-YYYY-NNNNNN` membership number when a paid membership is inserted.
2. Add `SUPABASE_SERVICE_ROLE_KEY` to the server environment using the project's service-role key. Keep it server-only; never prefix it with `NEXT_PUBLIC_`.
3. Restart the Next.js server. The existing `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are used to create and verify payments.

Customers can apply at `/membership/apply`. Admins can set an optional coupon code on an offer; shoppers enter either that code or an active membership number at checkout. Only one discount is accepted per order.