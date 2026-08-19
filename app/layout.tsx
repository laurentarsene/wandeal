import type { Metadata } from "next";
import { DM_Sans, Vina_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";
import { site, SUPPORTED_LOCALES } from "@/lib/site";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const vinaSans = Vina_Sans({
  variable: "--font-vina",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations("meta");
  const title = t("title");
  const description = t("description");

  return {
    // Without this, the relative OG image resolves to nothing for crawlers.
    metadataBase: new URL(site.url),
    title,
    description,
    applicationName: site.name,
    // Locale is negotiated per request on a single URL, so there are no
    // per-language URLs to declare as alternates — only the canonical one.
    alternates: { canonical: "/" },
    icons: {
      icon: [
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      ],
      apple: "/apple-touch-icon.png",
    },
    manifest: "/manifest.json",
    verification: {
      google: "zD2Z_R_RRkUOnVbcAVgj9-zAgYGY6PSedf8mZ03eDyQ",
    },
    other: {
      "mobile-web-app-capable": "yes",
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "default",
    },
    openGraph: {
      title,
      description,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: site.name }],
      type: "website",
      siteName: site.name,
      locale,
      url: site.url,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og.png"],
    },
  };
}

export const viewport = {
  themeColor: "#1C48CD",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const t = await getTranslations("meta");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: site.name,
    url: site.url,
    description: t("description"),
    applicationCategory: "TravelApplication",
    operatingSystem: "All",
    inLanguage: SUPPORTED_LOCALES,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
    },
    creator: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
  };

  return (
    <html lang={locale} className={`${dmSans.variable} ${vinaSans.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#FFFBF7] font-sans">
        <NextIntlClientProvider messages={messages}>
          {children}
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
