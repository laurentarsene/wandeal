import type {
  SearchFormData,
  TransportMode,
  AccommodationType,
  ComfortLevel,
  DateConstraintTag,
} from "./types";
import { SUPPORTED_LOCALES } from "./site";

const TRANSPORTS: TransportMode[] = ["plane", "train", "car", "bike"];
const ACCOMMODATIONS: AccommodationType[] = ["hotel", "hostel", "airbnb", "camping"];
const COMFORTS: ComfortLevel[] = ["budget", "standard", "premium"];
const DATE_TAGS: DateConstraintTag[] = [
  "weekend",
  "holidays-wb",
  "holidays-fl",
  "off-holidays",
  "bridge",
];
const INTERESTS = [
  "soleil", "plage", "ski", "trek", "gastronomie", "teuf", "famille", "culture",
  "detente", "nature", "citybreak", "romantique", "aventure", "surf", "plongee",
  "shopping", "spa", "roadtrip", "safari", "histoire", "festival", "backpacker",
];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function pickAll<T extends string>(input: unknown, allowed: T[]): T[] {
  if (!Array.isArray(input)) return [];
  return allowed.filter((a) => input.includes(a));
}

function clamp(n: unknown, min: number, max: number, fallback: number): number {
  const v = Number(n);
  if (!Number.isFinite(v)) return fallback;
  return Math.min(max, Math.max(min, Math.round(v)));
}

function isoDate(input: unknown): string {
  const s = String(input ?? "").trim();
  if (!ISO_DATE.test(s)) return "";
  const d = new Date(s + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return "";
  // Reject anything more than 2 years out — keeps prompts (and costs) sane.
  const maxAhead = Date.now() + 2 * 365 * 86400000;
  if (d.getTime() > maxAhead) return "";
  return s;
}

/**
 * Everything below crosses an untrusted boundary and ends up inside an LLM
 * prompt, so it is whitelisted or clamped rather than merely type-cast. The free
 * text field (`city`) is length-capped and stripped of characters that would let
 * a caller inject prompt instructions or blow up token usage.
 */
export function sanitizeForm(
  body: unknown
): (SearchFormData & { locale: string; skipCache: boolean }) | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;

  const city = String(b.city ?? "")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/[<>{}[\]\\`"]/g, "")
    .trim()
    .slice(0, 60);

  let dateFrom = isoDate(b.dateFrom);
  let dateTo = isoDate(b.dateTo);
  if (dateFrom && dateTo && dateTo < dateFrom) [dateFrom, dateTo] = [dateTo, dateFrom];

  const localeRaw = String(b.locale ?? "fr");
  const locale = (SUPPORTED_LOCALES as readonly string[]).includes(localeRaw)
    ? localeRaw
    : "fr";

  return {
    city,
    dateFrom,
    dateTo,
    dateConstraints: pickAll(b.dateConstraints, DATE_TAGS),
    travelers: clamp(b.travelers, 1, 10, 1),
    budgetEnabled: Boolean(b.budgetEnabled),
    budget: clamp(b.budget, 100, 3000, 500),
    durationEnabled: Boolean(b.durationEnabled),
    duration: clamp(b.duration, 2, 28, 7),
    transport: pickAll(b.transport, TRANSPORTS),
    accommodation: pickAll(b.accommodation, ACCOMMODATIONS),
    comfort: COMFORTS.includes(b.comfort as ComfortLevel)
      ? (b.comfort as ComfortLevel)
      : "standard",
    interests: pickAll(b.interests, INTERESTS),
    locale,
    skipCache: Boolean(b.skipCache),
  };
}
