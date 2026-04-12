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

// Generate photo URL via Teleport API (free, no key) or Unsplash search
async function getPhotoUrl(cityName: string): Promise<string> {
  // Try Teleport city photos API (free, no auth)
  try {
    const slug = cityName.toLowerCase().replace(/[^a-z]/g, "-");
    const res = await fetch(`https://api.teleport.org/api/urban_areas/slug:${slug}/images/`);
    if (res.ok) {
      const data = await res.json();
      const photo = data?.photos?.[0]?.image?.web;
      if (photo) return photo;
    }
  } catch {
    // fallback below
  }
  // Fallback: Unsplash static URL (still works for many queries)
  return `https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=800&h=500&fit=crop&q=80`;
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
    if (tpToken && form.city.trim()) {
      originCode = await cityToIATA(form.city, tpToken).catch(() => null);
    }

    destinations = await Promise.all(
      destinations.map(async (dest) => {
        const enriched = { ...dest };

        // --- Photo ---
        enriched.photoUrl = await getPhotoUrl(dest.name);

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
            // Keep LLM estimate
          }
        }

        // --- Force bike transport pricing ---
        if (form.transport.length === 1 && form.transport[0] === "bike") {
          enriched.flightPrice = 0;
          enriched.totalPerPerson = enriched.hotelPerNight * enriched.nights;
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
          // Keep LLM estimate
        }

        // Recalculate total
        enriched.totalPerPerson =
          enriched.flightPrice + enriched.hotelPerNight * enriched.nights;

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
            photoUrl: await getPhotoUrl(d.name),
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
