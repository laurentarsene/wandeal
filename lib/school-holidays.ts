// Vacances scolaires belges 2025-2026 & 2026-2027
// Sources : RTBF, Fédération Wallonie-Bruxelles, Communauté flamande

export interface HolidayPeriod {
  name: string;
  from: string; // YYYY-MM-DD
  to: string;
}

// Wallonie & Bruxelles (Fédération Wallonie-Bruxelles)
export const holidaysWB: HolidayPeriod[] = [
  // 2025-2026
  { name: "Printemps 2026", from: "2026-04-27", to: "2026-05-10" },
  { name: "Été 2026", from: "2026-07-04", to: "2026-08-23" },
  // 2026-2027
  { name: "Automne 2026", from: "2026-10-19", to: "2026-10-30" },
  { name: "Noël 2026", from: "2026-12-21", to: "2027-01-01" },
  { name: "Détente 2027", from: "2027-02-22", to: "2027-03-05" },
  { name: "Printemps 2027", from: "2027-04-26", to: "2027-05-07" },
  { name: "Été 2027", from: "2027-07-03", to: "2027-08-22" },
];

// Flandre (Communauté flamande)
export const holidaysFL: HolidayPeriod[] = [
  // 2025-2026
  { name: "Pâques 2026", from: "2026-04-06", to: "2026-04-19" },
  { name: "Été 2026", from: "2026-07-01", to: "2026-08-31" },
  // 2026-2027
  { name: "Automne 2026", from: "2026-10-26", to: "2026-11-01" },
  { name: "Noël 2026", from: "2026-12-21", to: "2027-01-03" },
  { name: "Carnaval 2027", from: "2027-02-15", to: "2027-02-21" },
  { name: "Pâques 2027", from: "2027-03-29", to: "2027-04-11" },
  { name: "Été 2027", from: "2027-07-01", to: "2027-08-31" },
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

// Format holidays as a string for the AI prompt
export function formatHolidaysForPrompt(
  region: "wb" | "fl",
): string {
  const upcoming = getUpcomingHolidays(region);
  return upcoming
    .map((h) => `${h.name}: ${h.from} → ${h.to}`)
    .join(", ");
}
