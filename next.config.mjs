/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 7,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  async headers() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseOrigin = supabaseUrl ? new URL(supabaseUrl).origin : "";
    const supabaseWebSocketSource = supabaseUrl
      ? ` wss://${new URL(supabaseUrl).host}`
      : "";
    const contentSecurityPolicy = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "script-src 'self' https://checkout.razorpay.com",
      "style-src 'self'",
      `img-src 'self' data: blob: ${supabaseOrigin}`,
      "font-src 'self' data:",
      `connect-src 'self' ${supabaseOrigin}${supabaseWebSocketSource} https://api.razorpay.com https://checkout.razorpay.com`,
      "frame-src https://api.razorpay.com https://checkout.razorpay.com",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy-Report-Only",
            value: contentSecurityPolicy,
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
