"use client";

import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { BlurFade } from "@/components/ui/blur-fade";
import { DestCard } from "./DestCard";
import type { Destination } from "@/lib/types";

interface FavoritesViewProps {
  favorites: Destination[];
  isFavorite: (dest: Destination) => boolean;
  onToggleFavorite: (dest: Destination) => void;
}

export function FavoritesView({ favorites, isFavorite, onToggleFavorite }: FavoritesViewProps) {
  const t = useTranslations("results");

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      <BlurFade delay={0}>
        <div className="flex items-center gap-3 mb-6">
          <Heart size={20} className="fill-red-500 text-red-500" />
          <h2 className="text-xl font-extrabold text-[#1C48CD]">
            {t("favoritesTitle", { count: favorites.length })}
          </h2>
        </div>
      </BlurFade>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favorites.map((dest, idx) => (
            <BlurFade key={`${dest.name}-${dest.country}`} delay={idx * 0.06}>
              <DestCard
                dest={dest}
                isFavorite={isFavorite(dest)}
                onToggleFavorite={onToggleFavorite}
              />
            </BlurFade>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Heart size={32} className="mx-auto mb-3 text-[#D1D5DB]" />
          <p className="text-sm text-[#9CA3AF]">{t("noFavorites")}</p>
        </div>
      )}
    </div>
  );
}
