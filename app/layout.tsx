import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/features/cart/context/CartProvider";

export const metadata: Metadata = {
  title: "Bookery — Your Next Great Read",
  description:
    "A modern book eCommerce platform built with Next.js, Supabase, and shadcn/ui.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
  <CartProvider>
    {children}
  </CartProvider>
</body>
    </html>
  );
}
