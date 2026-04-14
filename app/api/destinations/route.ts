import { NextResponse } from "next/server";
import OpenAI from "openai";
import { buildPrompt } from "@/lib/destinations";
import { cityToIATA, searchFlights } from "@/lib/flights";
import { getWeather } from "@/lib/weather";
import { getDatePeriodLabel } from "@/lib/school-holidays";
import type { SearchFormData, Destination } from "@/lib/types";

const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY || "",
});

const tpToken = process.env.TRAVELPAYOUTS_TOKEN || "";

// --- Rate limiting (in-memory, resets on cold start) ---
const RATE_LIMIT = 10; // requests per window
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour
const ipRequests = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
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
const responseCache = new Map<string, { data: Destination[]; expiresAt: number }>();

function getCacheKey(form: SearchFormData & { locale?: string }): string {
  const key = JSON.stringify({
    city: form.city,
    dateFrom: form.dateFrom,
    dateTo: form.dateTo,
    dateConstraints: form.dateConstraints,
    transport: form.transport,
    accommodation: form.accommodation,
    comfort: form.comfort,
    interests: form.interests,
    budgetEnabled: form.budgetEnabled,
    budget: form.budgetEnabled ? form.budget : 0,
    durationEnabled: form.durationEnabled,
    duration: form.durationEnabled ? form.duration : 0,
    locale: form.locale || "fr",
  });
  // Simple hash
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0;
  }
  return hash.toString(36);
}

// Get photos via Wikimedia Commons search — free, no API key, multiple results
async function getPhotoUrls(cityName: string, country: string): Promise<string[]> {
  const searchQueries = [
    `${cityName} ${country} landscape`,
    `${cityName} ${country}`,
    `${cityName} city`,
  ];

  for (const q of searchQueries) {
    try {
      const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(q)}&gsrlimit=6&prop=imageinfo&iiprop=url|mime&iiurlwidth=800&format=json&origin=*`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      const pages = data?.query?.pages;
      if (!pages) continue;

      const urls: string[] = [];
      for (const page of Object.values(pages) as { imageinfo?: { thumburl?: string; mime?: string }[] }[]) {
        const info = page?.imageinfo?.[0];
        if (info?.thumburl && info.mime?.startsWith("image/") && !info.mime.includes("svg")) {
          urls.push(info.thumburl);
        }
        if (urls.length >= 4) break;
      }
      if (urls.length >= 2) return urls;
    } catch {
      // try next query
    }
  }

  // Fallback: Wikipedia pageimage (single)
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(cityName)}&prop=pageimages&pithumbsize=800&format=json`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const pages = data?.query?.pages;
      if (pages) {
        const page = Object.values(pages)[0] as { thumbnail?: { source?: string } };
        if (page?.thumbnail?.source) return [page.thumbnail.source];
      }
    }
  } catch {}

  // Last fallback
  return [`https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=800&h=500&fit=crop&q=80`];
}

