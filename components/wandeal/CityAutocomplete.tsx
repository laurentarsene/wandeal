"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { MapPin } from "lucide-react";
import { searchCities } from "@/lib/cities";

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
}

export function CityAutocomplete({ value, onChange }: CityAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [suggestions, setSuggestions] = useState<
    { city: string; country: string }[]
  >([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const results = searchCities(value);
    setSuggestions(results);
    setOpen(results.length > 0 && document.activeElement === inputRef.current);
    setActiveIndex(-1);
  }, [value]);

  const updatePos = useCallback(() => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
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
        inputRef.current && !inputRef.current.contains(e.target as Node) &&
        listRef.current && !listRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const select = (city: string) => {
    onChange(city);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      select(suggestions[activeIndex].city);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        data-city-input
        type="text"
        placeholder="Ville ou pays..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          if (suggestions.length > 0) setOpen(true);
        }}
        onKeyDown={handleKeyDown}
        className="w-full text-base font-medium text-[#111] placeholder:text-[#9CA3AF] bg-transparent border-none outline-none py-2"
        autoComplete="off"
      />

      {open && suggestions.length > 0 && mounted && createPortal(
        <ul
          ref={listRef}
          className="fixed z-[9999] bg-white border border-[#E5E7EB] rounded-xl shadow-xl overflow-hidden"
          style={{ top: pos.top, left: pos.left, width: pos.width }}
        >
          {suggestions.map((entry, i) => (
            <li
              key={`${entry.city}-${entry.country}`}
              onClick={() => select(entry.city)}
              onMouseEnter={() => setActiveIndex(i)}
              className={`
                flex items-center gap-2.5 px-4 py-2.5 text-sm cursor-pointer transition-colors
                ${i === activeIndex ? "bg-[#EEF2FF] text-[#1e2a4a]" : "text-[#4B5563] hover:bg-[#F9FAFB]"}
              `}
            >
              <MapPin size={14} className="text-[#9CA3AF] shrink-0" />
              <span className="font-medium">{entry.city}</span>
              <span className="text-[#9CA3AF] text-xs ml-auto">
                {entry.country}
              </span>
            </li>
          ))}
        </ul>,
        document.body
      )}
    </>
  );
}
