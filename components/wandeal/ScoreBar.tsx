"use client";

import { motion } from "motion/react";

interface ScoreBarProps {
  score: number;
}

export function ScoreBar({ score }: ScoreBarProps) {
  const scoreColor =
    score >= 85 ? "#16A34A" : score >= 70 ? "#F59E0B" : "#475569";

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full bg-[#F3F4F6] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: score >= 85
              ? "linear-gradient(90deg, #F59E0B, #EF4444)"
              : score >= 70
                ? "linear-gradient(90deg, #F59E0B, #FB923C)"
                : "linear-gradient(90deg, #9CA3AF, #6B7280)",
          }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        />
      </div>
      <span
        className="text-sm font-bold tabular-nums min-w-[48px] text-right"
        style={{ color: scoreColor }}
      >
        {score}%
      </span>
    </div>
  );
}
