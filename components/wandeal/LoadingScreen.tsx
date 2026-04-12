"use client";

import { useState, useEffect } from "react";
import {
  Heart,
  CloudSun,
  Calculator,
  Trophy,
  Check,
  Loader2,
} from "lucide-react";
import { Globe } from "@/components/ui/globe";
import { AnimatedList } from "@/components/ui/animated-list";
import { loadingMessages } from "@/lib/types";

const steps = [
  { label: "Analyse de vos envies", icon: Heart },
  { label: "Vérification météo", icon: CloudSun },
  { label: "Calcul des prix", icon: Calculator },
  { label: "Sélection des meilleures offres", icon: Trophy },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globeConfig: any = {
  width: 800,
  height: 800,
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 1.2,
  baseColor: [0.92, 0.95, 0.95] as [number, number, number],
  markerColor: [0.15, 0.25, 0.27] as [number, number, number],
  glowColor: [0.9, 0.94, 0.94] as [number, number, number],
  markers: [
    { location: [48.8566, 2.3522], size: 0.06 },
    { location: [50.8503, 4.3517], size: 0.05 },
    { location: [41.3874, 2.1686], size: 0.05 },
    { location: [35.6762, 139.6503], size: 0.04 },
    { location: [40.7128, -74.006], size: 0.06 },
    { location: [-33.8688, 151.2093], size: 0.04 },
    { location: [25.2048, 55.2708], size: 0.05 },
    { location: [-22.9068, -43.1729], size: 0.05 },
    { location: [37.9838, 23.7275], size: 0.04 },
    { location: [13.7563, 100.5018], size: 0.04 },
  ],
};

function StepItem({
  label,
  icon: Icon,
  done,
}: {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  done: boolean;
}) {
  return (
    <div className="flex items-center gap-3 bg-white/85 backdrop-blur-sm border border-[#E5E7EB]/60 rounded-xl px-4 py-3 shadow-sm w-full">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
          done
            ? "bg-[#264044] text-white"
            : "bg-[#F3F4F6] text-[#9CA3AF]"
        }`}
      >
        {done ? (
          <Check size={14} strokeWidth={3} />
        ) : (
          <Loader2 size={14} className="animate-spin" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <span
          className={`text-sm font-medium transition-colors ${
            done ? "text-[#264044]" : "text-[#4B5563]"
          }`}
        >
          {label}
        </span>
      </div>
      <Icon
        size={16}
        className={`shrink-0 transition-colors ${
          done ? "text-[#264044]" : "text-[#D1D5DB]"
        }`}
      />
    </div>
  );
}

export function LoadingScreen() {
  const [msgIndex, setMsgIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(0);

  // Rotate messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2300);
    return () => clearInterval(interval);
  }, []);

  // Progress through steps
  useEffect(() => {
    const timers = steps.map((_, i) =>
      setTimeout(() => setCompletedSteps(i + 1), 1800 + i * 2000)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="h-[calc(100dvh-64px)] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Globe background */}
      <div className="absolute inset-0 opacity-35 pointer-events-none">
        <Globe config={globeConfig} className="!max-w-[500px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-sm">
        <h2 className="text-2xl font-extrabold text-[#111] mb-2 text-center">
          On cherche pour vous...
        </h2>

        <p
          key={msgIndex}
          className="text-[#264044] text-sm font-medium mb-6 animate-pulse text-center"
        >
          {loadingMessages[msgIndex]}
        </p>

        {/* Steps with AnimatedList */}
        <AnimatedList delay={1500} className="w-full gap-2.5">
          {steps.map((step, i) => (
            <StepItem
              key={step.label}
              label={step.label}
              icon={step.icon}
              done={i < completedSteps}
            />
          ))}
        </AnimatedList>
      </div>
    </div>
  );
}
