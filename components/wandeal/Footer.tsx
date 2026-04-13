"use client";

import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-[#E5E7EB] bg-white">
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <img src="/wandeal-logo.svg" alt="wandeal" className="h-5" />
              <span className="font-[var(--font-vina)] text-xl text-[#1C48CD]">
                wandeal
              </span>
            </div>
            <p className="text-[13px] text-[#6B7280] mt-1 max-w-[360px] leading-relaxed">
              {t("tagline")}
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 pt-4 border-t border-[#F3F4F6] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-[11px] text-[#9CA3AF]">
            © {new Date().getFullYear()} wandeal. {t("rights")}
          </p>
          <p className="text-[11px] text-[#9CA3AF]">
            {t("madeIn")}
          </p>
        </div>
      </div>
    </footer>
  );
}
