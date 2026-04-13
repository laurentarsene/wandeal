"use client";

import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-[#E5E7EB] bg-white">
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8">
          {/* Brand */}
          <div className="max-w-[280px]">
            <span
              className="font-extrabold text-xl tracking-tight"
              style={{
                background: "linear-gradient(135deg, #264044, #3a6068)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.5px",
              }}
            >
              wandeal
            </span>
            <p className="text-[13px] text-[#6B7280] mt-2 leading-relaxed">
              {t("tagline")}
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-12 text-[13px]">
            <div>
              <p className="font-semibold text-[#264044] mb-2">{t("product")}</p>
              <ul className="flex flex-col gap-1.5 text-[#6B7280]">
                <li><a href="#" className="hover:text-[#264044] transition-colors">{t("howItWorks")}</a></li>
                <li><a href="#" className="hover:text-[#264044] transition-colors">{t("destinations")}</a></li>
                <li><a href="#" className="hover:text-[#264044] transition-colors">{t("pricing")}</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-[#264044] mb-2">{t("legal")}</p>
              <ul className="flex flex-col gap-1.5 text-[#6B7280]">
                <li><a href="#" className="hover:text-[#264044] transition-colors">{t("privacy")}</a></li>
                <li><a href="#" className="hover:text-[#264044] transition-colors">{t("terms")}</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-5 border-t border-[#F3F4F6] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
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
