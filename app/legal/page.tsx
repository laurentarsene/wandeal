import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { site } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal");
  return {
    title: `${t("title")} — ${site.name}`,
    robots: { index: true, follow: true },
  };
}

export default async function LegalPage() {
  const t = await getTranslations("legal");
  const locale = await getLocale();

  const sections = [
    { title: t("editorTitle"), body: t("editorBody", { owner: site.owner, email: site.email }) },
    { title: t("hostingTitle"), body: t("hostingBody") },
    { title: t("affiliateTitle"), body: t("affiliateBody") },
    { title: t("pricesTitle"), body: t("pricesBody") },
    { title: t("dataTitle"), body: t("dataBody") },
    { title: t("liabilityTitle"), body: t("liabilityBody") },
    { title: t("contactTitle"), body: t("contactBody", { email: site.email }) },
  ];

  const updated = new Date(site.legalUpdated).toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="flex-1 w-full max-w-3xl mx-auto px-5 py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#4B5563] hover:text-[#1C48CD] transition-colors"
      >
        <ArrowLeft size={16} />
        {t("back")}
      </Link>

      <h1 className="mt-6 text-3xl font-extrabold text-[#111] tracking-tight">
        {t("title")}
      </h1>
      <p className="mt-2 text-[13px] text-[#6B7280]">{t("updated", { date: updated })}</p>

      <div className="mt-8 space-y-7">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-base font-bold text-[#1e2a4a]">{section.title}</h2>
            <p className="mt-1.5 text-[14px] leading-relaxed text-[#4B5563]">{section.body}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
