import { NextResponse } from "next/server";
import OpenAI from "openai";
import { buildPrompt } from "@/lib/destinations";
import { cityToIATA, searchFlights } from "@/lib/flights";
import { buildFlightUrl, buildHotelUrl, getMarker } from "@/lib/affiliate";
import { getWeather } from "@/lib/weather";
import { getDatePeriod } from "@/lib/school-holidays";
import { sanitizeForm } from "@/lib/validate";
import { slugify } from "@/lib/utils";
import type { SearchFormData, Destination, ColorTheme, WeatherIcon } from "@/lib/types";

// The LLM call alone routinely takes 15-30s for 8 destinations, on top of the
// enrichment round-trips, and a slow completion can double that. The platform
// default (10s) kills every request, so the ceiling is raised to the Fluid
// compute maximum. Vercel bills actual execution time, not this number — it only
// has to stop being the binding constraint. If a deploy rejects this value, the
// project is not on Fluid compute and 60 is the correct fallback.
export const maxDuration = 300;

const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY || "",
});

const tpToken = process.env.TRAVELPAYOUTS_TOKEN || "";

// --- Rate limiting (in-memory, per instance; resets on cold start) ---
const RATE_LIMIT = 15; // requests per window
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour
const ipRequests = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  // Opportunistic cleanup so the map cannot grow unbounded on a warm instance.
  if (ipRequests.size > 5000) {
    for (const [key, entry] of ipRequests) {
      if (now > entry.resetAt) ipRequests.delete(key);
    }
  }
  const entry = ipRequests.get(ip);
  if (!entry || now > entry.resetAt) {
    ipRequests.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

// --- Response cache (in-memory, 1h TTL) ---
const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const MAX_CACHE_ENTRIES = 200;
const responseCache = new Map<string, { data: Destination[]; expiresAt: number }>();

function getCacheKey(form: SearchFormData & { locale?: string }): string {
  const key = JSON.stringify({
    city: form.city.toLowerCase().trim(),
    dateFrom: form.dateFrom,
    dateTo: form.dateTo,
    dateConstraints: form.dateConstraints,
    transport: form.transport,
    accommodation: form.accommodation,
    comfort: form.comfort,
    interests: form.interests,
    travelers: form.travelers,
    budgetEnabled: form.budgetEnabled,
    budget: form.budgetEnabled ? form.budget : 0,
    durationEnabled: form.durationEnabled,
    duration: form.durationEnabled ? form.duration : 0,
    locale: form.locale || "fr",
  });
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0;
  }
  return hash.toString(36);
}

function cacheSet(key: string, data: Destination[]) {
  if (responseCache.size >= MAX_CACHE_ENTRIES) {
    const oldest = responseCache.keys().next().value;
    if (oldest) responseCache.delete(oldest);
  }
  responseCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL });
}

// --- Photo cache (avoid re-fetching same destination) ---
const photoCache = new Map<string, string[]>();
const pexelsKey = process.env.PEXELS_API_KEY || "";

// Clean destination name for photo search
function cleanPlaceName(name: string): string {
  const cleaned = name
    .replace(/^(ski|spa|trek|surf|plongée|randonnée|road\s*trip|city\s*break)\s*(&|\+|et)\s*\w*\s*(au|aux|à|en|de\s*la|du|des|de)\s*/gi, "")
    .replace(/^(séjour|escapade|weekend|aventure|découverte)\s*(à|au|aux|en|de)\s*/gi, "")
    .trim();
  return cleaned.length >= 4 ? cleaned : name;
}

