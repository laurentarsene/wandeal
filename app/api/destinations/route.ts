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

// Generate a unique photo URL per destination using Wikimedia Commons
async function getPhotoUrl(cityName: string, country: string): Promise<string> {
  // Try Wikimedia Commons API — free, no key, has photos for almost every city
  try {
    const query = `${cityName} ${country} city`;
    const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=images&titles=${encodeURIComponent(query)}&gimlimit=1&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json&origin=*`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const pages = data?.query?.pages;
      if (pages) {
        const first = Object.values(pages)[0] as { imageinfo?: { thumburl?: string }[] };
        const thumb = first?.imageinfo?.[0]?.thumburl;
        if (thumb) return thumb;
      }
    }
  } catch {
    // fallback
  }

  // Fallback: Unsplash with a hash-based photo ID for variety
  const travelPhotos = [
    "1500835556837-99ac94a94552",
    "1488085061387-422e29b40080",
    "1507525428034-b723cf961d3e",
    "1476514525535-07fb3b4a6e8a",
    "1502602898657-3e91760cbb34",
    "1523906834658-6e24ef2386f9",
    "1530789253388-582c481c54b0",
    "1469854523086-cc02fe5d8800",
    "1504150558240-0b4fd8946624",
    "1528164344705-47542687000d",
    "1519046904884-53103b34b206",
    "1501785888108-ce5a2d6ecf62",
  ];
  // Hash city name to pick a consistent but unique photo
  let hash = 0;
  for (let i = 0; i < cityName.length; i++) {
    hash = ((hash << 5) - hash + cityName.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % travelPhotos.length;
  return `https://images.unsplash.com/photo-${travelPhotos[idx]}?w=800&h=500&fit=crop&q=80`;
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
        enriched.photoUrl = await getPhotoUrl(dest.name, dest.country);

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
