"use client";

import { useState, useEffect, useCallback } from "react";
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
  else parts.push("toutes envies");
  return parts.join(" → ");
}

function readStorage(): SearchHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStorage(entries: SearchHistoryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Clear corrupted data
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryEntry[]>([]);

  useEffect(() => {
    setHistory(readStorage());
  }, []);

  const addSearch = useCallback((form: SearchFormData) => {
    setHistory((prev) => {
      // Don't add duplicates (same city + same interests)
      const label = buildLabel(form);
      const filtered = prev.filter((e) => e.label !== label);
      // Clean copy to avoid cyclic refs
      const cleanForm: SearchFormData = {
        city: form.city,
        dateFrom: form.dateFrom,
        dateTo: form.dateTo,
        dateConstraints: form.dateConstraints,
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
        id: Date.now().toString(36),
        form: cleanForm,
        timestamp: Date.now(),
        label,
      };
      const next = [entry, ...filtered].slice(0, MAX_HISTORY);
      writeStorage(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setHistory([]);
  }, []);

  return { history, addSearch, clearHistory };
}
