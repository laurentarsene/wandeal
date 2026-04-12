"use client";

import { useState, useEffect } from "react";
import {
  Heart,
  CloudSun,
  Calculator,
  Trophy,
  Check,
  Loader2,
  X,
} from "lucide-react";
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
          done ? "bg-[#264044] text-white" : "bg-[#F3F4F6] text-[#9CA3AF]"
        }`}
      >
        {done ? (
          <Check size={14} strokeWidth={3} />
        ) : (
          <Loader2 size={14} className="animate-spin" />
        )}
      </div>
      <span
        className={`text-sm font-medium flex-1 transition-colors ${
          done ? "text-[#264044]" : "text-[#4B5563]"
        }`}
      >
        {label}
      </span>
      <Icon
        size={16}
        className={`shrink-0 transition-colors ${
          done ? "text-[#264044]" : "text-[#D1D5DB]"
        }`}
      />
    </div>
  );
}

interface LoadingScreenProps {
  onCancel?: () => void;
}

export function LoadingScreen({ onCancel }: LoadingScreenProps) {
  const t = useTranslations("loading");
  const [msgIndex, setMsgIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(0);

  const messages = [t("msg1"), t("msg2"), t("msg3"), t("msg4"), t("msg5")];
  const steps = [
    { label: t("step1"), icon: Heart },
    { label: t("step2"), icon: CloudSun },
    { label: t("step3"), icon: Calculator },
    { label: t("step4"), icon: Trophy },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % 5);
    }, 2300);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timers = steps.map((_, i) =>
      setTimeout(() => setCompletedSteps(i + 1), 1800 + i * 2000)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="h-[calc(100dvh-64px)] flex flex-col items-center justify-center px-4 relative">
      {/* Cancel button */}
      {onCancel && (
        <button
          onClick={onCancel}
          className="absolute top-6 right-6 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E5E7EB] bg-white text-xs font-medium text-[#6B7280] hover:border-[#264044] hover:text-[#264044] transition-all cursor-pointer"
        >
          <X size={14} />
          Annuler
        </button>
      )}

      {/* Animated travel icon */}
      <div className="mb-8 relative">
        <div className="w-20 h-20 rounded-full bg-[#e8f0f1] flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-[#264044] flex items-center justify-center animate-pulse">
            <span className="text-white text-2xl">✈</span>
          </div>
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#264044] flex items-center justify-center">
          <Loader2 size={12} className="text-white animate-spin" />
        </div>
      </div>

      <h2 className="text-2xl font-extrabold text-[#111] mb-2 text-center">
        {t("title")}
      </h2>

      <p
        key={msgIndex}
        className="text-[#264044] text-sm font-medium mb-8 animate-pulse text-center"
      >
        {messages[msgIndex]}
      </p>

      {/* Steps */}
      <div className="w-full max-w-sm">
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
