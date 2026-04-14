"use client";

import { useState, useRef } from "react";
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

export default function Home() {
  const [step, setStep] = useState<Step>("form");
  const [prevStep, setPrevStep] = useState<Step>("form");
  const [form, setForm] = useState<SearchFormData>(defaultForm);
  const [results, setResults] = useState<Destination[]>([]);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { favorites, toggle: toggleFavorite, isFavorite } = useFavorites();
  const { history, addSearch } = useSearchHistory();

  const goToFavorites = () => {
    setPrevStep(step);
    setStep("favorites");
  };

  const goBack = () => {
    if (step === "favorites") {
      setStep(prevStep);
    } else {
      setStep("form");
      document.title = "Wandeal — Ur next journey";
    }
  };

  const handleSearch = async () => {
    setStep("loading");
    setError(null);
    addSearch(form);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/destinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Erreur ${res.status}`);
      }

      const data = await res.json();
      if (!data.destinations?.length) {
        throw new Error("Aucune destination trouvée. Essayez d'autres filtres.");
      }
      setResults(data.destinations);
      setStep("results");
      // Dynamic page title for SEO/sharing
      const interests = form.interests.length > 0 ? form.interests.slice(0, 2).join(", ") : "vacances";
      document.title = `${data.destinations.length} destinations ${interests} depuis ${form.city || "partout"} — Wandeal`;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setStep("form");
        return;
      }
      const msg = err instanceof Error ? err.message : "Une erreur est survenue";
      setError(msg);
      setStep("form");
    }
  };

  const handleCancel = () => {
    abortRef.current?.abort();
    setStep("form");
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
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
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
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <LoadingScreen onCancel={handleCancel} />
            </motion.div>
          )}

          {step === "results" && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ResultsGrid
                results={results}
                form={form}
                favorites={favorites}
                isFavorite={isFavorite}
                onToggleFavorite={toggleFavorite}
              />
            </motion.div>
          )}

          {step === "favorites" && (
            <motion.div
              key="favorites"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <FavoritesView
                favorites={favorites}
                isFavorite={isFavorite}
                onToggleFavorite={toggleFavorite}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {(step === "results" || step === "favorites") && <Footer />}
    </>
  );
}
