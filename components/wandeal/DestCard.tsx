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
  MapPin,
  Car,
  TrainFront,
  Bike,
  Clock,
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

function isNearby(dest: Destination, transports?: TransportMode[]): boolean {
  if (dest.isLocal || dest.flightPrice === 0) return true;
  // If the AI chose a ground transport for this destination
  if (dest.transportMode && dest.transportMode !== "plane") return true;
  // If only ground transport selected
  if (transports && transports.length > 0 && !transports.includes("plane")) return true;
  return false;
}

function buildDirectionsUrl(dest: Destination, originCity?: string): string {
  const from = encodeURIComponent(originCity || "");
  const to = encodeURIComponent(`${dest.name}, ${dest.country}`);
  return `https://www.google.com/maps/dir/${from}/${to}/`;
}

function buildFlightUrl(dest: Destination): string {
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

type TransportMode = "plane" | "train" | "car" | "bike";

interface DestCardProps {
  dest: Destination;
  originCity?: string;
  transports?: TransportMode[];
  isFavorite?: boolean;
  onToggleFavorite?: (dest: Destination) => void;
}

const transportDisplay: Record<TransportMode, { icon: typeof Plane; label: string }> = {
  plane: { icon: Plane, label: "Vol" },
  train: { icon: TrainFront, label: "Train" },
  car: { icon: Car, label: "Trajet" },
  bike: { icon: Bike, label: "Velo" },
};

export function DestCard({ dest, originCity, transports, isFavorite, onToggleFavorite }: DestCardProps) {
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
      className="rounded-[20px] overflow-hidden bg-white border border-[#E5E7EB] transition-all duration-250"
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/80 text-[#4B5563]">
              <CalendarDays size={13} />
              {dateLabel}
              {dest.datePeriodLabel && (
                <span className="font-semibold text-[#264044]">· {dest.datePeriodLabel}</span>
              )}
            </span>
          )}
          {(() => {
            const nearby = isNearby(dest, transports);
            const mode = (dest.transportMode as TransportMode) || (transports?.length === 1 ? transports[0] : nearby ? "car" : "plane");
            const display = transportDisplay[mode] || transportDisplay.plane;
            const TransportIcon = display.icon;
            const hasDistance = dest.distanceKm && dest.distanceKm > 0;
            const hasTime = dest.travelHours && dest.travelHours > 0;
            const fmtTime = hasTime ? (dest.travelHours! >= 1 ? `${Math.floor(dest.travelHours!)}h${dest.travelHours! % 1 >= 0.5 ? "30" : ""}` : `${Math.round(dest.travelHours! * 60)}min`) : null;

            return (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/80 text-[#4B5563]">
                <TransportIcon size={13} />
                {nearby && dest.flightPrice === 0 ? t("reachable") : `~${dest.flightPrice}€`}
                {hasDistance && <span className="text-[#9CA3AF]">· {dest.distanceKm}km</span>}
                {fmtTime && <span className="text-[#9CA3AF]">· {fmtTime}</span>}
              </span>
            );
          })()}
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/80 text-[#4B5563]">
            <Hotel size={13} />
            ~{dest.hotelPerNight}€/{t("perNight")}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/80 text-[#4B5563]">
            <WeatherIc size={13} />
            <Thermometer size={11} />
            {dest.tempMin}-{dest.tempMax}°
          </span>
          {dest.mealPrice > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/80 text-[#4B5563]">
              <UtensilsCrossed size={13} />
              {dest.mealPrice}€/repas
            </span>
          )}
          {dest.fritesPrice > 0 && (
            <span className="group/frites inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/80 text-[#4B5563] transition-all duration-200 hover:scale-110 hover:bg-[#264044] hover:text-white cursor-default">
              🍟 {dest.fritesPrice}€
              <span className="max-w-0 overflow-hidden opacity-0 group-hover/frites:max-w-[80px] group-hover/frites:opacity-100 transition-all duration-300 whitespace-nowrap">la frite</span>
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
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-medium text-[#4B5563] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors cursor-pointer"
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
            href={isNearby(dest, transports) ? buildDirectionsUrl(dest, originCity) : buildFlightUrl(dest)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <ShimmerButton
              background="#264044"
              shimmerColor="rgba(255,255,255,0.2)"
              borderRadius="16px"
              className="w-full py-2.5 text-sm font-medium"
            >
              <span className="inline-flex items-center gap-1.5">
                {isNearby(dest, transports) ? (
                  <><MapPin size={13} /> {t("getDirections")}</>
                ) : (
                  <><ExternalLink size={13} /> {t("seeFlights")}</>
                )}
              </span>
            </ShimmerButton>
          </a>
        </div>
      </div>
    </motion.div>
  );
}