// Get photos via Pexels API — beautiful, relevant travel photos
async function getPhotoUrls(cityName: string, country: string): Promise<string[]> {
  const cacheKey = `${cityName}-${country}`;
  const cached = photoCache.get(cacheKey);
  if (cached) return cached;

  const cleanName = cleanPlaceName(cityName);

  if (pexelsKey) {
    const queries = [`${cleanName} ${country}`, cleanName];
    for (const q of queries) {
      try {
        const res = await fetch(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=4&orientation=landscape`,
          { headers: { Authorization: pexelsKey }, signal: AbortSignal.timeout(5000) }
        );
        if (!res.ok) continue;
        const data = await res.json();
        const urls = (data.photos || [])
          .map((p: { src?: { large?: string } }) => p.src?.large)
          .filter(Boolean) as string[];
        if (urls.length >= 1) {
          photoCache.set(cacheKey, urls);
          return urls;
        }
      } catch { continue; }
    }
  }

  // Fallback: generic travel photo, deterministic per destination
  const fallbacks = [
    "1500835556837-99ac94a94552",
    "1488085061387-422e29b40080",
    "1507525428034-b723cf961d3e",
    "1502602898657-3e91760cbb34",
    "1523906834658-6e24ef2386f9",
    "1469854523086-cc02fe5d8800",
    "1476514525535-07fb3b4a6e8a",
    "1530789253388-582c481c54b0",
  ];
  let hash = 0;
  for (let i = 0; i < cityName.length; i++) {
    hash = ((hash << 5) - hash + cityName.charCodeAt(i)) | 0;
  }
  const result = [`https://images.unsplash.com/photo-${fallbacks[Math.abs(hash) % fallbacks.length]}?w=800&h=500&fit=crop&q=80`];
  photoCache.set(cacheKey, result);
  return result;
}

// --- LLM output hardening -------------------------------------------------

const THEMES: ColorTheme[] = ["teal", "amber", "blue", "coral", "purple", "green", "slate"];
const WEATHER: WeatherIcon[] = ["sun", "cloud", "snow", "rain"];

function num(v: unknown, fallback: number, min = 0, max = 100000): number {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function strArray(v: unknown, max: number): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x) => typeof x === "string" && x.trim()).slice(0, max).map((s) => String(s).slice(0, 80));
}

/** Coerce whatever the model returned into a well-formed Destination. */
function normalizeDestination(raw: unknown): Destination | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Record<string, unknown>;
  const name = String(d.name ?? "").trim().slice(0, 80);
  if (!name) return null;

  const nights = Math.round(num(d.nights, 5, 1, 60));
  const flightPrice = Math.round(num(d.flightPrice, 0, 0, 20000));
  const hotelPerNight = Math.round(num(d.hotelPerNight, 0, 0, 5000));

  return {
    name,
    country: String(d.country ?? "").trim().slice(0, 60),
    flag: String(d.flag ?? "🌍").slice(0, 8),
    colorTheme: THEMES.includes(d.colorTheme as ColorTheme) ? (d.colorTheme as ColorTheme) : "teal",
    flightPrice,
    hotelPerNight,
    totalPerPerson: flightPrice + hotelPerNight * nights,
    nights,
    tempMin: Math.round(num(d.tempMin, 15, -60, 60)),
    tempMax: Math.round(num(d.tempMax, 22, -60, 60)),
    weatherIcon: WEATHER.includes(d.weatherIcon as WeatherIcon) ? (d.weatherIcon as WeatherIcon) : "sun",
    matchScore: Math.round(num(d.matchScore, 75, 0, 100)),
    matchedInterests: strArray(d.matchedInterests, 6),
    why: String(d.why ?? "").slice(0, 600),
    activities: strArray(d.activities, 8),
    mealPrice: Math.round(num(d.mealPrice, 0, 0, 500)),
    fritesPrice: num(d.fritesPrice, 0, 0, 100),
    dateFrom: typeof d.dateFrom === "string" ? d.dateFrom : "",
    dateTo: typeof d.dateTo === "string" ? d.dateTo : "",
    isLocal: Boolean(d.isLocal),
    isSurprise: Boolean(d.isSurprise),
    transportMode: (["plane", "train", "car", "bike"] as const).includes(
      d.transportMode as "plane"
    )
      ? (d.transportMode as Destination["transportMode"])
      : undefined,
    airportIata: /^[A-Za-z]{3}$/.test(String(d.airportIata ?? ""))
      ? String(d.airportIata).toUpperCase()
      : undefined,
    distanceKm: d.distanceKm != null ? Math.round(num(d.distanceKm, 0, 0, 20000)) : undefined,
    travelHours: d.travelHours != null ? num(d.travelHours, 0, 0, 200) : undefined,
  };
}

async function generateDestinations(prompt: string): Promise<Destination[]> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "Tu es un assistant voyage expert. Tu réponds uniquement en JSON valide, sans backticks ni texte autour.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.8,
    max_tokens: 4000,
  });

  const raw = completion.choices[0]?.message?.content || "";
  const cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/gi, "").trim();

  const parsed = JSON.parse(cleaned) as { destinations?: unknown };
  if (!Array.isArray(parsed.destinations)) throw new Error("invalid_shape");

  const list = parsed.destinations
    .map(normalizeDestination)
    .filter((d): d is Destination => d !== null);
  if (!list.length) throw new Error("invalid_shape");

  // The model occasionally repeats a destination; keep the first occurrence.
  const seen = new Set<string>();
  return list.filter((d) => {
    const key = `${slugify(d.name)}|${slugify(d.country)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function POST(request: Request) {
  try {
    // --- Rate limiting ---
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: "rate_limited", code: "rate_limited" }, { status: 429 });
    }

    if (!process.env.AI_API_KEY) {
      console.error("AI_API_KEY is not configured");
      return NextResponse.json({ error: "server_error", code: "server_error" }, { status: 500 });
    }

    const body = await request.json().catch(() => null);
    const form = sanitizeForm(body);
    if (!form) {
      return NextResponse.json({ error: "bad_request", code: "bad_request" }, { status: 400 });
    }
    const { skipCache } = form;

    // --- Check cache ---
    const cacheKey = getCacheKey(form);
    const cached = responseCache.get(cacheKey);
    if (!skipCache && cached && Date.now() < cached.expiresAt) {
      return NextResponse.json({ destinations: cached.data, cached: true });
    }

    // --- Step 1: LLM suggests destinations (one retry on malformed output) ---
    const prompt = buildPrompt(form);
    let destinations: Destination[];
    try {
      destinations = await generateDestinations(prompt);
    } catch (err) {
      console.warn("LLM output unusable, retrying once:", err);
      destinations = await generateDestinations(prompt);
    }

    // --- Step 2: Enrich with real data + photos ---
    const originCode = form.city.trim()
      ? await cityToIATA(form.city, form.locale).catch(() => null)
      : null;
    if (form.city.trim() && !originCode) {
      // Every flight link on the page depends on this one lookup.
      console.warn(`[wandeal] no IATA for origin "${form.city}" — flight links disabled`);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    destinations = await Promise.all(
      destinations.map(async (dest) => {
        const enriched = { ...dest };

        // --- Dates ---
        if (form.dateFrom && form.dateTo) {
          enriched.dateFrom = form.dateFrom;
          enriched.dateTo = form.dateTo;
          const diff = Math.round(
            (new Date(form.dateTo).getTime() - new Date(form.dateFrom).getTime()) / 86400000
          );
          if (diff > 0) enriched.nights = diff;
        } else if (form.dateFrom && !form.dateTo) {
          enriched.dateFrom = form.dateFrom;
          const d = new Date(form.dateFrom);
          d.setDate(d.getDate() + (enriched.nights || 5));
          enriched.dateTo = d.toISOString().slice(0, 10);
        }

        // Fix missing or past dates (the model often suggests dates in the past)
        const parsedFrom = enriched.dateFrom ? new Date(enriched.dateFrom) : null;
        const needsFix =
          !enriched.dateFrom ||
          !enriched.dateTo ||
          !parsedFrom ||
          Number.isNaN(parsedFrom.getTime()) ||
          parsedFrom < today;

        if (needsFix) {
          let start: Date;
          if (parsedFrom && !Number.isNaN(parsedFrom.getTime())) {
            start = parsedFrom;
            while (start < today) start.setFullYear(start.getFullYear() + 1);
          } else {
            start = new Date();
            start.setDate(start.getDate() + 30);
          }
          enriched.dateFrom = start.toISOString().slice(0, 10);
          const end = new Date(start);
          end.setDate(end.getDate() + (enriched.nights || 5));
          enriched.dateTo = end.toISOString().slice(0, 10);
        }

        // Photos and the IATA lookup do not depend on the dates — fetch together.
        const [photos, destCode] = await Promise.all([
          getPhotoUrls(dest.name, dest.country),
          cityToIATA(dest.name, form.locale).catch(() => null),
        ]);

        enriched.photoUrl = photos[0];
        enriched.photoUrls = photos;
        if (originCode) enriched.originIata = originCode;
        // Regions and villages have no IATA of their own — fall back to the
        // serving airport the model named, so the flight link still works.
        const resolvedDest = destCode || dest.airportIata;
        if (resolvedDest) enriched.destIata = resolvedDest;

        // --- Real flight price via Travelpayouts (optional, needs token) ---
        const datesAreFixed = Boolean(form.dateFrom && form.dateTo);
        let flightDeepLink: string | undefined;

        if (tpToken && originCode && enriched.destIata && !dest.isLocal) {
          try {
            // Fixed dates → search that exact day. Flexible → search the
            // suggested month, so the cheapest fare we find still falls in the
            // season the recommendation was built around.
            const flight = await searchFlights(
              originCode,
              enriched.destIata,
              datesAreFixed ? enriched.dateFrom : enriched.dateFrom.slice(0, 7),
              datesAreFixed ? enriched.dateTo : enriched.dateTo.slice(0, 7),
              tpToken
            );
            if (flight) {
              const outDate = flight.departure_at?.slice(0, 10) || "";
              const backDate = flight.return_at?.slice(0, 10) || "";

              if (datesAreFixed) {
                // The traveller picked these dates. The API answers with the
                // cheapest fare in a window around them, so a price for another
                // week is not the price of this trip — only take it if it lines
                // up, otherwise keep the estimate and link a dated search.
                if (outDate === enriched.dateFrom) {
                  enriched.flightPrice = flight.price;
                  flightDeepLink = flight.link || undefined;
                }
              } else if (outDate && backDate > outDate) {
                // Dates are flexible: adopt the real fare's dates so the price,
                // the card and the link all describe the same trip — but only if
                // it is still the trip we proposed. The cheapest fare in a month
                // is sometimes a six-week round trip, and silently stretching a
                // 7-night break into 41 nights multiplies the hotel total by six.
                const fareNights = Math.round(
                  (new Date(backDate).getTime() - new Date(outDate).getTime()) / 86400000
                );
                const targetNights = form.durationEnabled ? form.duration : enriched.nights;
                const tolerance = Math.max(2, Math.round(targetNights * 0.3));

                if (Math.abs(fareNights - targetNights) <= tolerance) {
                  enriched.flightPrice = flight.price;
                  enriched.dateFrom = outDate;
                  enriched.dateTo = backDate;
                  enriched.nights = Math.max(1, fareNights);
                  flightDeepLink = flight.link || undefined;
                }
                // Otherwise: keep the suggested dates and the estimate, and let
                // the link fall back to a dated search for that exact trip.
              }
            }
          } catch {
            // Keep the LLM estimate
          }
        }

        // --- Force bike transport pricing ---
        if (form.transport.length === 1 && form.transport[0] === "bike") {
          enriched.flightPrice = 0;
        }

        enriched.totalPerPerson =
          enriched.flightPrice + enriched.hotelPerNight * enriched.nights;

        // Weather comes last: it must describe the dates we ended up showing.
        const weather = await getWeather(
          dest.name,
          enriched.dateFrom,
          enriched.dateTo,
          dest.country
        ).catch(() => null);
        if (weather) {
          enriched.tempMin = weather.tempMin;
          enriched.tempMax = weather.tempMax;
          enriched.weatherIcon = weather.icon;
        }

        // Validate the travel-period badge against real calendar data
        const period =
          enriched.dateFrom && enriched.dateTo
            ? getDatePeriod(enriched.dateFrom, enriched.dateTo)
            : null;
        enriched.datePeriodKey = period?.key;
        enriched.datePeriodName = period?.name;

        // --- Affiliate links (built here so the marker is read at runtime) ---
        enriched.flightUrl =
          buildFlightUrl({
            originIata: enriched.originIata,
            destIata: enriched.destIata,
            dateFrom: enriched.dateFrom,
            dateTo: enriched.dateTo,
            travelers: form.travelers,
            deepLink: flightDeepLink,
          }) || undefined;
        enriched.hotelUrl = buildHotelUrl({
          city: dest.name,
          country: dest.country,
          dateFrom: enriched.dateFrom,
          dateTo: enriched.dateTo,
          travelers: form.travelers,
        });

        return enriched;
      })
    );

    // --- Step 3: Post-filter ---
    if (form.budgetEnabled) {
      const maxBudget = form.budget;
      const withinBudget = destinations.filter((d) => d.totalPerPerson <= maxBudget * 1.1);
      // If the filter is too aggressive, fall back to the cheapest *enriched*
      // results rather than the raw model output, so cards keep their photos,
      // fixed dates and affiliate links.
      destinations =
        withinBudget.length >= 4
          ? withinBudget
          : [...destinations].sort((a, b) => a.totalPerPerson - b.totalPerPerson).slice(0, 8);
    }

    destinations.sort((a, b) => b.matchScore - a.matchScore);

    if (!destinations.length) {
      return NextResponse.json({ error: "no_results", code: "no_results" }, { status: 404 });
    }

    cacheSet(cacheKey, destinations);

    return NextResponse.json({
      destinations,
      monetized: Boolean(getMarker()),
    });
  } catch (error) {
    console.error("API destinations error:", error);
    return NextResponse.json({ error: "server_error", code: "server_error" }, { status: 500 });
  }
}
