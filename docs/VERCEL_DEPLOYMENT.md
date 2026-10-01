# Vercel Deployment

Import the Git repository into Vercel and keep the detected Next.js framework settings. `vercel.json` pins `npm ci` and `npm run build` for repeatable builds.

Add the variables from `.env.example` in Vercel Project Settings → Environment Variables for Production and Preview as appropriate. Set `ADMIN_EMAILS` to the comma-separated admin sign-in addresses if those users do not have a trusted Supabase `app_metadata.role`. Keep `ADMIN_EMAILS`, `SUPABASE_SERVICE_ROLE_KEY`, Razorpay secrets, Resend token, and WhatsApp token server-only. Set the public site URL to the production origin. Courier prices are currently the requested ₹60 local/₹120 other-state estimate up to 1 kg. Email uses Resend and requires a verified sender; WhatsApp requires approved order and membership templates matching the parameter counts in the notification helper.

Apply Supabase migrations `0004` through `0009` before enabling paid membership/order checkout and editable social links. Notification delivery requires verified Resend sender details and approved WhatsApp Cloud API templates; without those provider settings, payments still complete and the existing manual WhatsApp action remains available.

Run `npm run lint`, `npx tsc --noEmit`, and `npm run build` before deployment. Do not run `next dev` and `next build` concurrently in the same checkout; both use `.next` and can race during page-data collection.