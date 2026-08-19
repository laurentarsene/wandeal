"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations, useLocale } from "next-intl";
import {
  Plane,
  Hotel,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
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
  Share2,
} from "lucide-react";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { NumberTicker } from "@/components/ui/number-ticker";
import { ScoreBar } from "./ScoreBar";
import { buildDirectionsUrl } from "@/lib/affiliate";
import type { Destination, WeatherIcon, TransportMode } from "@/lib/types";
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

const transportIcons: Record<TransportMode, typeof Plane> = {
  plane: Plane,
  train: TrainFront,
  car: Car,
  bike: Bike,
};

/**
 * A destination is "nearby" when directions serve the traveller better than a
 * flight search. The model's per-destination transportMode is a suggestion, not
 * an instruction: it happily picks "car" for a 1400 km trip, and turning that
 * into a driving route throws away both the useful action and the commission.
 */
function isNearby(dest: Destination, transports?: TransportMode[]): boolean {
  // The traveller explicitly ruled out flying
  if (transports && transports.length > 0 && !transports.includes("plane")) return true;
  if (dest.isLocal) return true;

  const ground = Boolean(dest.transportMode && dest.transportMode !== "plane");
  if (!ground) return false;

  // Only a *known* short distance justifies a driving route over a flight
  // search. The model omits distanceKm almost every time, and treating that
  // silence as "it must be close" turned distant destinations into Google Maps
  // links — no useful action for the traveller, no commission for us.
  return typeof dest.distanceKm === "number" && dest.distanceKm > 0 && dest.distanceKm <= 700;
}

interface DestCardProps {
  dest: Destination;
  originCity?: string;
  transports?: TransportMode[];
  travelers?: number;
  isFavorite?: boolean;
  onToggleFavorite?: (dest: Destination) => void;
}

