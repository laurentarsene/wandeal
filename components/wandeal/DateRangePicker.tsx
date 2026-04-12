"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { fr } from "date-fns/locale";
import { format } from "date-fns";
import "react-day-picker/style.css";

interface DateRangePickerProps {
  dateFrom: string;
  dateTo: string;
  onChange: (dateFrom: string, dateTo: string) => void;
}

function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDate(str: string): Date | undefined {
  if (!str) return undefined;
  const d = new Date(str + "T00:00:00");
  return isNaN(d.getTime()) ? undefined : d;
}

export function DateRangePicker({
  dateFrom,
  dateTo,
  onChange,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => setMounted(true), []);

  const from = parseDate(dateFrom);
  const to = parseDate(dateTo);

  // Internal range state for the calendar
  const [internalRange, setInternalRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from, to });

  // Sync internal state when props change from outside (presets, clear)
  useEffect(() => {
    if (!open) {
      setInternalRange({ from: parseDate(dateFrom), to: parseDate(dateTo) });
    }
  }, [dateFrom, dateTo, open]);

  const updatePos = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + 8,
      left: Math.max(8, Math.min(rect.left, window.innerWidth - 620)),
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePos();
    window.addEventListener("resize", updatePos);
    window.addEventListener("scroll", updatePos, true);
    return () => {
      window.removeEventListener("resize", updatePos);
      window.removeEventListener("scroll", updatePos, true);
    };
  }, [open, updatePos]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        // Propagate whatever we have when closing
        if (internalRange.from) {
          onChange(toDateStr(internalRange.from), internalRange.to ? toDateStr(internalRange.to) : "");
        }
        setOpen(false);
      }
    }
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClick);
    }, 10);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [open, internalRange, onChange]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (internalRange.from) {
          onChange(toDateStr(internalRange.from), internalRange.to ? toDateStr(internalRange.to) : "");
        }
        setOpen(false);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, internalRange, onChange]);

  const handleDayClick = (day: Date) => {
    if (!internalRange.from || internalRange.to) {
      // Start new selection
      setInternalRange({ from: day, to: undefined });
      onChange(toDateStr(day), "");
    } else {
      // Complete the range
      let rangeFrom = internalRange.from;
      let rangeTo = day;
      if (rangeTo < rangeFrom) {
        [rangeFrom, rangeTo] = [rangeTo, rangeFrom];
      }
      setInternalRange({ from: rangeFrom, to: rangeTo });
      onChange(toDateStr(rangeFrom), toDateStr(rangeTo));
      setTimeout(() => setOpen(false), 300);
    }
  };

  const clear = () => {
    setInternalRange({ from: undefined, to: undefined });
    onChange("", "");
  };

  const closePanel = () => {
    if (internalRange.from) {
      onChange(toDateStr(internalRange.from), internalRange.to ? toDateStr(internalRange.to) : "");
    }
    setOpen(false);
  };

  const hasAnyDate = !!dateFrom;

  let label: string;
  let sublabel: string | null = null;
  if (from && to) {
    label = `${format(from, "d MMM", { locale: fr })} → ${format(to, "d MMM yyyy", { locale: fr })}`;
  } else if (from) {
    label = `Départ le ${format(from, "d MMM yyyy", { locale: fr })}`;
    sublabel = "Retour flexible";
  } else {
    label = "Je ne sais pas encore";
    sublabel = "Pas de souci, on s'adapte";
  }

  // Build modifiers for the calendar
  const selected = internalRange.from
    ? internalRange.to
      ? { from: internalRange.from, to: internalRange.to }
      : internalRange.from
    : undefined;

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (!open) {
            setInternalRange({ from, to });
          }
          setOpen(!open);
        }}
        className={`
          w-full flex items-center gap-2.5 cursor-pointer text-left transition-colors
          ${hasAnyDate ? "text-[#111]" : "text-[#9CA3AF]"}
        `}
      >
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium">{label}</span>
          {sublabel && (
            <span className="block text-[10px] text-[#9CA3AF] mt-0.5">
              {sublabel}
            </span>
          )}
        </div>
        {hasAnyDate && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              clear();
            }}
            className="p-1 rounded-full hover:bg-[#F3F4F6] transition-colors shrink-0"
          >
            <X size={12} className="text-[#9CA3AF]" />
          </span>
        )}
      </button>

      {open &&
        mounted &&
        createPortal(
          <div
            ref={panelRef}
            className="fixed z-[9999] bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] p-5"
            style={{ top: pos.top, left: pos.left }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-[#111]">
                Choisissez vos dates
              </p>
              <div className="flex items-center gap-3">
                {(internalRange.from || hasAnyDate) && (
                  <button
                    type="button"
                    onClick={clear}
                    className="text-xs text-[#264044] font-medium hover:underline cursor-pointer"
                  >
                    Effacer
                  </button>
                )}
                <button
                  type="button"
                  onClick={closePanel}
                  className="text-xs text-[#6B7280] font-medium hover:underline cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
            <p className="text-[11px] text-[#9CA3AF] mb-3">
              {internalRange.from && !internalRange.to
                ? "Cliquez sur une date de retour, ou fermez pour un retour flexible"
                : "Cliquez sur un départ, puis un retour — ou juste un départ"}
            </p>
            <DayPicker
              mode="single"
              selected={selected as Date | undefined}
              onDayClick={handleDayClick}
              numberOfMonths={2}
              locale={fr}
              disabled={{ before: new Date() }}
              modifiers={{
                range_start: internalRange.from ? [internalRange.from] : [],
                range_end: internalRange.to ? [internalRange.to] : [],
                range_middle:
                  internalRange.from && internalRange.to
                    ? {
                        after: internalRange.from,
                        before: internalRange.to,
                      }
                    : [],
              }}
              modifiersClassNames={{
                range_start:
                  "!bg-[#264044] !text-white !rounded-l-full",
                range_end:
                  "!bg-[#264044] !text-white !rounded-r-full",
                range_middle: "!bg-[#e8f0f1] !text-[#1a2e31] !rounded-none",
                selected: "!bg-[#264044] !text-white !rounded-full",
              }}
              className="rdp-wandeal"
            />
          </div>,
          document.body
        )}
    </div>
  );
}
