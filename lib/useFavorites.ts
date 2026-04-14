"use client";

import { useState, useEffect, useCallback } from "react";
import type { Destination } from "./types";

const STORAGE_KEY = "wandeal-favorites";

function getKey(dest: Destination) {
  return `${dest.name}-${dest.country}`;
}

function readStorage(): Destination[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStorage(favs: Destination[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Destination[]>([]);

  useEffect(() => {
    setFavorites(readStorage());
  }, []);

  const toggle = useCallback((dest: Destination) => {
    setFavorites((prev) => {
      const key = getKey(dest);
      const exists = prev.some((d) => getKey(d) === key);
      const next = exists ? prev.filter((d) => getKey(d) !== key) : [...prev, dest];
      writeStorage(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (dest: Destination) => favorites.some((d) => getKey(d) === getKey(dest)),
    [favorites],
  );

  return { favorites, toggle, isFavorite };
}
