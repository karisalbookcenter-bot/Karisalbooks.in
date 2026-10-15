import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { CartProvider } from "@/features/cart/context/CartProvider";
import { appConfig } from "@/config/app";

const notoSansTamil = localFont({
  src: "../public/font/NotoSansTamil-VariableFont_wdth,wght.ttf",
  variable: "--font-noto-sans-tamil",
  weight: "100 900",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(appConfig.url),
  title: {
    default: "Karisal Books | Tamil Books, Exam Books & Publishers",
    template: "%s | Karisal Books",
  },
  description: appConfig.description,
  applicationName: appConfig.name,
  keywords: [
    "Tamil books",
    "Tamil publishers",
    "competitive exam books",
    "Karisal Books",
    "Tamil literature",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    alternateLocale: ["ta_IN"],
    siteName: appConfig.name,
    title: "Karisal Books | Tamil Books, Exam Books & Publishers",
    description: appConfig.description,
    url: appConfig.url,
  },
  twitter: {
    card: "summary",
    title: "Karisal Books",
    description: appConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  icons: {
    icon: "/karisalbooks-mark.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <body className={notoSansTamil.variable}>
  <CartProvider>
    {children}
  </CartProvider>
</body>
    </html>
  );
}
