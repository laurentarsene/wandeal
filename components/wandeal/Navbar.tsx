"use client";

import { ArrowLeft, Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface NavbarProps {
  showBack: boolean;
  onBack: () => void;
  favCount?: number;
  onFavorites?: () => void;
}

export function Navbar({ showBack, onBack, favCount = 0, onFavorites }: NavbarProps) {
  const t = useTranslations("nav");

  return (
    <nav className="sticky top-0 z-50 h-16 flex items-center justify-between px-6 backdrop-blur-md bg-white/80 border-b-0 lg:border-b lg:border-[#E5E7EB]/50">
      <div className="flex items-center gap-2 cursor-pointer" onClick={showBack ? onBack : undefined}>
        <img src="/wandeal-logo.svg" alt="wandeal" className="h-6" />
        <span className="font-display text-2xl text-[#1C48CD] tracking-tight">
          wandeal
        </span>
      </div>

      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        {onFavorites && favCount > 0 && (
          <button
            onClick={onFavorites}
            className="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors cursor-pointer"
          >
            <Heart size={16} className="fill-red-500 text-red-500" />
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full bg-[#1C48CD] text-white text-[10px] font-bold">
              {favCount}
            </span>
          </button>
        )}
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