export async function POST(request: Request) {
  try {
    // --- Rate limiting ---
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Trop de recherches. Réessayez dans quelques minutes." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { skipCache, ...form } = body as SearchFormData & { skipCache?: boolean };

    // --- Check cache ---
    const cacheKey = getCacheKey(form);
    const cached = responseCache.get(cacheKey);
    if (!skipCache && cached && Date.now() < cached.expiresAt) {
      return NextResponse.json({ destinations: cached.data });
    }

    // --- Step 1: LLM suggests destinations ---
    const prompt = buildPrompt(form);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
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
    const cleaned = raw
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/gi, "")
      .trim();

    const parsed = JSON.parse(cleaned) as { destinations: Destination[] };

    if (!parsed.destinations || !Array.isArray(parsed.destinations)) {
      throw new Error("Format de réponse invalide");
    }

    let destinations = parsed.destinations;

    // --- Step 2: Enrich with real data + photos ---
    let originCode: string | null = null;
    if (form.city.trim()) {
      originCode = await cityToIATA(form.city).catch(() => null);
    }

    destinations = await Promise.all(
      destinations.map(async (dest) => {
        const enriched = { ...dest };

        // --- Dates ---
        if (form.dateFrom && form.dateTo) {
          // User picked both dates → use them
          enriched.dateFrom = form.dateFrom;
          enriched.dateTo = form.dateTo;
          // Recalculate nights from the chosen dates
          const msPerDay = 86400000;
          const diff = Math.round((new Date(form.dateTo).getTime() - new Date(form.dateFrom).getTime()) / msPerDay);
          if (diff > 0) enriched.nights = diff;
        } else if (form.dateFrom && !form.dateTo) {
          // Only departure → compute dateTo from nights
          enriched.dateFrom = form.dateFrom;
          const d = new Date(form.dateFrom);
          d.setDate(d.getDate() + (enriched.nights || 5));
          enriched.dateTo = d.toISOString().slice(0, 10);
        }
        // else: AI-suggested dates (dateFrom/dateTo already in LLM response)

        // Fix missing or past dates (AI often suggests dates in the past)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const needsFix = !enriched.dateFrom || !enriched.dateTo
          || new Date(enriched.dateFrom) < today;

        if (needsFix) {
          // Keep the same month/day but shift to the next occurrence in the future
          let start: Date;
          if (enriched.dateFrom) {
            start = new Date(enriched.dateFrom);
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

        // --- Photo ---
        const photos = await getPhotoUrls(dest.name, dest.country);
        enriched.photoUrl = photos[0];
        enriched.photoUrls = photos;

        // --- IATA codes (always resolve for Skyscanner links) ---
        if (originCode) enriched.originIata = originCode;
        try {
          const destCode = await cityToIATA(dest.name);
          if (destCode) enriched.destIata = destCode;
        } catch {
          // Keep without IATA
        }

        // --- Real flights via Travelpayouts (optional, needs token) ---
        if (tpToken && originCode && enriched.destIata && !dest.isLocal) {
          try {
            const flight = await searchFlights(
              originCode,
              enriched.destIata,
              enriched.dateFrom || undefined,
              enriched.dateTo || undefined,
              tpToken
            );
            if (flight) {
              enriched.flightPrice = flight.price;
              enriched.totalPerPerson =
                flight.price + enriched.hotelPerNight * enriched.nights;
            }
          } catch {
            // Keep LLM estimate
          }
        }

        // --- Force bike transport pricing ---
        if (form.transport.length === 1 && form.transport[0] === "bike") {
          enriched.flightPrice = 0;
          enriched.totalPerPerson = enriched.hotelPerNight * enriched.nights;
        }

        // --- Real weather via Open-Meteo (use per-destination dates) ---
        try {
          const weather = await getWeather(
            dest.name,
            enriched.dateFrom || undefined,
            enriched.dateTo || undefined
          );
          if (weather) {
            enriched.tempMin = weather.tempMin;
            enriched.tempMax = weather.tempMax;
            enriched.weatherIcon = weather.icon;
          }
        } catch {
          // Keep LLM estimate
        }

        // Recalculate total
        enriched.totalPerPerson =
          enriched.flightPrice + enriched.hotelPerNight * enriched.nights;

        // Validate datePeriodLabel against real calendar data
        if (enriched.dateFrom && enriched.dateTo) {
          const realLabel = getDatePeriodLabel(enriched.dateFrom, enriched.dateTo);
          enriched.datePeriodLabel = realLabel || undefined;
        }

        return enriched;
      })
    );

    // --- Step 3: Post-filter ---
    // Remove destinations over budget
    if (form.budgetEnabled) {
      const maxBudget = form.budget;
      destinations = destinations.filter((d) => d.totalPerPerson <= maxBudget * 1.1); // 10% tolerance
      // If too few results after filtering, keep the cheapest ones from original
      if (destinations.length < 4) {
        const allWithPhotos = await Promise.all(
          parsed.destinations.map(async (d) => ({
            ...d,
            photoUrl: (await getPhotoUrls(d.name, d.country))[0],
            totalPerPerson: d.flightPrice + d.hotelPerNight * d.nights,
          }))
        );
        const allSorted = allWithPhotos.sort((a, b) => a.totalPerPerson - b.totalPerPerson);
        destinations = allSorted.slice(0, 8);
      }
    }

    // Sort by matchScore descending
    destinations.sort((a, b) => b.matchScore - a.matchScore);

    // Cache the result
    responseCache.set(cacheKey, { data: destinations, expiresAt: Date.now() + CACHE_TTL });

    return NextResponse.json({ destinations });
  } catch (error) {
    console.error("API destinations error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de la génération des destinations",
      },
      { status: 500 }
    );
  }
}