export function DestCard({
  dest,
  originCity,
  transports,
  travelers = 1,
  isFavorite,
  onToggleFavorite,
}: DestCardProps) {
  const t = useTranslations("results");
  const tA11y = useTranslations("a11y");
  const tSeason = useTranslations("season");
  const locale = useLocale();
  const [expanded, setExpanded] = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [toast, setToast] = useState(false);
  const showToast = useCallback(() => {
    setToast(true);
    setTimeout(() => setToast(false), 2000);
  }, []);
  const theme = colorThemes[dest.colorTheme] || colorThemes.teal;
  const WeatherIc = weatherIconMap[dest.weatherIcon] || Sun;

  const fmtDate = (s: string) => {
    if (!s) return "";
    const d = new Date(s + "T00:00:00");
    return d.toLocaleDateString(locale, { day: "numeric", month: "short" });
  };
  const dateLabel =
    dest.dateFrom && dest.dateTo
      ? `${fmtDate(dest.dateFrom)} → ${fmtDate(dest.dateTo)}`
      : null;

  // Travel-period badge — computed server-side from real calendar data, rendered
  // in the user's language here.
  let periodLabel: string | null = null;
  if (dest.datePeriodKey === "weekend") {
    periodLabel = t("periodWeekend");
  } else if (dest.datePeriodKey === "bridge" && dest.datePeriodName) {
    periodLabel = t("periodBridge", { name: dest.datePeriodName });
  } else if (dest.datePeriodKey === "schoolHolidays" && dest.datePeriodName) {
    const season = dest.datePeriodName.match(
      /^(Printemps|Été|Automne|Noël|Détente|Pâques|Carnaval)/
    );
    const seasonKeys: Record<string, string> = {
      Printemps: "spring",
      Été: "summer",
      Automne: "autumn",
      Noël: "christmas",
      Détente: "relax",
      Pâques: "easter",
      Carnaval: "carnival",
    };
    const year = dest.datePeriodName.match(/\d{4}/)?.[0];
    const key = season ? seasonKeys[season[1]] : undefined;
    periodLabel = key
      ? `${tSeason(key)}${year ? ` ${year}` : ""}`
      : t("periodHolidays", { name: dest.datePeriodName });
  }

  const photos = dest.photoUrls?.length
    ? dest.photoUrls
    : dest.photoUrl
      ? [dest.photoUrl]
      : [];
  const nearby = isNearby(dest, transports);
  // When the IATA lookup fails there is no flight link to offer. Falling through
  // to nothing left the card with no primary action at all, so hotels take the
  // slot — still the useful next step, and still monetised.
  const primary: { url: string; kind: "directions" | "flights" | "hotels" } | null = nearby
    ? { url: buildDirectionsUrl(`${dest.name}, ${dest.country}`, originCity), kind: "directions" }
    : dest.flightUrl
      ? { url: dest.flightUrl, kind: "flights" }
      : dest.hotelUrl
        ? { url: dest.hotelUrl, kind: "hotels" }
        : null;
  const groupTotal = dest.totalPerPerson * travelers;

  const handleShare = async () => {
    const dates = dateLabel ? ` · ${dateLabel}` : "";
    const nights = t("nightsCount", { count: dest.nights });
    const frites =
      dest.fritesPrice > 0 ? `\n${dest.fritesPrice}€ ${t("fritesLabel")}` : "";
    const text = `${dest.flag} ${dest.name}, ${dest.country}\n~${dest.totalPerPerson}€${t(
      "estimate"
    )} · ${nights}${dates}\n\n${dest.why}${frites}\n\n${t("shareFooter")}`;
    const title = `${dest.name} — Wandeal`;

    // Sharing with the photo attached, when the platform supports files
    if (navigator.share && dest.photoUrl) {
      try {
        const res = await fetch(dest.photoUrl);
        const blob = await res.blob();
        const file = new File([blob], `${dest.name}.jpg`, { type: blob.type });
        if (!navigator.canShare || navigator.canShare({ files: [file] })) {
          await navigator.share({ title, text, files: [file] });
          return;
        }
      } catch {
        // Fall through to text-only sharing
      }
    }
    if (navigator.share) {
      try {
        await navigator.share({ title, text });
        return;
      } catch {
        // User dismissed, or sharing is unavailable
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      showToast();
    } catch {
      // Clipboard blocked — nothing useful left to do
    }
  };

  return (
    <motion.article
      className="relative rounded-[20px] overflow-hidden bg-white border border-[#E5E7EB] transition-all duration-250 h-full flex flex-col"
      whileHover={{
        y: -3,
        borderColor: "#1C48CD",
        boxShadow: "0 8px 32px rgba(28,72,205,0.15)",
      }}
    >
      {/* Photo carousel */}
      {photos.length > 0 && (
        <div
          className="relative h-40 overflow-hidden group/photo bg-[#F3F4F6]"
          onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchStart === null) return;
            const diff = touchStart - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50 && photos.length > 1) {
              setPhotoIdx((i) =>
                diff > 0
                  ? (i + 1) % photos.length
                  : (i - 1 + photos.length) % photos.length
              );
            }
            setTouchStart(null);
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photos[photoIdx % photos.length]}
            alt={`${dest.name}, ${dest.country}`}
            className="w-full h-full object-cover transition-opacity duration-300"
            loading="lazy"
            decoding="async"
          />
          {photos.length > 1 && (
            <>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                {photos.map((url, i) => (
                  <button
                    key={url}
                    type="button"
                    aria-label={tA11y("goToPhoto", { index: i + 1 })}
                    aria-current={i === photoIdx % photos.length}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPhotoIdx(i);
                    }}
                    className={`h-1.5 rounded-full transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 ${
                      i === photoIdx % photos.length ? "bg-white w-3" : "bg-white/50 w-1.5"
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                aria-label={tA11y("prevPhoto")}
                onClick={(e) => {
                  e.stopPropagation();
                  setPhotoIdx((i) => (i - 1 + photos.length) % photos.length);
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white opacity-100 lg:opacity-0 lg:group-hover/photo:opacity-100 lg:focus-visible:opacity-100 transition-opacity cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                aria-label={tA11y("nextPhoto")}
                onClick={(e) => {
                  e.stopPropagation();
                  setPhotoIdx((i) => (i + 1) % photos.length);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white opacity-100 lg:opacity-0 lg:group-hover/photo:opacity-100 lg:focus-visible:opacity-100 transition-opacity cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
          {/* Warm the browser cache for the other photos in the carousel */}
          {photos.slice(1).map((url) => (
            <link key={url} rel="preload" as="image" href={url} />
          ))}
          {onToggleFavorite && (
            <button
              type="button"
              aria-label={isFavorite ? tA11y("removeFavorite") : tA11y("addFavorite")}
              aria-pressed={!!isFavorite}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(dest);
              }}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors cursor-pointer"
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
        {photos.length === 0 && onToggleFavorite && (
          <div className="absolute top-4 right-4">
            <button
              type="button"
              aria-label={isFavorite ? tA11y("removeFavorite") : tA11y("addFavorite")}
              aria-pressed={!!isFavorite}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(dest);
              }}
              className="p-1.5 rounded-full hover:bg-white/50 transition-colors cursor-pointer"
            >
              <Heart
                size={18}
                className={isFavorite ? "fill-red-500 text-red-500" : "text-[#6B7280]"}
              />
            </button>
          </div>
        )}

        {/* Destination name + price */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl" aria-hidden="true">
                {dest.flag}
              </span>
              <h3 className="text-xl font-extrabold" style={{ color: theme.text }}>
                {dest.name}
              </h3>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm" style={{ color: theme.text, opacity: 0.75 }}>
                {dest.country}
              </p>
              {(dest.isLocal || dest.isSurprise) && (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border"
                  style={{
                    borderColor: dest.isSurprise ? "#1C48CD" : theme.stripe,
                    color: dest.isSurprise ? "#1C48CD" : theme.text,
                  }}
                >
                  {dest.isLocal ? (
                    <>
                      <Home size={10} /> {t("badgeLocal")}
                    </>
                  ) : (
                    <>
                      <Sparkles size={10} /> {t("badgeSurprise")}
                    </>
                  )}
                </span>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xl font-extrabold" style={{ color: theme.text }}>
              ~<NumberTicker value={dest.totalPerPerson} className="!text-inherit" /> €
            </div>
            <p
              className="text-[11px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-full mt-1"
              style={{ backgroundColor: theme.stripe + "26", color: theme.text }}
            >
              {t("estimate")}
            </p>
            {travelers > 1 && (
              <p className="text-[11px] mt-1" style={{ color: theme.text, opacity: 0.75 }}>
                {t("groupTotal", { total: groupTotal, count: travelers })}
              </p>
            )}
          </div>
        </div>

        {/* Info pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          {dateLabel && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/90 text-[#4B5563]">
              <CalendarDays size={13} />
              {dateLabel}
              {periodLabel && (
                <span className="font-semibold text-[#1C48CD]">· {periodLabel}</span>
              )}
            </span>
          )}
          {(() => {
            const mode: TransportMode =
              dest.transportMode ||
              (transports?.length === 1 ? transports[0] : nearby ? "car" : "plane");
            const TransportIcon = transportIcons[mode] || Plane;
            const hasDistance = !!dest.distanceKm && dest.distanceKm > 0;
            const hours = dest.travelHours;
            const fmtTime =
              hours && hours > 0
                ? hours >= 1
                  ? `${Math.floor(hours)}h${hours % 1 >= 0.5 ? "30" : ""}`
                  : `${Math.round(hours * 60)}min`
                : null;

            return (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/90 text-[#4B5563]">
                <TransportIcon size={13} />
                {nearby && dest.flightPrice === 0 ? t("reachable") : `~${dest.flightPrice}€`}
                {hasDistance && mode !== "train" && mode !== "plane" && (
                  <span className="text-[#6B7280]">· {dest.distanceKm}km</span>
                )}
                {fmtTime && <span className="text-[#6B7280]">· {fmtTime}</span>}
              </span>
            );
          })()}
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/90 text-[#4B5563]">
            <Hotel size={13} />~{dest.hotelPerNight}€/{t("perNight")}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/90 text-[#4B5563]">
            <WeatherIc size={13} />
            <Thermometer size={11} />
            {dest.tempMin}-{dest.tempMax}°
          </span>
          {dest.mealPrice > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/90 text-[#4B5563]">
              <UtensilsCrossed size={13} />
              {dest.mealPrice}€/{t("perMeal")}
            </span>
          )}
          {dest.fritesPrice > 0 && (
            <span className="group/frites inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/90 text-[#4B5563] transition-all duration-200 hover:scale-110 hover:bg-[#1C48CD] hover:text-white cursor-default">
              <span aria-hidden="true">🍟</span> {dest.fritesPrice}€
              <span className="max-w-0 overflow-hidden opacity-0 group-hover/frites:max-w-[120px] group-hover/frites:opacity-100 transition-all duration-300 whitespace-nowrap">
                {t("fritesLabel")}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        <ScoreBar score={dest.matchScore} />

        <p className="text-sm text-[#4B5563] leading-relaxed mt-3">{dest.why}</p>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-4 overflow-hidden"
            >
              {dest.activities.length > 0 && (
                <>
                  <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#6B7280] mb-2">
                    {t("activities")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {dest.activities.map((act) => (
                      <span
                        key={act}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#EEF2FF] text-[#1e2a4a]"
                      >
                        {act}
                      </span>
                    ))}
                  </div>
                </>
              )}

              {dest.matchedInterests.length > 0 && (
                <div className="mt-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#6B7280] mb-2">
                    {t("matchedInterests")}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {dest.matchedInterests.map((interest) => (
                      <span
                        key={interest}
                        className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#1C48CD] text-white"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex gap-2 mt-4 pt-4 mt-auto">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            aria-label={expanded ? tA11y("collapse") : tA11y("expand")}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl text-sm font-medium text-[#4B5563] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors cursor-pointer"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button
            type="button"
            onClick={handleShare}
            aria-label={tA11y("share")}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl text-sm font-medium text-[#4B5563] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors cursor-pointer"
          >
            <Share2 size={14} />
          </button>
          {primary && (
            <a
              href={primary.url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="flex-1"
            >
              <ShimmerButton
                background="#1C48CD"
                shimmerColor="rgba(255,255,255,0.2)"
                borderRadius="16px"
                className="w-full py-2.5 text-sm font-medium"
              >
                <span className="inline-flex items-center gap-1.5">
                  {primary.kind === "directions" && (
                    <>
                      <MapPin size={13} /> {t("getDirections")}
                    </>
                  )}
                  {primary.kind === "flights" && (
                    <>
                      <ExternalLink size={13} /> {t("seeFlights")}
                    </>
                  )}
                  {primary.kind === "hotels" && (
                    <>
                      <Hotel size={13} /> {t("seeHotels")}
                    </>
                  )}
                </span>
              </ShimmerButton>
            </a>
          )}
          {dest.hotelUrl && primary?.kind !== "hotels" && (
            <a
              href={dest.hotelUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="flex-1 py-2.5 rounded-2xl text-sm font-medium text-center text-[#1C48CD] bg-[#EEF2FF] hover:bg-[#DEE5FF] transition-colors cursor-pointer"
            >
              <span className="inline-flex items-center gap-1.5">
                <Hotel size={13} />
                {t("seeHotels")}
              </span>
            </a>
          )}
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-[#1C48CD] text-white text-xs font-medium shadow-lg z-10"
          >
            {t("copied")}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
