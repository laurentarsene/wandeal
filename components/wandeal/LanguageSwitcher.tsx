"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "next-intl";
import { Globe } from "lucide-react";

const locales = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "nl", label: "Nederlands" },
  { code: "es", label: "Español" },
  { code: "it", label: "Italiano" },
  { code: "pt", label: "Português" },
  { code: "hi", label: "हिन्दी" },
];

export function LanguageSwitcher() {
  const currentLocale = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const switchLocale = async (locale: string) => {
    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale }),
    });
    setOpen(false);
    window.location.reload();
  };

  const current = locales.find((l) => l.code === currentLocale);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#6B7280] hover:text-[#264044] hover:bg-[#e8f0f1] transition-all cursor-pointer"
      >
        <Globe size={14} />
        {current?.code.toUpperCase()}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white rounded-xl border border-[#E5E7EB] shadow-lg overflow-hidden z-50 min-w-[140px]">
          {locales.map((locale) => (
            <button
              key={locale.code}
              onClick={() => switchLocale(locale.code)}
              className={`
                w-full text-left px-3 py-2 text-sm transition-colors cursor-pointer
                ${locale.code === currentLocale
                  ? "bg-[#e8f0f1] text-[#264044] font-semibold"
                  : "text-[#4B5563] hover:bg-[#F9FAFB]"
                }
              `}
            >
              {locale.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
