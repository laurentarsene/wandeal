const KIWI_BASE = "https://api.tequila.kiwi.com";

interface KiwiFlightResult {
  price: number;
  deep_link: string;
  airlines: string[];
  route: { cityFrom: string; cityTo: string }[];
  nightsInDest: number;
}

interface FlightSearch {
  flyFrom: string;
  flyTo: string;
  dateFrom?: string; // DD/MM/YYYY
  dateTo?: string;
  returnFrom?: string;
  returnTo?: string;
  nights_in_dst_from?: number;
  nights_in_dst_to?: number;
  adults?: number;
  curr?: string;
}

function formatDateKiwi(isoDate: string): string {
  // Convert YYYY-MM-DD to DD/MM/YYYY
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
}

// Search for a location ID (IATA code or Kiwi location id)
export async function searchLocation(
  query: string,
  apiKey: string
): Promise<string | null> {
  const res = await fetch(
    `${KIWI_BASE}/locations/query?term=${encodeURIComponent(query)}&location_types=city&limit=1`,
    { headers: { apikey: apiKey } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.locations?.[0]?.code || null;
}

export async function searchFlights(
  params: FlightSearch,
  apiKey: string
): Promise<KiwiFlightResult | null> {
  const searchParams = new URLSearchParams({
    fly_from: params.flyFrom,
    fly_to: params.flyTo,
    curr: params.curr || "EUR",
    adults: String(params.adults || 1),
    sort: "price",
    limit: "1",
    max_stopovers: "2",
  });

  if (params.dateFrom) searchParams.set("date_from", params.dateFrom);
  if (params.dateTo) searchParams.set("date_to", params.dateTo);
  if (params.returnFrom) searchParams.set("return_from", params.returnFrom);
  if (params.returnTo) searchParams.set("return_to", params.returnTo);
  if (params.nights_in_dst_from != null)
    searchParams.set("nights_in_dst_from", String(params.nights_in_dst_from));
  if (params.nights_in_dst_to != null)
    searchParams.set("nights_in_dst_to", String(params.nights_in_dst_to));

  const res = await fetch(`${KIWI_BASE}/v2/search?${searchParams.toString()}`, {
    headers: { apikey: apiKey },
  });

  if (!res.ok) return null;
  const data = await res.json();
  const flight = data.data?.[0];
  if (!flight) return null;

  return {
    price: flight.price,
    deep_link: flight.deep_link,
    airlines: flight.airlines || [],
    route: flight.route || [],
    nightsInDest: flight.nightsInDest || 0,
  };
}

// Build search params from our form data for a specific destination
export function buildFlightSearch(
  fromCode: string,
  toCode: string,
  dateFrom?: string,
  dateTo?: string,
  duration?: number,
  travelers?: number
): FlightSearch {
  const search: FlightSearch = {
    flyFrom: fromCode,
    flyTo: toCode,
    adults: travelers || 1,
    curr: "EUR",
  };

  if (dateFrom && dateTo) {
    search.dateFrom = formatDateKiwi(dateFrom);
    search.dateTo = formatDateKiwi(dateFrom); // exact departure date
    search.returnFrom = formatDateKiwi(dateTo);
    search.returnTo = formatDateKiwi(dateTo);
  } else if (dateFrom) {
    // Flexible return
    search.dateFrom = formatDateKiwi(dateFrom);
    search.dateTo = formatDateKiwi(dateFrom);
    search.nights_in_dst_from = (duration || 7) - 3;
    search.nights_in_dst_to = (duration || 7) + 3;
  } else {
    // Fully flexible — search next 3 months
    const now = new Date();
    const in3months = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    search.dateFrom = formatDateKiwi(
      now.toISOString().split("T")[0]
    );
    search.dateTo = formatDateKiwi(
      in3months.toISOString().split("T")[0]
    );
    search.nights_in_dst_from = (duration || 7) - 3;
    search.nights_in_dst_to = (duration || 7) + 3;
  }

  return search;
}
