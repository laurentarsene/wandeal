"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import {
  MapPin,
  Users,
  Minus,
  Plus,
  Wallet,
  Clock,
  Search,
  Sparkles,
  CalendarDays,
  Sun,
  TreePine,
  Landmark,
  Wine,
  Mountain,
  Heart,
  Plane,
  TrainFront,
  Car,
  Bike,
  Hotel,
  BedDouble,
  Home,
  Tent,
  ChevronDown,
  History,
  Globe,
  Compass,
  Map,
  Palmtree,
  Umbrella,
  Camera,
} from "lucide-react";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { InterestChips } from "./InterestChips";
import { CityAutocomplete } from "./CityAutocomplete";
import { DateRangePicker } from "./DateRangePicker";
import { HublotVideo } from "./HublotVideo";
import type { SearchFormData, TransportMode, AccommodationType, ComfortLevel, DateConstraintTag } from "@/lib/types";
import { defaultForm } from "@/lib/types";

interface Preset {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  form: Partial<SearchFormData>;
  needsCity?: boolean;
}

const presets: Preset[] = [
  {
    label: "Soleil entre potes pas cher",
    icon: Sun,
    form: {
      travelers: 4,

      budgetEnabled: true,
      budget: 400,
      interests: ["soleil", "plage", "teuf"],
    },
  },
  {
    label: "Famille culture & piscine",
    icon: Landmark,
    form: {
      travelers: 4,

      budgetEnabled: true,
      budget: 1200,
      interests: ["famille", "culture", "detente"],
    },
  },
  {
    label: "Nature solo pour 0€",
    icon: TreePine,
    needsCity: true,
    form: {
      travelers: 1,

      budgetEnabled: true,
      budget: 100,
      transport: ["bike"],
      interests: ["nature", "trek"],
    },
  },
  {
    label: "Escapade gastronomique",
    icon: Wine,
    form: {
      travelers: 2,

      durationEnabled: true,
      duration: 5,
      interests: ["gastronomie", "culture", "citybreak"],
    },
  },
  {
    label: "Aventure montagne",
    icon: Mountain,
    form: {
      travelers: 2,

      budgetEnabled: true,
      budget: 600,
      interests: ["trek", "nature", "ski"],
    },
  },
  {
    label: "Lune de miel",
    icon: Heart,
    form: {
      travelers: 2,

      budgetEnabled: true,
      budget: 2500,
      interests: ["soleil", "detente", "gastronomie"],
    },
  },
];

interface SearchHistoryEntry {
  id: string;
  form: SearchFormData;
  timestamp: number;
  label: string;
}

interface SearchFormProps {
  form: SearchFormData;
  onChange: (form: SearchFormData) => void;
  onSubmit: () => void;
  searchHistory?: SearchHistoryEntry[];
}

function daysBetween(from: string, to: string): number | null {
  if (!from || !to) return null;
  const a = new Date(from + "T00:00:00");
  const b = new Date(to + "T00:00:00");
  const diff = Math.round(
    (b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)
  );
  return diff > 0 ? diff : null;
}

