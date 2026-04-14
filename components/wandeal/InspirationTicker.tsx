"use client";

import { useTranslations } from "next-intl";

const inspirations = [
  { flag: "🇵🇹", dest: "Lisbonne", price: "89€" },
  { flag: "🇭🇷", dest: "Dubrovnik", price: "120€" },
  { flag: "🇮🇸", dest: "Reykjavik", price: "199€" },
  { flag: "🇲🇦", dest: "Marrakech", price: "75€" },
  { flag: "🇬🇷", dest: "Santorin", price: "150€" },
  { flag: "🇮🇹", dest: "Cinque Terre", price: "95€" },
  { flag: "🇪🇸", dest: "Barcelone", price: "49€" },
  { flag: "🇳🇴", dest: "Fjords", price: "180€" },
  { flag: "🇦🇱", dest: "Albanie", price: "110€" },
  { flag: "🇬🇪", dest: "Tbilissi", price: "140€" },
  { flag: "🇸🇮", dest: "Ljubljana", price: "85€" },
  { flag: "🇹🇷", dest: "Istanbul", price: "99€" },
];

export function InspirationTicker() {
  // Double the items for seamless loop
  const items = [...inspirations, ...inspirations];

  return (
    <div className="overflow-hidden py-2">
      <div className="flex gap-4 animate-[ticker_30s_linear_infinite] hover:[animation-play-state:paused]">
        {items.map((item, i) => (
          <span
            key={`${item.dest}-${i}`}
            className="shrink-0 text-[13px] text-white/60 font-medium whitespace-nowrap"
          >
            {item.flag} {item.dest} <span className="text-amber-300">{item.price}</span>
            <span className="mx-2 text-white/20">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
