"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { InterestChips } from "./InterestChips";
import { CityAutocomplete } from "./CityAutocomplete";
import { DateRangePicker } from "./DateRangePicker";
import type { SearchFormData, TransportMode } from "@/lib/types";
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
      transport: "bike",
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
        relative rounded-xl p-4 transition-all duration-300 transform-gpu h-full
        ${
          active
            ? "bg-[#f6fafa] [box-shadow:0_0_0_1px_rgba(38,64,68,0.15),0_2px_8px_rgba(38,64,68,0.08)]"
            : "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,0.04),0_1px_4px_rgba(0,0,0,0.04)] hover:[box-shadow:0_0_0_1px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.06)]"
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

export function SearchForm({ form, onChange, onSubmit }: SearchFormProps) {
  const [cityHint, setCityHint] = useState(false);

  useEffect(() => {
    if (form.city.trim()) setCityHint(false);
  }, [form.city]);

  const update = (partial: Partial<SearchFormData>) => {
    onChange({ ...form, ...partial });
  };

  const daysFromDates = daysBetween(form.dateFrom, form.dateTo);

  const handleDatesChange = (dateFrom: string, dateTo: string) => {
    const newForm = { ...form, dateFrom, dateTo };
    const days = daysBetween(dateFrom, dateTo);
    if (days) {
      newForm.duration = days;
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
    }
  };

  return (
    <>
      {/* Desktop presets — fixed to right edge */}
      <div className="hidden lg:flex fixed right-0 top-1/2 -translate-y-1/2 z-40 flex-col gap-2 pr-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#264044] mb-0.5 px-1">
          Presets
        </p>
        {presets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => applyPreset(preset)}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/90 backdrop-blur-sm border border-[#E5E7EB] text-left text-[13px] font-medium text-[#4B5563] hover:border-[#264044] hover:bg-[#e8f0f1] hover:text-[#1a2e31] transition-all cursor-pointer group shadow-sm w-[220px]"
          >
            <div className="w-8 h-8 rounded-xl bg-[#F3F4F6] flex items-center justify-center shrink-0 group-hover:bg-[#264044] transition-colors">
              <preset.icon
                size={16}
                className="text-[#9CA3AF] group-hover:text-white transition-colors"
              />
            </div>
            <span className="leading-snug">{preset.label}</span>
          </button>
        ))}
      </div>

      <div className="h-[calc(100dvh-64px)] flex flex-col justify-center px-3 sm:px-6 lg:px-10 py-3 sm:py-4 max-w-[900px] mx-auto">
        {/* Hero */}
        <div className="text-center mb-3 shrink-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e8f0f1] text-[#264044] text-[10px] font-semibold mb-1.5 tracking-wide">
            <Sparkles size={11} />
            Propulsé par l'IA
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#111] leading-[1.15] tracking-tight">
            Quelque part, il y a des vacances
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #264044, #3a6068, #4a9aa8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              parfaites pour vous.
            </span>
          </h1>
        </div>

        {/* Mobile presets — horizontal scroll */}
        <div className="lg:hidden shrink-0 flex gap-2 overflow-x-auto scrollbar-hide mb-2.5 -mx-3 px-3">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset)}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E5E7EB] bg-white text-[11px] font-medium text-[#4B5563] hover:border-[#264044] hover:bg-[#e8f0f1] hover:text-[#1a2e31] transition-all cursor-pointer"
            >
              <preset.icon size={12} className="shrink-0" />
              {preset.label}
            </button>
          ))}
        </div>

        {/* Bento Grid */}
        <div className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
            {/* Where */}
            <BentoCard
              className={`col-span-2 ${cityHint ? "!bg-[#e8f0f1]/50 ![box-shadow:0_0_0_2px_#264044]" : ""}`}
              active={!!form.city}
            >
              <SectionLabel icon={MapPin}>Départ depuis</SectionLabel>
              <CityAutocomplete
                value={form.city}
                onChange={(city) => update({ city })}
              />
              {cityHint && (
                <p className="text-[10px] text-[#264044] font-medium mt-1 animate-pulse">
                  Indiquez votre ville pour ce preset
                </p>
              )}
            </BentoCard>

            {/* When */}
            <BentoCard className="col-span-2" active={!!form.dateFrom}>
              <SectionLabel icon={CalendarDays}>Dates</SectionLabel>
              <DateRangePicker
                dateFrom={form.dateFrom}
                dateTo={form.dateTo}
                onChange={handleDatesChange}
              />
            </BentoCard>

            {/* Travelers */}
            <BentoCard className="col-span-1 flex flex-col" active={true}>
              <SectionLabel icon={Users}>Voyageurs</SectionLabel>
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
                    personne{form.travelers > 1 ? "s" : ""}
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
                <SectionLabel icon={Wallet}>Budget max</SectionLabel>
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
                        max par personne
                      </span>
                    </>
                  ) : (
                    <span className="text-sm font-medium text-[#9CA3AF] leading-snug">
                      On cherche à tous les prix
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
              const lockedByDates = !!daysFromDates;
              return (
                <BentoCard className="col-span-1 flex flex-col" active={form.durationEnabled || lockedByDates}>
                  <div className="flex items-center justify-between mb-2">
                    <SectionLabel icon={Clock}>Durée</SectionLabel>
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
                            {daysFromDates}
                          </span>
                          <span className="text-lg font-bold text-[#264044] ml-1">jours</span>
                          <span className="block text-[10px] text-[#9CA3AF] mt-1">
                            défini par vos dates
                          </span>
                        </>
                      ) : form.durationEnabled ? (
                        <>
                          <span className="text-4xl font-extrabold text-[#264044] tabular-nums leading-none">
                            {form.duration}
                          </span>
                          <span className="text-lg font-bold text-[#264044] ml-1">jours</span>
                          <span className="block text-[10px] text-[#9CA3AF] mt-1">
                            environ, +/- 3 jours
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-medium text-[#9CA3AF] leading-snug">
                          Toutes les durées
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
            <BentoCard className="col-span-1 flex flex-col" active={form.transport !== null}>
              <SectionLabel icon={Plane}>Transport</SectionLabel>
              {form.transport === null && (
                <p className="text-sm font-medium text-[#9CA3AF] mb-2">Tous les moyens</p>
              )}
              <div className="flex-1 grid grid-cols-2 gap-1.5 content-center">
                {(
                  [
                    { mode: "plane" as TransportMode, icon: Plane, label: "Avion" },
                    { mode: "train" as TransportMode, icon: TrainFront, label: "Train" },
                    { mode: "car" as TransportMode, icon: Car, label: "Voiture" },
                    { mode: "bike" as TransportMode, icon: Bike, label: "Vélo" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.mode}
                    type="button"
                    onClick={() => {
                      const newTransport = form.transport === opt.mode ? null : opt.mode;
                      update({ transport: newTransport });
                      if (newTransport === "bike" && !form.city.trim()) {
                        setCityHint(true);
                        setTimeout(() => {
                          document.querySelector<HTMLInputElement>("[data-city-input]")?.focus();
                        }, 100);
                      }
                    }}
                    className={`
                      flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer
                      ${
                        form.transport === opt.mode
                          ? "bg-[#264044] text-white"
                          : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
                      }
                    `}
                  >
                    <opt.icon size={14} />
                    {opt.label}
                  </button>
                ))}
              </div>
            </BentoCard>

          {/* Interests */}
          <BentoCard
            className="col-span-2 lg:col-span-4 overflow-hidden"
            active={form.interests.length > 0}
          >
            <SectionLabel icon={Sparkles}>Envies</SectionLabel>
            <div className="overflow-y-auto max-h-full -mb-4 pb-4">
              <InterestChips
                selected={form.interests}
                onChange={(interests) => update({ interests })}
              />
            </div>
          </BentoCard>
        </div>

        {/* CTA */}
        <div className="shrink-0 mt-4">
          <ShimmerButton
            onClick={onSubmit}
            background="#264044"
            shimmerColor="rgba(255,255,255,0.3)"
            className="w-full py-3.5 text-sm font-bold"
          >
            <span className="inline-flex items-center gap-2">
              <Search size={16} />
              Rechercher
            </span>
          </ShimmerButton>
        </div>
      </div>
    </>
  );
}
