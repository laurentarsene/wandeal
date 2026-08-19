// Travelpayouts / Aviasales API for real flight prices

import { slugify } from "./utils";

const BASE = "https://api.travelpayouts.com/aviasales";

export interface FlightResult {
  price: number;
  airline: string;
  departure_at: string;
  return_at: string;
  /** Relative Aviasales path ("/search/BRU2909LIS1?t=…") for the exact priced itinerary. */
  link: string;
}

interface PriceEntry {
  price: number;
  airline: string;
  departure_at: string;
  return_at?: string;
  link?: string;
}

// Search the cheapest round-trip from origin to destination
export async function searchFlights(
  origin: string, // IATA code e.g. "BRU"
  destination: string, // IATA code e.g. "LIS"
  departDate?: string, // YYYY-MM or YYYY-MM-DD
  returnDate?: string,
  token?: string
): Promise<FlightResult | null> {
  if (!token) return null;

  const params = new URLSearchParams({
    currency: "eur",
    origin,
    destination,
    sorting: "price",
    unique: "false",
    direct: "false",
    limit: "30",
    page: "1",
    one_way: returnDate ? "false" : "true",
    token,
  });

  if (departDate) params.set("depart_date", departDate);
  if (returnDate) params.set("return_date", returnDate);

  const res = await fetch(`${BASE}/v3/prices_for_dates?${params.toString()}`, {
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) return null;

  const data = await res.json();
  const entries: PriceEntry[] = Array.isArray(data?.data) ? data.data : [];
  if (!entries.length) return null;

  // `sorting=price` is best-effort on the API side — sort defensively so the
  // price we display is genuinely the cheapest one we found.
  const cheapest = entries
    .filter((e) => typeof e.price === "number" && e.price > 0)
    .sort((a, b) => a.price - b.price)[0];
  if (!cheapest) return null;

  return {
    price: Math.round(cheapest.price),
    airline: cheapest.airline,
    departure_at: cheapest.departure_at,
    return_at: cheapest.return_at || "",
    link: cheapest.link || "",
  };
}

/**
 * Levenshtein distance, capped — used only to tell "Bruxelles/Brussels" apart
 * from "Dolomites/Dortmund".
 */
function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const curr = [i];
    for (let j = 1; j <= n; j++) {
      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    prev = curr;
  }
  return prev[n];
}

/**
 * The autocomplete is fuzzy: asking for a region ("Dolomites", "Forêt Noire")
 * happily returns an unrelated city, which would produce a wrong — and therefore
 * worthless — flight link. Accept a result only when the returned name is
 * plausibly the place we asked for.
 */
function namesMatch(query: string, candidate: string): boolean {
  const a = slugify(query);
  const b = slugify(candidate);
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.startsWith(b) || b.startsWith(a) || a.includes(b) || b.includes(a)) return true;
  // "Bruxelles" vs "Brussels", "Barcelone" vs "Barcelona", "Lisbonne" vs "Lisbon"
  const tolerance = Math.max(2, Math.floor(Math.min(a.length, b.length) / 3));
  return editDistance(a, b) <= tolerance;
}

/**
 * Resolve a city name to an IATA code. Free API, no token needed.
 * The locale matters: the place names we search with come from the user's own
 * language, so querying in another one produces near-misses we would reject.
 */
export async function cityToIATA(
  cityName: string,
  locale = "en"
): Promise<string | null> {
  const term = cityName.trim();
  if (term.length < 2) return null;

  let res: Response;
  try {
    res = await fetch(
      `https://autocomplete.travelpayouts.com/places2?term=${encodeURIComponent(
        term
      )}&locale=${encodeURIComponent(locale)}&types[]=city`,
      { signal: AbortSignal.timeout(5000) }
    );
  } catch {
    return null;
  }
  if (!res.ok) return null;

  const data = await res.json().catch(() => null);
  if (!Array.isArray(data) || !data.length) return null;

  // Prefer an entry whose name actually resembles the query, not just the first.
  // The weight filter drops general-aviation strips that share a town's name —
  // "Cascais" resolves to CAT, an aerodrome with no scheduled service, and a
  // flight search for it comes back empty. Returning null lets the caller fall
  // back to the airport that actually serves the destination.
  const match =
    data.find(
      (e) =>
        e?.code &&
        Number(e.weight ?? 0) >= 25 &&
        namesMatch(term, String(e.name || ""))
    ) || null;

  return match?.code ?? null;
}
