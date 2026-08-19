"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Destination } from "./types";

const STORAGE_KEY = "wandeal-favorites";

function getKey(dest: Destination) {
  return `${dest.name}-${dest.country}`;
}

// useSyncExternalStore requires a stable snapshot reference, so the parsed list
// is memoised against the raw string it came from.
let cachedRaw: string | null = null;
let cachedValue: Destination[] = [];
const EMPTY: Destination[] = [];

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Keep favourites in sync across tabs.
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function getSnapshot(): Destination[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return EMPTY;
  }
  if (raw === cachedRaw) return cachedValue;
  cachedRaw = raw;
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    cachedValue = Array.isArray(parsed) ? parsed : [];
  } catch {
    cachedValue = [];
  }
  return cachedValue;
}

/** The server has no localStorage — render the empty list, then hydrate. */
function getServerSnapshot(): Destination[] {
  return EMPTY;
}

export function useFavorites() {
  const favorites = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback((dest: Destination) => {
    const current = getSnapshot();
    const key = getKey(dest);
    const exists = current.some((d) => getKey(d) === key);
    const next = exists ? current.filter((d) => getKey(d) !== key) : [...current, dest];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Quota exceeded or storage disabled — drop the corrupted entry
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* nothing else to try */
      }
    }
    emit();
  }, []);

  const isFavorite = useCallback(
    (dest: Destination) => favorites.some((d) => getKey(d) === getKey(dest)),
    [favorites]
  );

  return { favorites, toggle, isFavorite };
}
