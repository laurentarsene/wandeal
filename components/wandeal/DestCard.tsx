"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
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

interface DestCardProps {
  dest: Destination;
}

export function DestCard({ dest }: DestCardProps) {
  const t = useTranslations("results");
  const [expanded, setExpanded] = useState(false);
  const theme = colorThemes[dest.colorTheme] || colorThemes.teal;
  const WeatherIc = weatherIconMap[dest.weatherIcon] || Sun;

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
        {/* Badge */}
        {(dest.isLocal || dest.isSurprise) && (
          <div className="absolute top-4 right-4">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white border"
              style={{
                borderColor: dest.isSurprise ? "#264044" : theme.stripe,
                color: dest.isSurprise ? "#264044" : theme.text,
              }}
            >
              {dest.isLocal ? (
                <>
                  <Home size={12} /> {t("badgeLocal")}
                </>
              ) : (
                <>
                  <Sparkles size={12} /> {t("badgeSurprise")}
                </>
              )}
            </span>
          </div>
        )}

        {/* Destination name + price */}
        <div className="flex items-start justify-between pr-24 sm:pr-28">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{dest.flag}</span>
              <h3
                className="text-xl font-extrabold"
                style={{ color: theme.text }}
              >
                {dest.name}
              </h3>
            </div>
            <p className="text-sm" style={{ color: theme.text, opacity: 0.7 }}>
              {dest.country}
            </p>
          </div>
          <div className="text-right shrink-0">
            <div
              className="text-2xl font-extrabold"
              style={{ color: theme.text }}
            >
              <NumberTicker
                value={dest.totalPerPerson}
                className="!text-inherit"
              />{" "}
              €
            </div>
            <p
              className="text-xs"
              style={{ color: theme.text, opacity: 0.6 }}
            >
              / pers. est.
            </p>
          </div>
        </div>

        {/* Info pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/80 text-[#4B5563]">
            <Plane size={13} />
            {t("flight", { price: dest.flightPrice })}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/80 text-[#4B5563]">
            <Hotel size={13} />
            {t("hotel", { price: dest.hotelPerNight })}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/80 text-[#4B5563]">
            <WeatherIc size={13} />
            <Thermometer size={11} />
            {dest.tempMin}-{dest.tempMax}°
          </span>
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
          {dest.bookingUrl ? (
            <a
              href={dest.bookingUrl}
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
                  {t("book")} <ExternalLink size={13} />
                </span>
              </ShimmerButton>
            </a>
          ) : (
            <ShimmerButton
              background="#264044"
              shimmerColor="rgba(255,255,255,0.2)"
              borderRadius="12px"
              className="flex-1 py-2.5 text-sm font-medium"
            >
              <span className="inline-flex items-center gap-1.5">
                {t("seeFlights")} <ExternalLink size={13} />
              </span>
            </ShimmerButton>
          )}
        </div>
      </div>
    </motion.div>
  );
}
