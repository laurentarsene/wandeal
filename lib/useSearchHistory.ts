"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { SearchFormData } from "./types";

const STORAGE_KEY = "wandeal-search-history";
const MAX_HISTORY = 5;

export interface SearchHistoryEntry {
  id: string;
  form: SearchFormData;
  timestamp: number;
  label: string; // e.g. "Bruxelles → plage, soleil"
}

function buildLabel(form: SearchFormData): string {
  const parts: string[] = [];
  if (form.city) parts.push(form.city);
  if (form.interests.length > 0) parts.push(form.interests.slice(0, 3).join(", "));
  return parts.join(" → ") || form.city;
}

let cachedRaw: string | null = null;
let cachedValue: SearchHistoryEntry[] = [];
const EMPTY: SearchHistoryEntry[] = [];

const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
function emit() {
  listeners.forEach((l) => l());
}

function getSnapshot(): SearchHistoryEntry[] {
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

function getServerSnapshot(): SearchHistoryEntry[] {
  return EMPTY;
}

function write(entries: SearchHistoryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* nothing else to try */
    }
  }
  emit();
}

export function useSearchHistory() {
  const history = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addSearch = useCallback((form: SearchFormData) => {
    const label = buildLabel(form);
    if (!label) return;
    const prev = getSnapshot();
    const filtered = prev.filter((e) => e.label !== label);
    // Plain copy — the stored form must survive JSON round-tripping.
    const cleanForm: SearchFormData = {
      city: form.city,
      dateFrom: form.dateFrom,
      dateTo: form.dateTo,
      dateConstraints: [...form.dateConstraints],
      travelers: form.travelers,
      budgetEnabled: form.budgetEnabled,
      budget: form.budget,
      durationEnabled: form.durationEnabled,
      duration: form.duration,
      transport: [...form.transport],
      accommodation: [...form.accommodation],
      comfort: form.comfort,
      interests: [...form.interests],
    };
    const entry: SearchHistoryEntry = {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      form: cleanForm,
      timestamp: Date.now(),
      label,
    };
    write([entry, ...filtered].slice(0, MAX_HISTORY));
  }, []);

  const clearHistory = useCallback(() => {
    write([]);
  }, []);

  return { history, addSearch, clearHistory };
}
