"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, Coins, Home, Heart, RefreshCw, Share2, Info } from "lucide-react";
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

export function ResultsGrid({
  results,
  form,
  favorites,
  isFavorite,
  onToggleFavorite,
  onRelaunch,
}: ResultsGridProps) {
  const t = useTranslations("results");
  const tA11y = useTranslations("a11y");
  const tForm = useTranslations("form");
  const locale = useLocale();
  const [filter, setFilter] = useState<Filter>("match");
  const [toast, setToast] = useState(false);
  const showToast = useCallback(() => {
    setToast(true);
    setTimeout(() => setToast(false), 2000);
  }, []);

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

  // Each filter deserves its own empty state — showing "no favourites yet" after
  // filtering by price or by local stays is simply wrong.
  const emptyMessage =
    filter === "fav"
      ? t("noFavorites")
      : filter === "local"
        ? t("emptyLocal")
        : t("emptyResults");

  const dateRange =
    form.dateFrom && form.dateTo
      ? `${formatDate(form.dateFrom)} → ${formatDate(form.dateTo)}`
      : t("flexible");

  const favCount = favorites.length;

  const handleShareSearch = async () => {
    const text = `${form.city}${
      form.interests.length > 0 ? ` · ${form.interests.join(", ")}` : ""
    }${form.budgetEnabled ? ` · max ${form.budget}€` : ""}\n${t("destinations", {
      count: filtered.length,
    })}\n\n${t("shareFooter")}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Wandeal", text });
        return;
      } catch {
        // Dismissed
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      showToast();
    } catch {
      // Clipboard blocked
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* Summary bar */}
      <BlurFade delay={0}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-[#F7F7F7] border border-[#E5E7EB] rounded-[20px] px-5 py-3 mb-3">
          <p className="text-sm text-[#4B5563]">
            {form.city || t("everywhere")} · {dateRange} · {form.travelers}{" "}
            {form.travelers > 1 ? tForm("persons") : tForm("person")}
            {form.budgetEnabled ? ` · max ${form.budget}€` : ""}
            {form.durationEnabled ? ` · ~${form.duration} ${tForm("durationDays")}` : ""}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-[#1C48CD]">
              {t("destinations", { count: filtered.length })}
            </p>
            {onRelaunch && (
              <button
                type="button"
                onClick={onRelaunch}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#1C48CD] bg-[#EEF2FF] hover:bg-[#DEE5FF] transition-colors cursor-pointer"
              >
                <RefreshCw size={12} />
                {t("relaunch")}
              </button>
            )}
            <button
              type="button"
              onClick={handleShareSearch}
              aria-label={tA11y("shareSearch")}
              className="inline-flex items-center justify-center w-8 h-8 rounded-full text-[#6B7280] hover:bg-[#E5E7EB] transition-colors cursor-pointer"
            >
              <Share2 size={14} />
            </button>
          </div>
        </div>
      </BlurFade>

      {/* Price + affiliate transparency — required, and it builds trust */}
      <BlurFade delay={0.03}>
        <p className="flex items-start gap-2 text-[11px] leading-relaxed text-[#6B7280] mb-4 px-1">
          <Info size={13} className="shrink-0 mt-0.5" />
          <span>
            {t("priceDisclaimer")} {t("affiliateNote")}
          </span>
        </p>
      </BlurFade>

      {/* Filter pills */}
      <BlurFade delay={0.06}>
        <div
          role="tablist"
          aria-label={t("filterMatch")}
          className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide"
        >
          {filterPills.map((pill) => {
            const active = filter === pill.key;
            const showCount = pill.key === "fav" && favCount > 0;
            return (
              <button
                key={pill.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(pill.key)}
                className={`
                  shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer
                  ${active ? "bg-[#1C48CD] text-white" : "bg-white text-[#4B5563] border border-[#E5E7EB] hover:border-[#D1D5DB]"}
                `}
              >
                <pill.icon
                  size={14}
                  className={pill.key === "fav" && active ? "fill-red-400 text-red-400" : ""}
                />
                {pill.label}
                {showCount && (
                  <span className={active ? "text-xs text-white/80" : "text-xs text-[#6B7280]"}>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
          {filtered.map((dest, idx) => (
            <BlurFade key={`${dest.name}-${dest.country}`} delay={Math.min(idx, 8) * 0.06}>
              <DestCard
                dest={dest}
                originCity={form.city}
                transports={form.transport}
                travelers={form.travelers}
                isFavorite={isFavorite(dest)}
                onToggleFavorite={onToggleFavorite}
              />
            </BlurFade>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Heart size={32} className="mx-auto mb-3 text-[#D1D5DB]" />
          <p className="text-sm text-[#6B7280]">{emptyMessage}</p>
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full bg-[#1C48CD] text-white text-sm font-medium shadow-lg z-50"
          >
            {t("copied")}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
