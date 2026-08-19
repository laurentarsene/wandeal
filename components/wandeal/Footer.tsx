"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Handshake } from "lucide-react";
import { site } from "@/lib/site";

export function Footer() {
  const t = useTranslations("footer");
  const tResults = useTranslations("results");

  return (
    <footer className="border-t border-[#E5E7EB] bg-white">
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/wandeal-logo.svg" alt="" className="h-5" />
              <span className="font-display text-xl text-[#1C48CD]">wandeal</span>
            </div>
            <p className="text-[13px] text-[#4B5563] mt-1 max-w-[360px] leading-relaxed">
              {t("tagline")}
            </p>
          </div>

          <div className="sm:text-right">
            <Link
              href="/legal"
              className="text-[13px] font-medium text-[#1C48CD] hover:underline"
            >
              {t("legalLink")}
            </Link>
          </div>
        </div>

        {/* Affiliate disclosure — legally required, and it costs nothing to be upfront */}
        <p className="mt-6 flex items-start gap-2 text-[12px] leading-relaxed text-[#4B5563] bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl px-4 py-3">
          <Handshake size={14} className="shrink-0 mt-0.5 text-[#1C48CD]" />
          <span>
            <strong className="font-semibold">{t("affiliate")} — </strong>
            {tResults("affiliateNote")} {tResults("priceDisclaimer")}
          </span>
        </p>

        {/* Bottom bar */}
        <div className="mt-6 pt-4 border-t border-[#F3F4F6] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-[12px] text-[#6B7280]">
            © {new Date().getFullYear()} {site.name}. {t("rights")}
          </p>
          <p className="text-[12px] text-[#6B7280]">{t("madeIn")}</p>
        </div>
      </div>
    </footer>
  );
}
