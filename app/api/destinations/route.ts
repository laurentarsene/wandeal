import { NextResponse } from "next/server";
import OpenAI from "openai";
import { buildPrompt } from "@/lib/destinations";
import { searchLocation, searchFlights, buildFlightSearch } from "@/lib/kiwi";
import { getWeather } from "@/lib/weather";
import type { SearchFormData, Destination } from "@/lib/types";

const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY || "",
});

const kiwiKey = process.env.KIWI_API_KEY || "";

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

    // --- Step 2: Enrich with real data (Kiwi flights + Open-Meteo weather) ---
    // Only if Kiwi API key is configured
    const hasKiwi = kiwiKey.length > 0;

    // Resolve departure city code
    let fromCode: string | null = null;
    if (hasKiwi && form.city.trim()) {
      fromCode = await searchLocation(form.city, kiwiKey).catch(() => null);
    }

    // Enrich each destination in parallel
    destinations = await Promise.all(
      destinations.map(async (dest) => {
        const enriched = { ...dest };

        // --- Real flights via Kiwi ---
        if (hasKiwi && fromCode && !dest.isLocal) {
          try {
            const toCode = await searchLocation(dest.name, kiwiKey);
            if (toCode) {
              const search = buildFlightSearch(
                fromCode,
                toCode,
                form.dateFrom || undefined,
                form.dateTo || undefined,
                form.durationEnabled ? form.duration : undefined,
                form.travelers
              );
              const flight = await searchFlights(search, kiwiKey);
              if (flight) {
                enriched.flightPrice = Math.round(flight.price / (form.travelers || 1));
                enriched.nights = flight.nightsInDest || dest.nights;
                enriched.totalPerPerson =
                  enriched.flightPrice +
                  enriched.hotelPerNight * enriched.nights;
                // Store booking link in activities as last item
                if (flight.deep_link) {
                  enriched.bookingUrl = flight.deep_link;
                }
              }
            }
          } catch {
            // Keep LLM estimate on failure
          }
        }

        // --- Real weather via Open-Meteo ---
        try {
          const weather = await getWeather(
            dest.name,
            form.dateFrom || undefined,
            form.dateTo || undefined
          );
          if (weather) {
            enriched.tempMin = weather.tempMin;
            enriched.tempMax = weather.tempMax;
            enriched.weatherIcon = weather.icon;
          }
        } catch {
          // Keep LLM estimate on failure
        }

        return enriched;
      })
    );

    // Re-sort by matchScore descending
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
