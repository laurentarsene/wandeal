"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sun,
  Waves,
  Mountain,
  Footprints,
  Wine,
  Music,
  Landmark,
  Sparkles,
  TreePine,
  Building2,
  Heart,
  Flame,
  Ship,
  ShoppingBag,
  Droplets,
  Car,
  Binoculars,
  ScrollText,
  Ticket,
  Backpack,
  ChevronDown,
} from "lucide-react";
import { useTranslations } from "next-intl";

type IconKey = string;

const iconMap: Record<IconKey, React.ComponentType<{ size?: number }>> = {
  sun: Sun,
  waves: Waves,
  mountain: Mountain,
  footprints: Footprints,
  wine: Wine,
  music: Music,
  landmark: Landmark,
  sparkles: Sparkles,
  "tree-pine": TreePine,
  building: Building2,
  heart: Heart,
  flame: Flame,
  ship: Ship,
  "shopping-bag": ShoppingBag,
  droplets: Droplets,
  car: Car,
  binoculars: Binoculars,
  "scroll-text": ScrollText,
  ticket: Ticket,
  backpack: Backpack,
};

const interests: { value: string; icon: IconKey; tKey: string }[] = [
  { value: "soleil", icon: "sun", tKey: "interestSun" },
  { value: "plage", icon: "waves", tKey: "interestBeach" },
  { value: "ski", icon: "mountain", tKey: "interestSki" },
  { value: "trek", icon: "footprints", tKey: "interestTrek" },
  { value: "gastronomie", icon: "wine", tKey: "interestFood" },
  { value: "teuf", icon: "music", tKey: "interestParty" },
  { value: "culture", icon: "landmark", tKey: "interestCulture" },
  { value: "detente", icon: "sparkles", tKey: "interestRelax" },
  { value: "nature", icon: "tree-pine", tKey: "interestNature" },
  { value: "citybreak", icon: "building", tKey: "interestCity" },
  { value: "romantique", icon: "heart", tKey: "interestRomantic" },
  { value: "aventure", icon: "flame", tKey: "interestAdventure" },
  { value: "surf", icon: "ship", tKey: "interestSurf" },
  { value: "plongee", icon: "droplets", tKey: "interestDiving" },
  { value: "shopping", icon: "shopping-bag", tKey: "interestShopping" },
  { value: "spa", icon: "sparkles", tKey: "interestSpa" },
  { value: "roadtrip", icon: "car", tKey: "interestRoadtrip" },
  { value: "safari", icon: "binoculars", tKey: "interestSafari" },
  { value: "histoire", icon: "scroll-text", tKey: "interestHistory" },
  { value: "festival", icon: "ticket", tKey: "interestFestival" },
  { value: "backpacker", icon: "backpack", tKey: "interestBackpacker" },
];

const VISIBLE_COUNT = 10;

interface InterestChipsProps {
  selected: string[];
  onChange: (interests: string[]) => void;
}

export function InterestChips({ selected, onChange }: InterestChipsProps) {
  const t = useTranslations("form");
  const [expanded, setExpanded] = useState(false);

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  // Always show selected ones even if beyond VISIBLE_COUNT
  const visible = expanded
    ? interests
    : interests.filter((opt, i) => i < VISIBLE_COUNT || selected.includes(opt.value));
  const hasMore = !expanded && interests.length > VISIBLE_COUNT;

  return (
    <div className="flex flex-wrap gap-2">
      {visible.map((opt) => {
        const active = selected.includes(opt.value);
        const Icon = iconMap[opt.icon];
        return (
          <motion.button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            whileTap={{ scale: 0.93 }}
            animate={active ? { scale: [1, 1.08, 1] } : { scale: 1 }}
            transition={{ duration: 0.2 }}
            className={`
              inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px]
              transition-colors duration-150 cursor-pointer select-none
              ${
                active
                  ? "bg-[#1C48CD] text-white font-semibold [box-shadow:0_0_0_1px_#1C48CD,0_2px_6px_rgba(28,72,205,0.25)]"
                  : "bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB] font-medium"
              }
            `}
          >
            <Icon size={14} />
            <span>{t(opt.tKey)}</span>
          </motion.button>
        );
      })}
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-[13px] font-medium text-[#1C48CD] bg-[#EEF2FF] hover:bg-[#DEE5FF] transition-colors cursor-pointer"
        >
          <ChevronDown size={14} />
          <span>{t("interestsMore")}</span>
        </button>
      )}
    </div>
  );
}
