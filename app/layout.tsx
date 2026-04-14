import type { Metadata } from "next";
import { DM_Sans, Vina_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-inter",
  subsets: ["latin"],
});

const vinaSans = Vina_Sans({
  variable: "--font-vina",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Wandeal — Ur next journey",
  description:
    "Des vacances sur mesure, trouvées par l'IA. Dites-nous d'où vous partez, on s'occupe du reste.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "theme-color": "#1C48CD",
  },
  openGraph: {
    title: "Wandeal — Ur next journey",
    description: "Des vacances sur mesure, trouvées par l'IA.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
    type: "website",
    siteName: "Wandeal",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wandeal — Ur next journey",
    description: "Des vacances sur mesure, trouvées par l'IA.",
    images: ["/og.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Wandeal",
    url: "https://wandeal.vercel.app",
    description: "Des vacances sur mesure, trouvées par l'IA. Dites-nous d'où vous partez, on s'occupe du reste.",
    applicationCategory: "TravelApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
    },
    creator: {
      "@type": "Organization",
      name: "Wandeal",
      url: "https://wandeal.vercel.app",
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
      <body className="min-h-full flex flex-col bg-[#FAFAFA] font-sans">
        <NextIntlClientProvider messages={messages}>
          {children}
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
