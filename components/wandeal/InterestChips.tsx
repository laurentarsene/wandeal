"use client";

import {
  Sun,
  Waves,
  Mountain,
  Footprints,
  Wine,
  Music,
  Users,
  Landmark,
  Sparkles,
  TreePine,
  Building2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { InterestIcon } from "@/lib/types";

const iconMap: Record<InterestIcon, React.ComponentType<{ size?: number }>> = {
  sun: Sun,
  waves: Waves,
  mountain: Mountain,
  footprints: Footprints,
  wine: Wine,
  music: Music,
  users: Users,
  landmark: Landmark,
  sparkles: Sparkles,
  "tree-pine": TreePine,
  building: Building2,
};

const interests: { value: string; icon: InterestIcon; tKey: string }[] = [
  { value: "soleil", icon: "sun", tKey: "interestSun" },
  { value: "plage", icon: "waves", tKey: "interestBeach" },
  { value: "ski", icon: "mountain", tKey: "interestSki" },
  { value: "trek", icon: "footprints", tKey: "interestTrek" },
  { value: "gastronomie", icon: "wine", tKey: "interestFood" },
  { value: "teuf", icon: "music", tKey: "interestParty" },
  { value: "famille", icon: "users", tKey: "interestFamily" },
  { value: "culture", icon: "landmark", tKey: "interestCulture" },
  { value: "detente", icon: "sparkles", tKey: "interestRelax" },
  { value: "nature", icon: "tree-pine", tKey: "interestNature" },
  { value: "citybreak", icon: "building", tKey: "interestCity" },
];

interface InterestChipsProps {
  selected: string[];
  onChange: (interests: string[]) => void;
}

export function InterestChips({ selected, onChange }: InterestChipsProps) {
  const t = useTranslations("form");

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {interests.map((opt) => {
        const active = selected.includes(opt.value);
        const Icon = iconMap[opt.icon];
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={`
              inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs
              transition-all duration-150 cursor-pointer select-none
              ${
                active
                  ? "bg-[#264044] text-white font-semibold"
                  : "bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB] font-medium"
              }
            `}
          >
            <Icon size={12} />
            <span>{t(opt.tKey)}</span>
          </button>
        );
      })}
    </div>
  );
}