function BentoCard({
  children,
  className = "",
  active = false,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`
        relative rounded-[20px] p-4 lg:p-5 transition-all duration-300 transform-gpu h-full min-h-[100px]
        ${
          active
            ? "bg-[#f0f7f7] [box-shadow:0_0_0_2px_#264044,0_2px_12px_rgba(38,64,68,0.12)]"
            : "bg-white/70 [box-shadow:0_0_0_1px_rgba(0,0,0,0.04),0_1px_4px_rgba(0,0,0,0.03)] hover:bg-white hover:[box-shadow:0_0_0_1px_rgba(0,0,0,0.1),0_4px_12px_rgba(0,0,0,0.06)]"
        }
        ${onClick && !active ? "cursor-pointer group" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

function SectionLabel({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[#9CA3AF] mb-2">
      <Icon size={16} className="text-[#6B7280]" />
      {children}
    </label>
  );
}

const searchIcons = [Plane, Globe, Compass, Map, Palmtree, Umbrella, Camera, TrainFront];

function RotatingIcon() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setIdx((i) => (i + 1) % searchIcons.length), 2000);
    return () => clearInterval(interval);
  }, []);
  const Icon = searchIcons[idx];
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 relative">
      <Icon size={16} className="animate-[fadeScale_0.3s_ease-out]" key={idx} />
    </span>
  );
}

export function SearchForm({ form, onChange, onSubmit, searchHistory = [] }: SearchFormProps) {
  const t = useTranslations("form");
  const tHero = useTranslations("hero");
  const tPresets = useTranslations("presets");
  const [cityHint, setCityHint] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    if (form.city.trim()) setCityHint(false);
  }, [form.city]);

  // Track mobile form visibility for floating CTA
  useEffect(() => {
    const el = document.getElementById("mobile-form");
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => setFormVisible(entry.isIntersecting), { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const update = (partial: Partial<SearchFormData>) => {
    onChange({ ...form, ...partial });
  };

  const daysFromDates = daysBetween(form.dateFrom, form.dateTo);

  const handleDatesChange = (dateFrom: string, dateTo: string) => {
    const newForm = { ...form, dateFrom, dateTo, dateConstraints: [] as DateConstraintTag[] };
    const days = daysBetween(dateFrom, dateTo);
    if (days) {
      newForm.duration = days;
      newForm.durationEnabled = true;
    }
    onChange(newForm);
  };

  const handleConstraintChange = (key: DateConstraintTag) => {
    const current = form.dateConstraints || [];
    const has = current.includes(key);

    // Incompatible groups: holidays vs off-holidays
    const holidayTags: DateConstraintTag[] = ["holidays-wb", "holidays-fl"];
    const incompatible: Record<string, DateConstraintTag[]> = {
      "holidays-wb": ["off-holidays"],
      "holidays-fl": ["off-holidays"],
      "off-holidays": ["holidays-wb", "holidays-fl"],
    };

    let next: DateConstraintTag[];
    if (has) {
      next = current.filter((c) => c !== key);
    } else {
      // Remove incompatible tags
      const toRemove = incompatible[key] || [];
      next = [...current.filter((c) => !toRemove.includes(c)), key];
    }

    const newForm = { ...form, dateConstraints: next, dateFrom: "", dateTo: "" };
    if (next.includes("weekend")) {
      newForm.duration = next.includes("bridge") ? 3 : 2;
      newForm.durationEnabled = true;
    } else if (next.includes("bridge")) {
      newForm.duration = 4;
      newForm.durationEnabled = true;
    }
    onChange(newForm);
  };

  const handleDurationChange = (duration: number) => {
    const newForm = { ...form, duration, durationEnabled: true };
    if (form.dateFrom) {
      const from = new Date(form.dateFrom + "T00:00:00");
      const to = new Date(from.getTime() + duration * 24 * 60 * 60 * 1000);
      const y = to.getFullYear();
      const m = String(to.getMonth() + 1).padStart(2, "0");
      const d = String(to.getDate()).padStart(2, "0");
      newForm.dateTo = `${y}-${m}-${d}`;
    }
    onChange(newForm);
  };

  const applyPreset = (preset: Preset) => {
    const city = form.city.trim() ? form.city : "";
    onChange({ ...defaultForm, ...preset.form, city });
    if (preset.needsCity && !city) {
      setCityHint(true);
    } else {
      setCityHint(false);
    }
    // Scroll to form on mobile
    setTimeout(() => {
      const el = document.getElementById("mobile-form");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      if (preset.needsCity && !city) {
        setTimeout(() => document.querySelector<HTMLInputElement>("[data-city-input]")?.focus(), 500);
      }
    }, 100);
  };

  return (
    <>
      {/* Desktop presets — overlaid on video panel, top area */}

      <div className="min-h-[calc(100dvh-64px)] flex flex-col lg:flex-row">
        {/* Left panel — desktop video + hero overlay */}
        <div className="hidden lg:flex w-[42%] shrink-0 p-5 pt-6">
          <div className="w-full h-[calc(100dvh-104px)] rounded-[44px] overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.1)] sticky top-[80px] relative">
            <HublotVideo variant="tall" />
            {/* Content overlay */}
            <div className="absolute inset-0 rounded-[44px] flex flex-col justify-between p-8" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.05) 55%, rgba(0,0,0,0.7) 100%)" }}>
              {/* Presets — top */}
              <div className="flex flex-col gap-2.5">
                <p className="text-[13px] font-bold text-white/60">
                  {tPresets("title")}
                </p>
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="w-fit flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 text-left text-[12px] font-medium text-white/85 hover:bg-white/20 hover:border-white/25 hover:text-white transition-all cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-xl bg-white/15 flex items-center justify-center shrink-0 group-hover:bg-white/25 transition-colors">
                      <preset.icon size={14} className="text-white/70" />
                    </div>
                    <span className="leading-snug">{preset.label}</span>
                  </button>
                ))}
              </div>
              {/* Hero text — bottom */}
              <div>
                <h1 className="font-[var(--font-vina)] text-4xl xl:text-5xl text-white leading-[1.1]">
                  {tHero("title1")}
                  <br />
                  <span className="text-[#8dd8e0]">
                    {tHero("title2")}
                  </span>
                </h1>
                <p className="text-[15px] text-white/70 mt-3 font-medium">{tHero("madeIn")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel (desktop) / Full width (mobile) */}
        {/* MOBILE: Fullscreen hero with video background */}
        <div className="lg:hidden relative h-[calc(100dvh-64px)] overflow-hidden isolate" style={{ borderRadius: "2.5rem" }}>
          {/* Video background */}
          <div className="absolute inset-0">
            <HublotVideo variant="tall" />
          </div>
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40" />
          {/* Content */}
          <div className="relative h-full flex flex-col justify-between p-6 pt-8">
            {/* Top — presets */}
            <div>
              <p className="text-[13px] font-bold text-white/60 mb-2">
                {tPresets("title")}
              </p>
              <div className="flex flex-wrap gap-2.5">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 text-[12px] font-medium text-white/85 hover:bg-white/20 hover:border-white/25 active:scale-95 transition-all cursor-pointer"
                  >
                    <preset.icon size={14} className="text-white/60" />
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom — hero text + scroll indicator */}
            <div className="text-center">
              <h1 className="font-[var(--font-vina)] text-4xl text-white leading-[1.1]">
                {tHero("title1")}
                <br />
                <span className="text-[#8dd8e0]">{tHero("title2")}</span>
              </h1>
              <p className="text-[13px] text-white/70 mt-2 mb-6 font-medium">{tHero("madeIn")}</p>

              {/* Scroll indicator */}
              <button
                type="button"
                onClick={() => document.getElementById("mobile-form")?.scrollIntoView({ behavior: "smooth" })}
                className="mx-auto flex flex-col items-center gap-1 cursor-pointer"
              >
                <span className="text-[11px] font-semibold text-white/70 tracking-wide">{t("search")}</span>
                <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center animate-bounce">
                  <ChevronDown size={20} className="text-white" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Form section — mobile below hero, desktop in right panel */}
        <div id="mobile-form" className="px-3 sm:px-6 lg:px-6 pt-6 pb-24 sm:pb-4 lg:flex lg:flex-col lg:justify-center lg:w-[58%]">
          <div className="w-full lg:max-w-[900px]">
            {/* Bento Grid */}
            <div className="shrink-0">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-3">
            {/* Where */}
            <BentoCard
              className={`col-span-2 lg:col-span-2 ${cityHint ? "!bg-[#e8f0f1]/50 ![box-shadow:0_0_0_2px_#264044]" : ""}`}
              active={!!form.city}
            >
              <SectionLabel icon={MapPin}>{t("from")}</SectionLabel>
              <CityAutocomplete
                value={form.city}
                onChange={(city) => update({ city })}
              />
              {cityHint ? (
                <p className="text-[10px] text-[#264044] font-medium mt-1 animate-pulse">
                  {t("cityHint")}
                </p>
              ) : !form.city && (
                <p className="text-[10px] text-[#9CA3AF] mt-1">
                  {t("fromHint")}
                </p>
              )}
            </BentoCard>

            {/* Optional filters divider */}
            <div className="col-span-2 lg:col-span-4 flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-[#E5E7EB]" />
              <span className="text-[10px] font-medium text-[#9CA3AF] shrink-0">{t("optionalFilters")}</span>
              <div className="flex-1 h-px bg-[#E5E7EB]" />
            </div>

            {/* Search history */}
            {searchHistory.length > 0 && (
              <div className="col-span-2 lg:col-span-4 flex items-center gap-2 overflow-x-auto scrollbar-hide py-0.5">
                <History size={13} className="text-[#9CA3AF] shrink-0" />
                {searchHistory.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => onChange(entry.form)}
                    className="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium text-[#6B7280] bg-[#F3F4F6] hover:bg-[#E5E7EB] transition-colors cursor-pointer truncate max-w-[200px]"
                  >
                    {entry.label}
                  </button>
                ))}
              </div>
            )}

            {/* When */}
            <BentoCard className="col-span-2" active={!!form.dateFrom || (form.dateConstraints?.length > 0)}>
              <SectionLabel icon={CalendarDays}>{t("dates")}</SectionLabel>
              <DateRangePicker
                dateFrom={form.dateFrom}
                dateTo={form.dateTo}
                onChange={handleDatesChange}
              />
              {!form.dateFrom && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {([
                    { key: "weekend" as DateConstraintTag, label: t("dateWeekend") },
                    { key: "bridge" as DateConstraintTag, label: t("dateBridge") },
                    { key: "holidays-wb" as DateConstraintTag, label: t("dateHolidaysWB") },
                    { key: "holidays-fl" as DateConstraintTag, label: t("dateHolidaysFL") },
                    { key: "off-holidays" as DateConstraintTag, label: t("dateOffHolidays") },
                  ]).map((chip) => {
                    const active = (form.dateConstraints || []).includes(chip.key);
                    return (
                      <button
                        key={chip.key}
                        type="button"
                        onClick={() => handleConstraintChange(chip.key)}
                        className={`
                          px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer
                          ${active
                            ? "bg-[#264044] text-white"
                            : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
                          }
                        `}
                      >
                        {chip.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </BentoCard>

            {/* Travelers */}
            <BentoCard className="col-span-1 flex flex-col" active={true}>
              <SectionLabel icon={Users}>{t("travelers")}</SectionLabel>
              <div className="flex-1 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() =>
                    update({ travelers: Math.max(1, form.travelers - 1) })
                  }
                  className="w-9 h-9 rounded-lg border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:border-[#264044] hover:text-[#264044] hover:bg-[#e8f0f1] transition-all cursor-pointer shrink-0"
                >
                  <Minus size={15} />
                </button>
                <div className="text-center">
                  <span className="text-4xl font-extrabold text-[#111] tabular-nums leading-none">
                    {form.travelers}
                  </span>
                  <span className="block text-[10px] text-[#9CA3AF] mt-1">
                    {form.travelers > 1 ? t("persons") : t("person")}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    update({ travelers: Math.min(10, form.travelers + 1) })
                  }
                  className="w-9 h-9 rounded-lg border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:border-[#264044] hover:text-[#264044] hover:bg-[#e8f0f1] transition-all cursor-pointer shrink-0"
                >
                  <Plus size={15} />
                </button>
              </div>
            </BentoCard>

            {/* Budget */}
            <BentoCard className="col-span-1 flex flex-col" active={form.budgetEnabled} onClick={!form.budgetEnabled ? () => update({ budgetEnabled: true }) : undefined}>
              <div className="flex items-center justify-between">
                <SectionLabel icon={Wallet}>{t("budget")}</SectionLabel>
                {form.budgetEnabled && (
                  <button
                    type="button"
                    onClick={() => update({ budgetEnabled: false })}
                    className="relative w-9 h-5 rounded-full bg-[#264044] cursor-pointer shrink-0"
                  >
                    <div className="absolute top-0.5 left-[18px] w-4 h-4 rounded-full bg-white shadow-sm" />
                  </button>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-center">
                {!form.budgetEnabled ? (
                  <div>
                    <span className="text-sm font-medium text-[#9CA3AF] leading-snug lg:group-hover:hidden block">{t("budgetAll")}</span>
                    <span className="text-sm font-medium text-[#264044] leading-snug hidden lg:group-hover:block">{t("budgetActivate")}</span>
                  </div>
                ) : (
                  <div>
                    <div className="mb-2">
                      <span className="text-3xl font-extrabold text-[#264044] tabular-nums leading-none">
                        {form.budget}€
                      </span>
                      <span className="block text-[10px] text-[#9CA3AF] mt-0.5">
                        {t("budgetPerPerson")}
                      </span>
                    </div>
                <div className="relative w-full h-6 flex items-center">
                  <div className="absolute inset-x-0 h-1.5 rounded-full bg-[#E5E7EB]" />
                  <div
                    className={`absolute left-0 h-1.5 rounded-full transition-colors ${form.budgetEnabled ? "bg-gradient-to-r from-[#264044] to-[#4a9aa8]" : "bg-[#D1D5DB]"}`}
                    style={{ width: `${((form.budget - 100) / 2900) * 100}%` }}
                  />
                  <div
                    className={`absolute w-5 h-5 rounded-full bg-white border-2 shadow-md -translate-x-1/2 pointer-events-none transition-colors ${form.budgetEnabled ? "border-[#264044]" : "border-[#D1D5DB]"}`}
                    style={{ left: `${((form.budget - 100) / 2900) * 100}%` }}
                  />
                  <input
                    type="range"
                    min={100}
                    max={3000}
                    step={50}
                    value={form.budget}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      update({ budget: val, budgetEnabled: true });
                    }}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer"
                  />
                </div>
                <div className="flex justify-between text-[9px] text-[#9CA3AF] mt-0.5">
                  <span>100€</span>
                  <span>3 000€</span>
                </div>
                  </div>
                )}
              </div>
            </BentoCard>

            {/* Duration */}
            {(() => {
              const dc = form.dateConstraints || [];
              const lockedByConstraint = dc.includes("weekend") || dc.includes("bridge");
              const lockedByDates = !!daysFromDates || lockedByConstraint;
              return (
                <BentoCard className="col-span-1 flex flex-col" active={form.durationEnabled || lockedByDates} onClick={!form.durationEnabled && !lockedByDates ? () => update({ durationEnabled: true }) : undefined}>
                  <div className="flex items-center justify-between">
                    <SectionLabel icon={Clock}>{t("duration")}</SectionLabel>
                    {form.durationEnabled && !lockedByDates && (
                      <button
                        type="button"
                        onClick={() => update({ durationEnabled: false })}
                        className="relative w-9 h-5 rounded-full bg-[#264044] cursor-pointer shrink-0"
                      >
                        <div className="absolute top-0.5 left-[18px] w-4 h-4 rounded-full bg-white shadow-sm" />
                      </button>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    {lockedByDates ? (
                      <div className="text-center mb-2">
                        <span className="text-3xl font-extrabold text-[#264044] tabular-nums leading-none">
                          {dc.includes("weekend") && dc.includes("bridge") ? "2-4" : dc.includes("weekend") ? "2-3" : dc.includes("bridge") ? "3-4" : daysFromDates}
                        </span>
                        <span className="text-lg font-bold text-[#264044] ml-1">{t("durationDays")}</span>
                        <span className="block text-[10px] text-[#9CA3AF] mt-1">
                          {lockedByConstraint ? dc.filter(c => c === "weekend" || c === "bridge").map(c => t(c === "weekend" ? "dateWeekend" : "dateBridge")).join(" + ") : t("durationLocked")}
                        </span>
                      </div>
                    ) : !form.durationEnabled ? (
                      <div>
                        <span className="text-sm font-medium text-[#9CA3AF] leading-snug lg:group-hover:hidden block">{t("durationAll")}</span>
                        <span className="text-sm font-medium text-[#264044] leading-snug hidden lg:group-hover:block">{t("durationActivate")}</span>
                      </div>
                    ) : (
                      <div>
                        <div className="mb-2">
                          <span className="text-3xl font-extrabold text-[#264044] tabular-nums leading-none">
                            {form.duration}
                          </span>
                          <span className="text-lg font-bold text-[#264044] ml-1">{t("durationDays")}</span>
                          <span className="block text-[10px] text-[#9CA3AF] mt-0.5">
                            {t("durationApprox")}
                          </span>
                        </div>
                        <div className="relative w-full h-6 flex items-center">
                          <div className="absolute inset-x-0 h-1.5 rounded-full bg-[#E5E7EB]" />
                          <div
                            className={`absolute left-0 h-1.5 rounded-full transition-colors ${form.durationEnabled ? "bg-gradient-to-r from-[#264044] to-[#4a9aa8]" : "bg-[#D1D5DB]"}`}
                            style={{ width: `${((form.duration - 2) / 26) * 100}%` }}
                          />
                          <div
                            className={`absolute w-5 h-5 rounded-full bg-white border-2 shadow-md -translate-x-1/2 pointer-events-none transition-colors ${form.durationEnabled ? "border-[#264044]" : "border-[#D1D5DB]"}`}
                            style={{ left: `${((form.duration - 2) / 26) * 100}%` }}
                          />
                          <input
                            type="range"
                            min={2}
                            max={28}
                            step={1}
                            value={form.duration}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              update({ duration: val, durationEnabled: true });
                            }}
                            className="absolute inset-0 w-full opacity-0 cursor-pointer"
                          />
                        </div>
                        <div className="flex justify-between text-[9px] text-[#9CA3AF] mt-0.5">
                          <span>2j</span>
                          <span>4 sem.</span>
                        </div>
                      </div>
                    )}
                  </div>
                </BentoCard>
              );
            })()}

            {/* Transport */}
            <BentoCard className="col-span-1 flex flex-col" active={form.transport.length > 0}>
              <SectionLabel icon={Plane}>{t("transport")}</SectionLabel>
              {form.transport.length === 0 && (
                <p className="text-sm font-medium text-[#9CA3AF] mb-2">{t("transportAll")}</p>
              )}
              <div className="flex-1 grid grid-cols-2 gap-1.5 content-center">
                {(
                  [
                    { mode: "plane" as TransportMode, icon: Plane, label: t("transportPlane") },
                    { mode: "train" as TransportMode, icon: TrainFront, label: t("transportTrain") },
                    { mode: "car" as TransportMode, icon: Car, label: t("transportCar") },
                    { mode: "bike" as TransportMode, icon: Bike, label: t("transportBike") },
                  ] as const
                ).map((opt) => {
                  const isSelected = form.transport.includes(opt.mode);
                  return (
                  <motion.button
                    key={opt.mode}
                    type="button"
                    whileTap={{ scale: 0.93 }}
                    animate={isSelected ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => {
                      const newTransport = isSelected
                        ? form.transport.filter((m) => m !== opt.mode)
                        : [...form.transport, opt.mode];
                      update({ transport: newTransport });
                      if (newTransport.includes("bike") && !form.city.trim()) {
                        setCityHint(true);
                        setTimeout(() => {
                          document.querySelector<HTMLInputElement>("[data-city-input]")?.focus();
                        }, 100);
                      }
                    }}
                    className={`
                      flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-semibold transition-colors cursor-pointer
                      ${
                        isSelected
                          ? "bg-[#264044] text-white"
                          : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
                      }
                    `}
                  >
                    <opt.icon size={14} />
                    {opt.label}
                  </motion.button>
                  );
                })}
              </div>
            </BentoCard>

            {/* Accommodation */}
            <BentoCard className="col-span-2 flex flex-col" active={form.accommodation.length > 0 || form.comfort !== "standard"}>
              <SectionLabel icon={BedDouble}>{t("accommodation")}</SectionLabel>
              {form.accommodation.length === 0 && (
                <p className="text-sm font-medium text-[#9CA3AF] mb-1.5">{t("accommodationAll")}</p>
              )}
              <div className="grid grid-cols-2 gap-1.5 mb-2.5">
                {(
                  [
                    { mode: "hotel" as AccommodationType, icon: Hotel, label: t("accHotel") },
                    { mode: "hostel" as AccommodationType, icon: BedDouble, label: t("accHostel") },
                    { mode: "airbnb" as AccommodationType, icon: Home, label: t("accAirbnb") },
                    { mode: "camping" as AccommodationType, icon: Tent, label: t("accCamping") },
                  ] as const
                ).map((opt) => {
                  const isSelected = form.accommodation.includes(opt.mode);
                  return (
                    <motion.button
                      key={opt.mode}
                      type="button"
                      whileTap={{ scale: 0.93 }}
                      animate={isSelected ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => {
                        const next = isSelected
                          ? form.accommodation.filter((m) => m !== opt.mode)
                          : [...form.accommodation, opt.mode];
                        update({ accommodation: next });
                      }}
                      className={`
                        flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-semibold transition-colors cursor-pointer
                        ${isSelected
                          ? "bg-[#264044] text-white"
                          : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
                        }
                      `}
                    >
                      <opt.icon size={13} />
                      {opt.label}
                    </motion.button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 mt-2 mb-1">
                <div className="flex-1 h-px bg-[#E5E7EB]" />
                <span className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#9CA3AF] shrink-0">{t("comfortLabel")}</span>
                <div className="flex-1 h-px bg-[#E5E7EB]" />
              </div>
              <div className="flex gap-1.5">
                {(
                  [
                    { level: "budget" as ComfortLevel, label: t("comfortBudget") },
                    { level: "standard" as ComfortLevel, label: t("comfortStandard") },
                    { level: "premium" as ComfortLevel, label: t("comfortPremium") },
                  ] as const
                ).map((opt) => {
                  const isActive = form.comfort === opt.level;
                  return (
                    <motion.button
                      key={opt.level}
                      type="button"
                      whileTap={{ scale: 0.93 }}
                      animate={isActive ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => update({ comfort: opt.level })}
                      className={`
                        flex-1 py-1.5 rounded-xl text-[10px] font-semibold transition-colors cursor-pointer text-center
                        ${isActive
                          ? "bg-[#264044] text-white"
                          : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
                        }
                      `}
                    >
                      {opt.label}
                    </motion.button>
                  );
                })}
              </div>
            </BentoCard>

          {/* Interests */}
          <BentoCard
            className="col-span-2 lg:col-span-4 overflow-hidden"
            active={form.interests.length > 0}
          >
            <div className="flex items-baseline gap-2 mb-2">
              <SectionLabel icon={Sparkles}>{t("interests")}</SectionLabel>
              <span className="text-[10px] text-[#9CA3AF] font-normal normal-case tracking-normal">{t("interestsHint")}</span>
            </div>
            <div className="overflow-y-auto max-h-full -mb-4 pb-4">
              <InterestChips
                selected={form.interests}
                onChange={(interests) => update({ interests })}
              />
            </div>
          </BentoCard>
              </div>
            </div>

            {/* CTA */}
            {(() => {
              const hasCity = form.city.trim().length > 0;
              return (
                <div className={`fixed bottom-0 left-0 right-0 z-40 p-3 lg:static lg:p-0 lg:mt-4 transition-all duration-300 ${formVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 lg:translate-y-0 lg:opacity-100"}`}>
                  <div className="w-full">
                    {hasCity ? (
                      <ShimmerButton
                        onClick={onSubmit}
                        background="#264044"
                        shimmerColor="rgba(255,255,255,0.3)"
                        className="w-full py-3.5 text-sm font-bold"
                      >
                        <span className="inline-flex items-center gap-2">
                          <RotatingIcon />
                          {t("search")}
                        </span>
                      </ShimmerButton>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setCityHint(true);
                          document.querySelector<HTMLInputElement>("[data-city-input]")?.focus();
                        }}
                        className="w-full py-3.5 text-sm font-bold rounded-xl bg-[#9CA3AF] text-white cursor-pointer transition-colors hover:bg-[#6B7280]"
                      >
                        <span className="inline-flex items-center gap-2">
                          <MapPin size={16} />
                          {t("searchNeedsCity")}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

      </div>
    </>
  );
}
