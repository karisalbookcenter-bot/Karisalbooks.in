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

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BookStore",
      "@id": `${appConfig.url}/#bookstore`,
      name: "Karisal Book Center",
      url: appConfig.url,
      logo: `${appConfig.url}/karisalbooks-mark.svg`,
      image: `${appConfig.url}/karisalbooks-mark.svg`,
      address: {
        "@type": "PostalAddress",
        streetAddress: "1-337, East Street",
        addressLocality: "Kalingapatti",
        addressRegion: "Tamil Nadu",
        postalCode: "627719",
        addressCountry: "IN",
      },
      areaServed: {
        "@type": "Country",
        name: "India",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${appConfig.url}/#website`,
      name: appConfig.name,
      url: appConfig.url,
      publisher: { "@id": `${appConfig.url}/#bookstore` },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <body className={notoSansTamil.variable}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
