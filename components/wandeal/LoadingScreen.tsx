"use client";

import { useState, useEffect } from "react";
import { Heart, CloudSun, Calculator, Trophy, Check, Loader2, X, Globe, Compass } from "lucide-react";
import { useTranslations } from "next-intl";
import { AnimatedList } from "@/components/ui/animated-list";

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
    <div className="flex items-center gap-3 bg-white border border-[#E5E7EB]/60 rounded-xl px-4 py-3 shadow-sm w-full">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
          done ? "bg-[#1C48CD] text-white" : "bg-[#F3F4F6] text-[#6B7280]"
        }`}
      >
        {done ? <Check size={14} strokeWidth={3} /> : <Loader2 size={14} className="animate-spin" />}
      </div>
      <span
        className={`text-sm font-medium flex-1 transition-colors ${
          done ? "text-[#1C48CD]" : "text-[#4B5563]"
        }`}
      >
        {label}
      </span>
      <Icon size={16} className={`shrink-0 transition-colors ${done ? "text-[#1C48CD]" : "text-[#9CA3AF]"}`} />
    </div>
  );
}

interface LoadingScreenProps {
  onCancel?: () => void;
  /** True once the results have actually arrived. */
  done?: boolean;
}

const STEP_ICONS = [Heart, CloudSun, Calculator, Trophy];

export function LoadingScreen({ onCancel, done = false }: LoadingScreenProps) {
  const t = useTranslations("loading");
  const [msgIndex, setMsgIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(0);

  const messages = [t("msg1"), t("msg2"), t("msg3"), t("msg4"), t("msg5")];
  const steps = [
    { label: t("step1"), icon: STEP_ICONS[0] },
    { label: t("step2"), icon: STEP_ICONS[1] },
    { label: t("step3"), icon: STEP_ICONS[2] },
    { label: t("step4"), icon: STEP_ICONS[3] },
  ];

  useEffect(() => {
    const interval = setInterval(() => setMsgIndex((prev) => (prev + 1) % 5), 2300);
    return () => clearInterval(interval);
  }, []);

  // The last step deliberately stays in progress until the request really
  // finishes — otherwise the checklist claims to be done while we are still
  // waiting, which reads as a frozen app.
  useEffect(() => {
    const timers = [0, 1, 2].map((i) =>
      setTimeout(() => setCompletedSteps((c) => Math.max(c, i + 1)), 1800 + i * 2000)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  // Once the results land, every step is complete — derived, not synced.
  const shownCompleted = done ? steps.length : completedSteps;

  return (
    <div
      className="h-[calc(100dvh-64px)] flex flex-col items-center justify-center px-4 relative"
      role="status"
      aria-live="polite"
      aria-busy={!done}
    >
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-6 right-6 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E5E7EB] bg-white text-xs font-medium text-[#4B5563] hover:border-[#1C48CD] hover:text-[#1C48CD] transition-all cursor-pointer"
        >
          <X size={14} />
          {t("cancel")}
        </button>
      )}

      <div className="mb-8 relative">
        <div className="w-20 h-20 rounded-full bg-[#EEF2FF] flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-[#1C48CD] flex items-center justify-center motion-safe:animate-[spin_8s_linear_infinite]">
            <Globe size={24} className="text-white" />
          </div>
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#1C48CD] flex items-center justify-center">
          <Compass size={12} className="text-white motion-safe:animate-[spin_3s_linear_infinite]" />
        </div>
      </div>

      <h2 className="text-2xl font-extrabold text-[#111] mb-2 text-center">{t("title")}</h2>

      <p key={msgIndex} className="text-[#1C48CD] text-sm font-medium mb-8 motion-safe:animate-pulse text-center">
        {messages[msgIndex]}
      </p>

      <div className="w-full max-w-sm">
        <AnimatedList delay={1500} className="w-full gap-2.5">
          {steps.map((step, i) => (
            <StepItem key={step.label} label={step.label} icon={step.icon} done={i < shownCompleted} />
          ))}
        </AnimatedList>
      </div>
    </div>
  );
}
