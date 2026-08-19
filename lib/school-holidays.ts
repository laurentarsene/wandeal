// Vacances scolaires belges 2025-2026 & 2026-2027
// Sources : RTBF, Fédération Wallonie-Bruxelles, Communauté flamande

export interface HolidayPeriod {
  name: string;
  /** i18n key for the season, so the badge can be shown in the user's language. */
  seasonKey?: "spring" | "summer" | "autumn" | "christmas" | "carnival" | "easter" | "relax";
  from: string; // YYYY-MM-DD
  to: string;
}

// Wallonie & Bruxelles (Fédération Wallonie-Bruxelles)
export const holidaysWB: HolidayPeriod[] = [
  // 2025-2026
  { name: "Printemps 2026", seasonKey: "spring", from: "2026-04-27", to: "2026-05-10" },
  { name: "Été 2026", seasonKey: "summer", from: "2026-07-04", to: "2026-08-23" },
  // 2026-2027
  { name: "Automne 2026", seasonKey: "autumn", from: "2026-10-19", to: "2026-10-30" },
  { name: "Noël 2026", seasonKey: "christmas", from: "2026-12-21", to: "2027-01-01" },
  { name: "Détente 2027", seasonKey: "relax", from: "2027-02-22", to: "2027-03-05" },
  { name: "Printemps 2027", seasonKey: "spring", from: "2027-04-26", to: "2027-05-07" },
  { name: "Été 2027", seasonKey: "summer", from: "2027-07-03", to: "2027-08-22" },
];

// Flandre (Communauté flamande)
export const holidaysFL: HolidayPeriod[] = [
  // 2025-2026
  { name: "Pâques 2026", seasonKey: "easter", from: "2026-04-06", to: "2026-04-19" },
  { name: "Été 2026", seasonKey: "summer", from: "2026-07-01", to: "2026-08-31" },
  // 2026-2027
  { name: "Automne 2026", seasonKey: "autumn", from: "2026-10-26", to: "2026-11-01" },
  { name: "Noël 2026", seasonKey: "christmas", from: "2026-12-21", to: "2027-01-03" },
  { name: "Carnaval 2027", seasonKey: "carnival", from: "2027-02-15", to: "2027-02-21" },
  { name: "Pâques 2027", seasonKey: "easter", from: "2027-03-29", to: "2027-04-11" },
  { name: "Été 2027", seasonKey: "summer", from: "2027-07-01", to: "2027-08-31" },
];

// Get upcoming holiday periods (filter out past ones)
export function getUpcomingHolidays(
  region: "wb" | "fl",
): HolidayPeriod[] {
  const holidays = region === "wb" ? holidaysWB : holidaysFL;
  const today = new Date().toISOString().slice(0, 10);
  return holidays.filter((h) => h.to >= today);
}

// Jours fériés belges (communs aux 3 régions)
export const publicHolidays: HolidayPeriod[] = [
  // 2026
  { name: "Fête du Travail", from: "2026-05-01", to: "2026-05-01" },
  { name: "Ascension", from: "2026-05-14", to: "2026-05-14" },         // jeudi → pont possible
  { name: "Lundi de Pentecôte", from: "2026-05-25", to: "2026-05-25" },
  { name: "Fête nationale", from: "2026-07-21", to: "2026-07-21" },
  { name: "Assomption", from: "2026-08-15", to: "2026-08-15" },
  { name: "Toussaint", from: "2026-11-01", to: "2026-11-01" },          // dimanche
  { name: "Armistice", from: "2026-11-11", to: "2026-11-11" },          // mercredi → pont possible
  { name: "Noël", from: "2026-12-25", to: "2026-12-25" },
  // 2027
  { name: "Nouvel An", from: "2027-01-01", to: "2027-01-01" },
  { name: "Lundi de Pâques", from: "2027-03-29", to: "2027-03-29" },
  { name: "Fête du Travail", from: "2027-05-01", to: "2027-05-01" },
  { name: "Ascension", from: "2027-05-06", to: "2027-05-06" },          // jeudi → pont possible
  { name: "Lundi de Pentecôte", from: "2027-05-17", to: "2027-05-17" },
  { name: "Fête nationale", from: "2027-07-21", to: "2027-07-21" },
];

export function getUpcomingPublicHolidays(): HolidayPeriod[] {
  const today = new Date().toISOString().slice(0, 10);
  return publicHolidays.filter((h) => h.from >= today);
}

export function formatPublicHolidaysForPrompt(): string {
  const dayNames = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
  return getUpcomingPublicHolidays()
    .map((h) => {
      const day = dayNames[new Date(h.from + "T00:00:00").getDay()];
      return `${h.name} (${day} ${h.from})`;
    })
    .join(", ");
}

export interface DatePeriod {
  /** Translation key for the badge shape. */
  key: "bridge" | "schoolHolidays" | "weekend";
  /** Proper name to interpolate ("Ascension", "Été 2026"). Absent for plain weekends. */
  name?: string;
  seasonKey?: HolidayPeriod["seasonKey"];
  year?: number;
}

// Determine the correct period for a date range
export function getDatePeriod(dateFrom: string, dateTo: string): DatePeriod | null {
  if (!dateFrom || !dateTo) return null;
  const from = new Date(dateFrom + "T00:00:00");
  const to = new Date(dateTo + "T00:00:00");

  // Check if dates overlap with a public holiday (pont)
  for (const h of publicHolidays) {
    const hDate = new Date(h.from + "T00:00:00");
    if (hDate >= from && hDate <= to) {
      return { key: "bridge", name: h.name };
    }
  }

  // Check if dates fall within school holidays
  const allHolidays = [...holidaysWB, ...holidaysFL];
  for (const h of allHolidays) {
    const hFrom = new Date(h.from + "T00:00:00");
    const hTo = new Date(h.to + "T00:00:00");
    // Overlap check
    if (from <= hTo && to >= hFrom) {
      return {
        key: "schoolHolidays",
        name: h.name,
        seasonKey: h.seasonKey,
        year: Number(h.name.match(/\d{4}/)?.[0]) || undefined,
      };
    }
  }

  // Check if it's a weekend (Fri-Sun or Sat-Sun)
  const dayFrom = from.getDay();
  const nights = Math.round((to.getTime() - from.getTime()) / 86400000);
  if (nights <= 3 && (dayFrom === 5 || dayFrom === 6)) {
    return { key: "weekend" };
  }

  return null;
}

// Format holidays as a string for the AI prompt
export function formatHolidaysForPrompt(
  region: "wb" | "fl",
): string {
  const upcoming = getUpcomingHolidays(region);
  return upcoming
    .map((h) => `${h.name}: ${h.from} → ${h.to}`)
    .join(", ");
}
