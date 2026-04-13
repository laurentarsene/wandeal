import type { Metadata } from "next";
import { Inter, Vina_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";

const inter = Inter({
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
    icon: "/favicon.svg",
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

  return (
    <html lang={locale} className={`${inter.variable} ${vinaSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#FAFAFA] font-[var(--font-inter)]">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
