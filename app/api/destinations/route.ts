import { NextResponse } from "next/server";
import OpenAI from "openai";
import { buildPrompt } from "@/lib/destinations";
import { cityToIATA, searchFlights } from "@/lib/flights";
import { getWeather } from "@/lib/weather";
import type { SearchFormData, Destination } from "@/lib/types";

const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY || "",
});

const tpToken = process.env.TRAVELPAYOUTS_TOKEN || "";

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

    // --- Step 2: Enrich with real data ---
    // Resolve departure city IATA code
    let originCode: string | null = null;
    if (tpToken && form.city.trim()) {
      originCode = await cityToIATA(form.city, tpToken).catch(() => null);
    }

    // Enrich each destination in parallel
    destinations = await Promise.all(
      destinations.map(async (dest) => {
        const enriched = { ...dest };

        // --- Real flights via Travelpayouts ---
        if (tpToken && originCode && !dest.isLocal) {
          try {
            const destCode = await cityToIATA(dest.name, tpToken);
            if (destCode) {
              const flight = await searchFlights(
                originCode,
                destCode,
                form.dateFrom || undefined,
                form.dateTo || undefined,
                tpToken
              );
              if (flight) {
                enriched.flightPrice = flight.price;
                enriched.totalPerPerson =
                  flight.price + enriched.hotelPerNight * enriched.nights;
                enriched.bookingUrl = flight.link;
              }
            }
          } catch {
            // Keep LLM estimate on failure
          }
        }

        // --- Real weather via Open-Meteo (free, no key) ---
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
