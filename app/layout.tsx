import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Vina_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const vinaSans = Vina_Sans({
  variable: "--font-vina",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Wandeal — Vos meilleures vacances au meilleur prix",
  description:
    "Trouvez les destinations de vacances les plus avantageuses selon vos dates, votre budget et vos envies. Météo vérifiée, prix estimés, destinations réelles.",
  icons: {
    icon: "/favicon.svg",
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
    <html lang={locale} className={`${jakarta.variable} ${vinaSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#FAFAFA]">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
