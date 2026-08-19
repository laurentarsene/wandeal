"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Navbar } from "@/components/wandeal/Navbar";
import { SearchForm } from "@/components/wandeal/SearchForm";
import { LoadingScreen } from "@/components/wandeal/LoadingScreen";
import { ResultsGrid } from "@/components/wandeal/ResultsGrid";
import { FavoritesView } from "@/components/wandeal/FavoritesView";
import { Footer } from "@/components/wandeal/Footer";
import type { SearchFormData, Destination } from "@/lib/types";
import { defaultForm } from "@/lib/types";
import { useFavorites } from "@/lib/useFavorites";
import { useSearchHistory } from "@/lib/useSearchHistory";

type Step = "form" | "loading" | "results" | "favorites";

/** Server error codes → translation keys in the `errors` namespace. */
const ERROR_KEYS: Record<string, string> = {
  rate_limited: "rateLimited",
  no_results: "noResults",
  bad_request: "badRequest",
  server_error: "serverError",
};

// Measured: ~25s warm, ~75s worst case observed in production. Past this the
// wait stops being credible, so we surface a retry instead of spinning forever.
const SEARCH_TIMEOUT_MS = 95_000;

export default function Home() {
  const [step, setStep] = useState<Step>("form");
  const [prevStep, setPrevStep] = useState<Step>("form");
  const [form, setForm] = useState<SearchFormData>(defaultForm);
  const [results, setResults] = useState<Destination[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingDone, setLoadingDone] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const { favorites, toggle: toggleFavorite, isFavorite } = useFavorites();
  const locale = useLocale();
  const t = useTranslations("errors");
  const tResults = useTranslations("results");
  const { history, addSearch } = useSearchHistory();

  // Keep the browser Back button meaningful: each screen pushes a history entry
  // so Back returns to the previous screen instead of leaving the site.
  useEffect(() => {
    const onPopState = (e: PopStateEvent) => {
      const target = (e.state?.step as Step) || "form";
      abortRef.current?.abort();
      setStep(target === "loading" ? "form" : target);
    };
    window.addEventListener("popstate", onPopState);
    window.history.replaceState({ step: "form" }, "");
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const pushStep = useCallback((next: Step) => {
    setStep(next);
    if (next !== "loading") {
      window.history.pushState({ step: next }, "");
    }
  }, []);

  const goToFavorites = () => {
    setPrevStep(step);
    pushStep("favorites");
  };

  const goBack = () => {
    // Delegate to history so the in-app Back button and the browser's agree.
    if (window.history.state?.step && window.history.length > 1) {
      window.history.back();
      return;
    }
    setStep(step === "favorites" ? prevStep : "form");
  };

  const handleSearch = async (skipCache = false) => {
    setStep("loading");
    setLoadingDone(false);
    setError(null);
    try {
      addSearch(form);
    } catch {
      /* history is best-effort */
    }

    const controller = new AbortController();
    abortRef.current = controller;
    const timeout = setTimeout(() => controller.abort("timeout"), SEARCH_TIMEOUT_MS);

    try {
      const payload = {
        city: String(form.city || ""),
        dateFrom: String(form.dateFrom || ""),
        dateTo: String(form.dateTo || ""),
        dateConstraints: Array.from(form.dateConstraints || []),
        travelers: Number(form.travelers) || 1,
        budgetEnabled: Boolean(form.budgetEnabled),
        budget: Number(form.budget) || 500,
        durationEnabled: Boolean(form.durationEnabled),
        duration: Number(form.duration) || 7,
        transport: Array.from(form.transport || []),
        accommodation: Array.from(form.accommodation || []),
        comfort: String(form.comfort || "standard"),
        interests: Array.from(form.interests || []),
        locale: String(locale),
        skipCache: Boolean(skipCache),
      };

      const res = await fetch("/api/destinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const key = ERROR_KEYS[data.code as string] || "serverError";
        throw new Error(t(key));
      }
      if (!data.destinations?.length) {
        throw new Error(t("noResults"));
      }

      setResults(data.destinations);
      setLoadingDone(true);
      pushStep("results");

      document.title = tResults("pageTitle", {
        count: data.destinations.length,
        city: form.city || tResults("everywhere"),
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // Distinguish "the user cancelled" from "we gave up waiting"
        if (controller.signal.reason === "timeout") setError(t("timeout"));
        setStep("form");
        return;
      }
      if (err instanceof TypeError) {
        setError(t("network"));
        setStep("form");
        return;
      }
      setError(err instanceof Error ? err.message : t("serverError"));
      setStep("form");
    } finally {
      clearTimeout(timeout);
    }
  };

  const handleCancel = () => {
    abortRef.current?.abort();
    setStep("form");
  };

  const transition = { duration: 0.3 };
  const variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <>
      <Navbar
        showBack={step === "results" || step === "favorites"}
        onBack={goBack}
        favCount={favorites.length}
        onFavorites={step !== "favorites" ? goToFavorites : undefined}
      />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {step === "form" && (
            <motion.div key="form" {...variants} transition={transition}>
              <SearchForm
                form={form}
                onChange={setForm}
                onSubmit={handleSearch}
                searchHistory={history}
                error={error}
              />
            </motion.div>
          )}

          {step === "loading" && (
            <motion.div key="loading" {...variants} transition={transition}>
              <LoadingScreen onCancel={handleCancel} done={loadingDone} />
            </motion.div>
          )}

          {step === "results" && (
            <motion.div key="results" {...variants} transition={transition}>
              <ResultsGrid
                results={results}
                form={form}
                favorites={favorites}
                isFavorite={isFavorite}
                onToggleFavorite={toggleFavorite}
                onRelaunch={() => handleSearch(true)}
              />
            </motion.div>
          )}

          {step === "favorites" && (
            <motion.div key="favorites" {...variants} transition={transition}>
              <FavoritesView
                favorites={favorites}
                isFavorite={isFavorite}
                onToggleFavorite={toggleFavorite}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </>
  );
}
