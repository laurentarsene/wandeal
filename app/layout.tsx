import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Wandeal — Vos meilleures vacances au meilleur prix",
  description:
    "Trouvez les destinations de vacances les plus avantageuses selon vos dates, votre budget et vos envies. Météo vérifiée, prix estimés, destinations réelles.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#FAFAFA]">{children}</body>
    </html>
  );
}
