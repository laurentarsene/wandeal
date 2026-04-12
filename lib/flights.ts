// Travelpayouts / Aviasales API for real flight prices

const BASE = "https://api.travelpayouts.com/aviasales";

interface FlightResult {
  price: number;
  airline: string;
  departure_at: string;
  return_at: string;
  link: string;
}

// Search cheapest flights from origin to destination
export async function searchFlights(
  origin: string,  // IATA code e.g. "BRU"
  destination: string,  // IATA code e.g. "LIS"
  departDate?: string,  // YYYY-MM or YYYY-MM-DD
  returnDate?: string,
  token?: string
): Promise<FlightResult | null> {
  if (!token) return null;

  const params = new URLSearchParams({
    currency: "EUR",
    origin,
    destination,
    token,
  });

  if (departDate) params.set("depart_date", departDate);
  if (returnDate) params.set("return_date", returnDate);

  // Use the prices/cheap endpoint for best prices
  const res = await fetch(`${BASE}/v3/prices_for_dates?${params.toString()}`);
  if (!res.ok) return null;

  const data = await res.json();
  if (!data.success || !data.data?.length) return null;

  const cheapest = data.data[0];

  return {
    price: cheapest.price,
    airline: cheapest.airline,
    departure_at: cheapest.departure_at,
    return_at: cheapest.return_at,
    link: `https://www.aviasales.com/search/${origin}${cheapest.departure_at?.slice(5, 7)}${cheapest.departure_at?.slice(8, 10)}${destination}1`,
  };
}

// Resolve city name to IATA code using Travelpayouts
export async function cityToIATA(
  cityName: string,
  token: string
): Promise<string | null> {
  // Use autocomplete API
  const res = await fetch(
    `https://autocomplete.travelpayouts.com/places2?term=${encodeURIComponent(cityName)}&locale=fr&types[]=city`
  );
  if (!res.ok) return null;

  const data = await res.json();
  if (!data.length) return null;

  return data[0].code || null;
}
