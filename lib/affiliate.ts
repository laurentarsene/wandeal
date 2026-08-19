// Travelpayouts affiliate links (Aviasales flights + Hotellook hotels).
//
// The marker is read at RUNTIME (server-side) so that changing it on the hosting
// platform takes effect without a rebuild — unlike NEXT_PUBLIC_* vars, which are
// inlined at build time. NEXT_PUBLIC_TRAVELPAYOUTS_MARKER is still honoured as a
// fallback so existing deployments keep working.
export function getMarker(): string {
  return (
    process.env.TRAVELPAYOUTS_MARKER ||
    process.env.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER ||
    ""
  ).trim();
}

let warned = false;
function warnIfMissing() {
  if (warned || getMarker()) return;
  warned = true;
  console.warn(
    "[wandeal] TRAVELPAYOUTS_MARKER is not set — affiliate links are being generated " +
      "WITHOUT attribution, so no commission will be earned. Set TRAVELPAYOUTS_MARKER " +
      "in your environment (Travelpayouts dashboard → your marker ID)."
  );
}

function withAffiliate(url: string, subId: string): string {
  warnIfMissing();
  const marker = getMarker();
  if (!marker) return url;
  const u = new URL(url);
  u.searchParams.set("marker", marker);
  u.searchParams.set("sub_id", subId);
  return u.toString();
}

// "2026-09-29" → "2909" (DDMM, the format Aviasales search paths use)
function toDDMM(date: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  return date.slice(8, 10) + date.slice(5, 7);
}

/**
 * Round-trip Aviasales search link.
 * Path format: /search/{ORIGIN}{DDMM_out}{DEST}[{DDMM_back}]{passengers}
 *
 * `deepLink` is the `link` field returned by the Travelpayouts prices API. When
 * present it points at the exact itinerary whose price we display, so the user
 * lands on the offer they clicked instead of a generic search.
 */
export function buildFlightUrl(opts: {
  originIata?: string;
  destIata?: string;
  dateFrom?: string;
  dateTo?: string;
  travelers?: number;
  deepLink?: string;
}): string | null {
  const pax = Math.min(9, Math.max(1, Math.round(opts.travelers || 1)));

  // The API's deep link points at one exact itinerary priced for a single
  // adult. It is only usable when we are showing that same trip for one
  // traveller — otherwise the user lands on a different search than the card
  // promised, which loses the booking and the commission with it.
  if (pax === 1 && opts.deepLink?.startsWith("/search/")) {
    return withAffiliate(`https://www.aviasales.com${opts.deepLink}`, "flight-deep");
  }

  const from = opts.originIata?.toUpperCase();
  const to = opts.destIata?.toUpperCase();
  if (!from || !to || !opts.dateFrom) return null;

  const out = toDDMM(opts.dateFrom);
  if (!out) return null;
  const back = opts.dateTo ? toDDMM(opts.dateTo) : null;

  return withAffiliate(
    `https://www.aviasales.com/search/${from}${out}${to}${back || ""}${pax}`,
    "flight-search"
  );
}

/** Hotellook search link, scoped to the destination, dates and party size. */
export function buildHotelUrl(opts: {
  city: string;
  country?: string;
  dateFrom?: string;
  dateTo?: string;
  travelers?: number;
  currency?: string;
}): string {
  const url = new URL("https://search.hotellook.com/hotels");
  url.searchParams.set(
    "destination",
    opts.country ? `${opts.city}, ${opts.country}` : opts.city
  );
  if (opts.dateFrom) url.searchParams.set("checkIn", opts.dateFrom);
  if (opts.dateTo) url.searchParams.set("checkOut", opts.dateTo);
  url.searchParams.set("adults", String(Math.min(9, Math.max(1, Math.round(opts.travelers || 1)))));
  url.searchParams.set("currency", opts.currency || "EUR");
  return withAffiliate(url.toString(), "hotel-search");
}

/** Google Maps driving directions — used for destinations reachable by road. Not monetised. */
export function buildDirectionsUrl(destination: string, originCity?: string): string {
  const from = encodeURIComponent(originCity || "");
  const to = encodeURIComponent(destination);
  return `https://www.google.com/maps/dir/${from}/${to}/`;
}
