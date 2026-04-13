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

// Get the main Wikipedia photo for a city — free, no API key, relevant results
async function getPhotoUrl(cityName: string, country: string): Promise<string> {
  const queries = [cityName, `${cityName} ${country}`];

  for (const q of queries) {
    try {
      const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(q)}&prop=pageimages&pithumbsize=800&format=json`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      const pages = data?.query?.pages;
      if (!pages) continue;
      const page = Object.values(pages)[0] as { thumbnail?: { source?: string } };
      if (page?.thumbnail?.source) return page.thumbnail.source;
    } catch {
      // try next query
    }
  }

  // Fallback: generic travel photo based on city name hash
  const fallbacks = [
    "1500835556837-99ac94a94552",
    "1488085061387-422e29b40080",
    "1507525428034-b723cf961d3e",
    "1502602898657-3e91760cbb34",
    "1523906834658-6e24ef2386f9",
    "1469854523086-cc02fe5d8800",
  ];
  let hash = 0;
  for (let i = 0; i < cityName.length; i++) {
    hash = ((hash << 5) - hash + cityName.charCodeAt(i)) | 0;
  }
  return `https://images.unsplash.com/photo-${fallbacks[Math.abs(hash) % fallbacks.length]}?w=800&h=500&fit=crop&q=80`;
}

export async function POST(request: Request) {
  try {
    const form: SearchFormData = await request.json();

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
        enriched.photoUrl = await getPhotoUrl(dest.name, dest.country);

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
            photoUrl: await getPhotoUrl(d.name, d.country),
            totalPerPerson: d.flightPrice + d.hotelPerNight * d.nights,
          }))
        );
        const allSorted = allWithPhotos.sort((a, b) => a.totalPerPerson - b.totalPerPerson);
        destinations = allSorted.slice(0, 8);
      }
    }

    // Sort by matchScore descending
    destinations.sort((a, b) => b.matchScore - a.matchScore);

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
