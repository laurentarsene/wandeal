"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Navbar } from "@/components/wandeal/Navbar";
import { SearchForm } from "@/components/wandeal/SearchForm";
import { LoadingScreen } from "@/components/wandeal/LoadingScreen";
import { ResultsGrid } from "@/components/wandeal/ResultsGrid";
import type { SearchFormData, Destination } from "@/lib/types";
import { defaultForm } from "@/lib/types";

type Step = "form" | "loading" | "results";

export default function Home() {
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState<SearchFormData>(defaultForm);
  const [results, setResults] = useState<Destination[]>([]);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    setStep("loading");
    setError("");

    try {
      const res = await fetch("/api/destinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur serveur");
      }

      const data = await res.json();
      setResults(data.destinations);
      setStep("results");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Une erreur est survenue."
      );
      setStep("form");
    }
  };

  return (
    <>
      <Navbar showBack={step === "results"} onBack={() => setStep("form")} />

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
              <LoadingScreen />
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
              <ResultsGrid results={results} form={form} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
