"use client";

import { useState, useRef, useEffect, useCallback, useId } from "react";
import { useIsMounted } from "@/lib/useIsMounted";
import { createPortal } from "react-dom";
import { MapPin } from "lucide-react";
import { searchCities } from "@/lib/cities";

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function CityAutocomplete({
  value,
  onChange,
  placeholder = "Départ de...",
}: CityAutocompleteProps) {
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const mounted = useIsMounted();

  // Derived during render — no effect, no extra render pass.
  const suggestions = searchCities(value);
  const open = focused && !dismissed && suggestions.length > 0;

  const updatePos = useCallback(() => {
    if (!inputRef.current) return;
    const rect = inputRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
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
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        setDismissed(true);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const select = (city: string) => {
    onChange(city);
    setDismissed(true);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "ArrowDown" && suggestions.length > 0) setDismissed(false);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      select(suggestions[activeIndex].city);
    } else if (e.key === "Escape") {
      setDismissed(true);
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        data-city-input
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          open && activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined
        }
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setDismissed(false);
          setActiveIndex(-1);
        }}
        onFocus={() => {
          setFocused(true);
          setDismissed(false);
        }}
        onBlur={() => setFocused(false)}
        onKeyDown={handleKeyDown}
        className="w-full text-base font-medium text-[#111] placeholder:text-[#6B7280] bg-transparent border-none outline-none py-2"
        autoComplete="off"
      />

      {open &&
        mounted &&
        createPortal(
          <ul
            id={listId}
            ref={listRef}
            role="listbox"
            className="fixed z-[9999] bg-white border border-[#E5E7EB] rounded-xl shadow-xl overflow-hidden"
            style={{ top: pos.top, left: pos.left, width: pos.width }}
          >
            {suggestions.map((entry, i) => (
              <li
                key={`${entry.city}-${entry.country}`}
                id={`${listId}-option-${i}`}
                role="option"
                aria-selected={i === activeIndex}
                // The input keeps focus, so blur must not close the list first.
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => select(entry.city)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`
                  flex items-center gap-2.5 px-4 py-2.5 text-sm cursor-pointer transition-colors
                  ${i === activeIndex ? "bg-[#EEF2FF] text-[#1e2a4a]" : "text-[#4B5563] hover:bg-[#F9FAFB]"}
                `}
              >
                <MapPin size={14} className="text-[#6B7280] shrink-0" />
                <span className="font-medium">{entry.city}</span>
                <span className="text-[#6B7280] text-xs ml-auto">{entry.country}</span>
              </li>
            ))}
          </ul>,
          document.body
        )}
    </>
  );
}
