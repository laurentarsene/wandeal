"use client";

import { useState } from "react";
import { Star, Coins, Home, Heart, RefreshCw, Share2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { BlurFade } from "@/components/ui/blur-fade";
import { DestCard } from "./DestCard";
import type { Destination, SearchFormData } from "@/lib/types";

type Filter = "match" | "cheap" | "local" | "fav";

interface ResultsGridProps {
  results: Destination[];
  form: SearchFormData;
  favorites: Destination[];
  isFavorite: (dest: Destination) => boolean;
  onToggleFavorite: (dest: Destination) => void;
  onRelaunch?: () => void;
}

export function ResultsGrid({ results, form, favorites, isFavorite, onToggleFavorite, onRelaunch }: ResultsGridProps) {
  const t = useTranslations("results");
  const locale = useLocale();
  const [filter, setFilter] = useState<Filter>("match");

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString(locale, { day: "numeric", month: "short" });
  };

  const filterPills: { key: Filter; label: string; icon: typeof Star }[] = [
    { key: "match", label: t("filterMatch"), icon: Star },
    { key: "cheap", label: t("filterCheap"), icon: Coins },
    { key: "local", label: t("filterLocal"), icon: Home },
    { key: "fav", label: t("filterFav"), icon: Heart },
  ];

  const filtered = (() => {
    switch (filter) {
      case "cheap":
        return [...results].sort((a, b) => a.totalPerPerson - b.totalPerPerson);
      case "local":
        return results.filter((d) => d.isLocal);
      case "fav":
        return favorites;
      case "match":
      default:
        return [...results].sort((a, b) => b.matchScore - a.matchScore);
    }
  })();

  const dateRange =
    form.dateFrom && form.dateTo
      ? `${formatDate(form.dateFrom)} → ${formatDate(form.dateTo)}`
      : t("flexible");

  const favCount = favorites.length;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* Summary bar */}
      <BlurFade delay={0}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-[#F7F7F7] border border-[#E5E7EB] rounded-[20px] px-5 py-3 mb-5">
          <p className="text-sm text-[#4B5563]">
            {form.city || t("everywhere")} · {dateRange} · {form.travelers} pers.
            {form.budgetEnabled ? ` · max ${form.budget}€/pers.` : ""}
            {form.durationEnabled ? ` · ~${form.duration}j` : ""}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-[#264044]">
              {t("destinations", { count: filtered.length })}
            </p>
            {onRelaunch && (
              <button
                onClick={onRelaunch}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#264044] bg-[#e8f0f1] hover:bg-[#d5e7e9] transition-colors cursor-pointer"
              >
                <RefreshCw size={12} />
                {t("relaunch")}
              </button>
            )}
            <button
              onClick={() => {
                const interests = form.interests.length > 0 ? form.interests.join(", ") : "toutes envies";
                const text = `${form.city} · ${interests}${form.budgetEnabled ? ` · max ${form.budget}€` : ""}\n${filtered.length} destinations trouvées\n\nwandeal.vercel.app`;
                if (navigator.share) {
                  navigator.share({ title: "Wandeal — Ma recherche", text }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(text);
                }
              }}
              className="inline-flex items-center justify-center w-8 h-8 rounded-full text-[#9CA3AF] hover:bg-[#E5E7EB] transition-colors cursor-pointer"
            >
              <Share2 size={14} />
            </button>
          </div>
        </div>
      </BlurFade>

      {/* Filter pills */}
      <BlurFade delay={0.06}>
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {filterPills.map((pill) => {
            const active = filter === pill.key;
            const showCount = pill.key === "fav" && favCount > 0;
            return (
              <button
                key={pill.key}
                onClick={() => setFilter(pill.key)}
                className={`
                  shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer
                  ${active ? "bg-[#264044] text-white" : "bg-white text-[#4B5563] border border-[#E5E7EB] hover:border-[#D1D5DB]"}
                `}
              >
                <pill.icon size={14} className={pill.key === "fav" && active ? "fill-red-400 text-red-400" : ""} />
                {pill.label}
                {showCount && (
                  <span className={`text-xs ${active ? "text-white/70" : "text-[#9CA3AF]"}`}>
                    {favCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </BlurFade>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((dest, idx) => (
            <BlurFade key={`${dest.name}-${dest.country}`} delay={idx * 0.06}>
              <DestCard
                dest={dest}
                originCity={form.city}
                transports={form.transport}
                isFavorite={isFavorite(dest)}
                onToggleFavorite={onToggleFavorite}
              />
            </BlurFade>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Heart size={32} className="mx-auto mb-3 text-[#D1D5DB]" />
          <p className="text-sm text-[#9CA3AF]">{t("noFavorites")}</p>
        </div>
      )}
    </div>
  );
}
