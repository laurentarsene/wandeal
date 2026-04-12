"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useTranslations, useLocale } from "next-intl";
import {
  Plane,
  Hotel,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Home,
  Sparkles,
  Sun,
  Cloud,
  Snowflake,
  CloudRain,
  Thermometer,
  UtensilsCrossed,
  Heart,
  CalendarDays,
} from "lucide-react";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { NumberTicker } from "@/components/ui/number-ticker";
import { ScoreBar } from "./ScoreBar";
import type { Destination, WeatherIcon } from "@/lib/types";
import { colorThemes } from "@/lib/types";

const weatherIconMap: Record<
  WeatherIcon,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  sun: Sun,
  cloud: Cloud,
  snow: Snowflake,
  rain: CloudRain,
};

function toYYMMDD(dateStr: string): string {
  // "2026-06-15" → "260615"
  return dateStr.slice(2, 4) + dateStr.slice(5, 7) + dateStr.slice(8, 10);
}

function buildSearchUrl(dest: Destination): string {
  const from = dest.originIata?.toLowerCase();
  const to = dest.destIata?.toLowerCase();
  const hasDates = dest.dateFrom && dest.dateTo;

  // Both IATA codes → Skyscanner
  if (from && to) {
    const base = `https://www.skyscanner.net/transport/flights/${from}/${to}`;
    return hasDates ? `${base}/${toYYMMDD(dest.dateFrom)}/${toYYMMDD(dest.dateTo)}/` : `${base}/`;
  }

  // Missing origin or dest → Google Flights with dates in natural language
  const parts = ["flights"];
  if (from) parts.push(`from ${from.toUpperCase()}`);
  parts.push(`to ${dest.name}`);
  if (hasDates) {
    const fmt = (s: string) => {
      const d = new Date(s + "T00:00:00");
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };
    parts.push(`on ${fmt(dest.dateFrom)} to ${fmt(dest.dateTo)}`);
  }
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(parts.join(" "))}`;
}

interface DestCardProps {
  dest: Destination;
  isFavorite?: boolean;
  onToggleFavorite?: (dest: Destination) => void;
}

export function DestCard({ dest, isFavorite, onToggleFavorite }: DestCardProps) {
  const t = useTranslations("results");
  const locale = useLocale();
  const [expanded, setExpanded] = useState(false);
  const theme = colorThemes[dest.colorTheme] || colorThemes.teal;
  const WeatherIc = weatherIconMap[dest.weatherIcon] || Sun;

  const fmtDate = (s: string) => {
    if (!s) return "";
    const d = new Date(s + "T00:00:00");
    return d.toLocaleDateString(locale, { day: "numeric", month: "short" });
  };
  const dateLabel = dest.dateFrom && dest.dateTo
    ? `${fmtDate(dest.dateFrom)} → ${fmtDate(dest.dateTo)}`
    : null;

  return (
    <motion.div
      className="rounded-2xl overflow-hidden bg-white border border-[#E5E7EB] transition-all duration-250"
      whileHover={{
        y: -3,
        borderColor: "#264044",
        boxShadow: "0 8px 32px rgba(38,64,68,0.15)",
      }}
    >
      {/* Photo */}
      {dest.photoUrl && (
        <div className="relative h-36 overflow-hidden">
          <img
            src={dest.photoUrl}
            alt={dest.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          {onToggleFavorite && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(dest); }}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors cursor-pointer"
            >
              <Heart
                size={18}
                className={isFavorite ? "fill-red-500 text-red-500" : "text-white"}
              />
            </button>
          )}
        </div>
      )}

      {/* Header */}
      <div
        className="p-5 relative"
        style={{
          backgroundColor: theme.bg,
          borderBottom: `3px solid ${theme.stripe}`,
        }}
      >
        {/* Fav button (no photo fallback) */}
        {!dest.photoUrl && onToggleFavorite && (
          <div className="absolute top-4 right-4">
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(dest); }}
              className="p-1.5 rounded-full hover:bg-white/50 transition-colors cursor-pointer"
            >
              <Heart
                size={18}
                className={isFavorite ? "fill-red-500 text-red-500" : "text-[#9CA3AF] hover:text-[#6B7280]"}
              />
            </button>
          </div>
        )}

        {/* Destination name + price */}
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{dest.flag}</span>
              <h3
                className="text-xl font-extrabold"
                style={{ color: theme.text }}
              >
                {dest.name}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm" style={{ color: theme.text, opacity: 0.7 }}>
                {dest.country}
              </p>
              {(dest.isLocal || dest.isSurprise) && (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border"
                  style={{
                    borderColor: dest.isSurprise ? "#264044" : theme.stripe,
                    color: dest.isSurprise ? "#264044" : theme.text,
                  }}
                >
                  {dest.isLocal ? (
                    <><Home size={10} /> {t("badgeLocal")}</>
                  ) : (
                    <><Sparkles size={10} /> {t("badgeSurprise")}</>
                  )}
                </span>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div
              className="text-2xl font-extrabold"
              style={{ color: theme.text }}
            >
              ~<NumberTicker
                value={dest.totalPerPerson}
                className="!text-inherit"
              />{" "}
              €
            </div>
            <p
              className="text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-full mt-1"
              style={{ backgroundColor: theme.stripe + "20", color: theme.text, opacity: 0.8 }}
            >
              {t("estimate")}
            </p>
          </div>
        </div>

        {/* Info pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          {dateLabel && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/80 text-[#4B5563]">
              <CalendarDays size={13} />
              {dateLabel}
              {dest.datePeriodLabel && (
                <span className="font-semibold text-[#264044]">· {dest.datePeriodLabel}</span>
              )}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/80 text-[#4B5563]">
            <Plane size={13} />
            ~{dest.flightPrice}€
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/80 text-[#4B5563]">
            <Hotel size={13} />
            ~{dest.hotelPerNight}€/{t("perNight")}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/80 text-[#4B5563]">
            <WeatherIc size={13} />
            <Thermometer size={11} />
            {dest.tempMin}-{dest.tempMax}°
          </span>
          {dest.mealPrice > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/80 text-[#4B5563]">
              <UtensilsCrossed size={13} />
              {dest.mealPrice}€/repas
            </span>
          )}
          {dest.fritesPrice > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/80 text-[#4B5563]">
              🍟 {dest.fritesPrice}€
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <ScoreBar score={dest.matchScore} />

        <p className="text-sm text-[#555] leading-relaxed mt-3">{dest.why}</p>

        {/* Expanded section */}
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-4"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#9CA3AF] mb-2">
              {t("activities")}
            </p>
            <div className="flex flex-wrap gap-2">
              {dest.activities.map((act) => (
                <span
                  key={act}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#e8f0f1] text-[#1a2e31]"
                >
                  {act}
                </span>
              ))}
            </div>

            {dest.matchedInterests.length > 0 && (
              <div className="mt-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#9CA3AF] mb-2">
                  {t("matchedInterests")}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {dest.matchedInterests.map((interest) => (
                    <span
                      key={interest}
                      className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#264044] text-white"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-[#4B5563] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors cursor-pointer"
          >
            {expanded ? (
              <>
                {t("seeLess")} <ChevronUp size={14} />
              </>
            ) : (
              <>
                {t("seeMore")} <ChevronDown size={14} />
              </>
            )}
          </button>
          <a
            href={buildSearchUrl(dest)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <ShimmerButton
              background="#264044"
              shimmerColor="rgba(255,255,255,0.2)"
              borderRadius="12px"
              className="w-full py-2.5 text-sm font-medium"
            >
              <span className="inline-flex items-center gap-1.5">
                {t("seeFlights")} <ExternalLink size={13} />
              </span>
            </ShimmerButton>
          </a>
        </div>
      </div>
    </motion.div>
  );
}
