"use client";

import { useState, useEffect, useCallback } from "react";
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

interface SearchFormProps {
  form: SearchFormData;
  onChange: (form: SearchFormData) => void;
  onSubmit: () => void;
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
}: {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
}) {
  return (
    <div
      className={`
        relative rounded-xl p-3 lg:p-3 transition-all duration-300 transform-gpu h-full min-h-[100px]
        ${
          active
            ? "bg-[#f0f7f7] [box-shadow:0_0_0_2px_#264044,0_2px_12px_rgba(38,64,68,0.12)]"
            : "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.04)] hover:[box-shadow:0_0_0_1px_rgba(0,0,0,0.1),0_4px_12px_rgba(0,0,0,0.06)]"
        }
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
  icon: React.ComponentType<{ size?: number }>;
  children: React.ReactNode;
}) {
  return (
    <label className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#9CA3AF] mb-2">
      <Icon size={11} />
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

export function SearchForm({ form, onChange, onSubmit }: SearchFormProps) {
  const t = useTranslations("form");
  const tHero = useTranslations("hero");
  const tPresets = useTranslations("presets");
  const [cityHint, setCityHint] = useState(false);

  useEffect(() => {
    if (form.city.trim()) setCityHint(false);
  }, [form.city]);

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
      setTimeout(() => {
        document.querySelector<HTMLInputElement>("[data-city-input]")?.focus();
      }, 100);
    } else {
      setCityHint(false);
    }
  };

  return (
    <>
      {/* Desktop presets — overlaid on video panel, top area */}

      <div className="min-h-[calc(100dvh-64px)] flex flex-col lg:flex-row">
        {/* Left panel — desktop video + hero overlay */}
        <div className="hidden lg:flex w-[42%] shrink-0 p-5 pt-6">
          <div className="w-full h-[calc(100dvh-104px)] rounded-3xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.1)] sticky top-[80px] relative">
            <HublotVideo variant="tall" />
            {/* Content overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30 rounded-3xl flex flex-col justify-between p-5">
              {/* Presets — top */}
              <div className="flex flex-col gap-2.5">
                <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-white/50">
                  {tPresets("title")}
                </p>
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="w-fit flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 backdrop-blur-sm text-left text-[11px] font-medium text-white/80 hover:bg-white/20 hover:text-white transition-all cursor-pointer group"
                  >
                    <div className="w-6 h-6 rounded-lg bg-white/15 flex items-center justify-center shrink-0 group-hover:bg-white/25 transition-colors">
                      <preset.icon size={12} className="text-white/70" />
                    </div>
                    <span className="leading-snug">{preset.label}</span>
                  </button>
                ))}
              </div>
              {/* Hero text — bottom */}
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-[10px] font-semibold mb-2 tracking-wide w-fit">
                  <Sparkles size={11} />
                  {tHero("badge")}
                </div>
                <h1 className="text-xl font-extrabold text-white leading-[1.15] tracking-tight">
                  {tHero("title1")}
                  <br />
                  <span className="text-[#8dd8e0]">
                    {tHero("title2")}
                  </span>
                </h1>
                <p className="text-[11px] text-white/60 mt-1.5">{tHero("madeIn")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel (desktop) / Full width (mobile) */}
        <div className="lg:w-[58%] lg:overflow-y-auto flex flex-col lg:justify-center px-3 sm:px-6 lg:px-6 pt-6 sm:pt-4 lg:pt-4 pb-24 sm:pb-4">
          <div className="w-full">
            {/* Hero — mobile only (on desktop it's overlaid on the video) */}
            <div className="text-center mb-2 shrink-0 lg:hidden">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e8f0f1] text-[#264044] text-[10px] font-semibold mb-1.5 tracking-wide">
                <Sparkles size={11} />
                {tHero("badge")}
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#111] leading-[1.15] tracking-tight">
                {tHero("title1")}
                <br />
                <span
                  style={{
                    background: "linear-gradient(135deg, #264044, #3a6068, #4a9aa8)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {tHero("title2")}
                </span>
              </h1>
              <p className="text-[11px] text-[#9CA3AF] mt-2">{tHero("madeIn")}</p>
            </div>

            {/* Video — mobile only (round) */}
            <div className="lg:hidden shrink-0 mb-2">
              <HublotVideo />
            </div>

            {/* Presets — mobile only (desktop uses fixed sidebar) */}
            <div className="lg:hidden shrink-0 relative mb-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#9CA3AF] mb-1 px-1">{tPresets("title")}</p>
              <div className="flex gap-2.5 overflow-x-auto scrollbar-hide py-1 snap-x">
                {presets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="shrink-0 snap-start inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-[12px] font-medium text-[#4B5563] [box-shadow:0_0_0_1px_rgba(0,0,0,0.04),0_1px_4px_rgba(0,0,0,0.06)] active:scale-95 transition-all cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#F3F4F6] flex items-center justify-center shrink-0">
                      <preset.icon size={14} className="text-[#9CA3AF]" />
                    </div>
                    <span className="whitespace-nowrap">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bento Grid */}
            <div className="shrink-0">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-1.5">
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
              {cityHint && (
                <p className="text-[10px] text-[#264044] font-medium mt-1 animate-pulse">
                  {t("cityHint")}
                </p>
              )}
            </BentoCard>

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
            <BentoCard className="col-span-1 flex flex-col" active={form.budgetEnabled}>
              <div className="flex items-center justify-between mb-2">
                <SectionLabel icon={Wallet}>{t("budget")}</SectionLabel>
                <button
                  type="button"
                  onClick={() => update({ budgetEnabled: !form.budgetEnabled })}
                  className={`
                    relative w-9 h-5 rounded-full transition-colors cursor-pointer shrink-0
                    ${form.budgetEnabled ? "bg-[#264044]" : "bg-[#E5E7EB]"}
                  `}
                >
                  <div
                    className={`
                      absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all
                      ${form.budgetEnabled ? "left-[18px]" : "left-0.5"}
                    `}
                  />
                </button>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <div className="text-center mb-2">
                  {form.budgetEnabled ? (
                    <>
                      <span className="text-4xl font-extrabold text-[#264044] tabular-nums leading-none">
                        {form.budget}€
                      </span>
                      <span className="block text-[10px] text-[#9CA3AF] mt-1">
                        {t("budgetPerPerson")}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm font-medium text-[#9CA3AF] leading-snug">
                      {t("budgetAll")}
                    </span>
                  )}
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
            </BentoCard>

            {/* Duration */}
            {(() => {
              const dc = form.dateConstraints || [];
              const lockedByConstraint = dc.includes("weekend") || dc.includes("bridge");
              const lockedByDates = !!daysFromDates || lockedByConstraint;
              return (
                <BentoCard className="col-span-1 flex flex-col" active={form.durationEnabled || lockedByDates}>
                  <div className="flex items-center justify-between mb-2">
                    <SectionLabel icon={Clock}>{t("duration")}</SectionLabel>
                    {!lockedByDates && (
                      <button
                        type="button"
                        onClick={() => update({ durationEnabled: !form.durationEnabled })}
                        className={`
                          relative w-9 h-5 rounded-full transition-colors cursor-pointer shrink-0
                          ${form.durationEnabled ? "bg-[#264044]" : "bg-[#E5E7EB]"}
                        `}
                      >
                        <div
                          className={`
                            absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all
                            ${form.durationEnabled ? "left-[18px]" : "left-0.5"}
                          `}
                        />
                      </button>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="text-center mb-2">
                      {lockedByDates ? (
                        <>
                          <span className="text-4xl font-extrabold text-[#264044] tabular-nums leading-none">
                            {dc.includes("weekend") && dc.includes("bridge") ? "2-4" : dc.includes("weekend") ? "2-3" : dc.includes("bridge") ? "3-4" : daysFromDates}
                          </span>
                          <span className="text-lg font-bold text-[#264044] ml-1">{t("durationDays")}</span>
                          <span className="block text-[10px] text-[#9CA3AF] mt-1">
                            {lockedByConstraint ? dc.filter(c => c === "weekend" || c === "bridge").map(c => t(c === "weekend" ? "dateWeekend" : "dateBridge")).join(" + ") : t("durationLocked")}
                          </span>
                        </>
                      ) : form.durationEnabled ? (
                        <>
                          <span className="text-4xl font-extrabold text-[#264044] tabular-nums leading-none">
                            {form.duration}
                          </span>
                          <span className="text-lg font-bold text-[#264044] ml-1">{t("durationDays")}</span>
                          <span className="block text-[10px] text-[#9CA3AF] mt-1">
                            {t("durationApprox")}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-medium text-[#9CA3AF] leading-snug">
                          {t("durationAll")}
                        </span>
                      )}
                    </div>
                    {!lockedByDates && (
                      <>
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
                      </>
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
                  <button
                    key={opt.mode}
                    type="button"
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
                      flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer
                      ${
                        isSelected
                          ? "bg-[#264044] text-white"
                          : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
                      }
                    `}
                  >
                    <opt.icon size={14} />
                    {opt.label}
                  </button>
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
                    <button
                      key={opt.mode}
                      type="button"
                      onClick={() => {
                        const next = isSelected
                          ? form.accommodation.filter((m) => m !== opt.mode)
                          : [...form.accommodation, opt.mode];
                        update({ accommodation: next });
                      }}
                      className={`
                        flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-semibold transition-all cursor-pointer
                        ${isSelected
                          ? "bg-[#264044] text-white"
                          : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
                        }
                      `}
                    >
                      <opt.icon size={13} />
                      {opt.label}
                    </button>
                  );
                })}
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
                    <button
                      key={opt.level}
                      type="button"
                      onClick={() => update({ comfort: opt.level })}
                      className={`
                        flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer text-center
                        ${isActive
                          ? "bg-[#264044] text-white"
                          : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
                        }
                      `}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </BentoCard>

          {/* Interests */}
          <BentoCard
            className="col-span-2 overflow-hidden"
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
                <div className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-gradient-to-t from-[#FAFAFA] via-[#FAFAFA] to-transparent sm:static sm:bg-none sm:p-0 sm:mt-4 sm:shrink-0">
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
