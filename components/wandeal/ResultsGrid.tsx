"use client";

import { Star, Coins, Home, Heart } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { BlurFade } from "@/components/ui/blur-fade";
import { DestCard } from "./DestCard";
import type { Destination, SearchFormData } from "@/lib/types";

interface ResultsGridProps {
  results: Destination[];
  form: SearchFormData;
}

export function ResultsGrid({ results, form }: ResultsGridProps) {
  const t = useTranslations("results");
  const locale = useLocale();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString(locale, { day: "numeric", month: "short" });
  };

  const filterPills = [
    { label: t("filterMatch"), icon: Star },
    { label: t("filterCheap"), icon: Coins },
    { label: t("filterLocal"), icon: Home },
    { label: t("filterFav"), icon: Heart },
  ];

  const dateRange =
    form.dateFrom && form.dateTo
      ? `${formatDate(form.dateFrom)} → ${formatDate(form.dateTo)}`
      : t("flexible");

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* Summary bar */}
      <BlurFade delay={0}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-[#F7F7F7] border border-[#E5E7EB] rounded-[14px] px-5 py-3 mb-5">
          <p className="text-sm text-[#4B5563]">
            {form.city || t("everywhere")} · {dateRange} · {form.travelers} pers.
            {form.budgetEnabled ? ` · max ${form.budget}€/pers.` : ""}
            {form.durationEnabled ? ` · ~${form.duration}j` : ""}
          </p>
          <p className="text-sm font-bold text-[#264044]">
            {t("destinations", { count: results.length })}
          </p>
        </div>
      </BlurFade>

      {/* Filter pills */}
      <BlurFade delay={0.06}>
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {filterPills.map((pill, i) => (
            <button
              key={pill.label}
              className={`
                shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer
                ${i === 0 ? "bg-[#264044] text-white" : "bg-white text-[#4B5563] border border-[#E5E7EB] hover:border-[#D1D5DB]"}
              `}
            >
              <pill.icon size={14} />
              {pill.label}
            </button>
          ))}
        </div>
      </BlurFade>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map((dest, idx) => (
          <BlurFade key={`${dest.name}-${dest.country}`} delay={idx * 0.06}>
            <DestCard dest={dest} />
          </BlurFade>
        ))}
      </div>
    </div>
  );
}
