"use client";

import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface NavbarProps {
  showBack: boolean;
  onBack: () => void;
}

export function Navbar({ showBack, onBack }: NavbarProps) {
  const t = useTranslations("nav");

  return (
    <nav className="sticky top-0 z-50 h-16 flex items-center justify-between px-6 backdrop-blur-md bg-white/80 border-b border-[#E5E7EB]/50">
      <span
        className="font-extrabold text-2xl tracking-tight"
        style={{
          background: "linear-gradient(135deg, #264044, #3a6068)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "-1px",
        }}
      >
        wandeal
      </span>

      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        {showBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#4B5563] bg-white border border-[#E5E7EB] rounded-full hover:bg-[#F9FAFB] transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            {t("back")}
          </button>
        )}
      </div>
    </nav>
  );
}
