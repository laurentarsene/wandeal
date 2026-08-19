"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Globe, Loader2 } from "lucide-react";

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
  const tA11y = useTranslations("a11y");
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const switchLocale = (locale: string) => {
    if (locale === currentLocale) {
      setOpen(false);
      return;
    }
    startTransition(async () => {
      try {
        await fetch("/api/locale", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locale }),
        });
        window.location.reload();
      } catch {
        setOpen(false);
      }
    });
  };

  const current = locales.find((l) => l.code === currentLocale);

  return (
    <div ref={ref} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={tA11y("language")}
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={pending}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#4B5563] hover:text-[#1C48CD] hover:bg-[#EEF2FF] transition-all cursor-pointer disabled:opacity-60"
      >
        {pending ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
        {current?.code.toUpperCase()}
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={tA11y("language")}
          className="absolute right-0 top-full mt-1 bg-white rounded-xl border border-[#E5E7EB] shadow-lg overflow-hidden z-50 min-w-[150px]"
        >
          {locales.map((locale) => (
            <li key={locale.code} role="option" aria-selected={locale.code === currentLocale}>
              <button
                type="button"
                lang={locale.code}
                onClick={() => switchLocale(locale.code)}
                className={`
                  w-full text-left px-3 py-2 text-sm transition-colors cursor-pointer
                  ${
                    locale.code === currentLocale
                      ? "bg-[#EEF2FF] text-[#1C48CD] font-semibold"
                      : "text-[#4B5563] hover:bg-[#F9FAFB]"
                  }
                `}
              >
                {locale.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
