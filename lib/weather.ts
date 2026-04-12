// Open-Meteo — completely free, no API key needed

interface GeoResult {
  latitude: number;
  longitude: number;
  name: string;
}

interface WeatherResult {
  tempMin: number;
  tempMax: number;
  icon: "sun" | "cloud" | "rain" | "snow";
}

// Geocode a city name to lat/lon
async function geocode(city: string): Promise<GeoResult | null> {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=fr`
  );
  if (!res.ok) return null;
  const data = await res.json();
  const loc = data.results?.[0];
  if (!loc) return null;
  return {
    latitude: loc.latitude,
    longitude: loc.longitude,
    name: loc.name,
  };
}

// Get weather forecast or climate data for a location + date range
export async function getWeather(
  city: string,
  dateFrom?: string,
  dateTo?: string
): Promise<WeatherResult | null> {
  const geo = await geocode(city);
  if (!geo) return null;

  let url: string;

  if (dateFrom && dateTo) {
    // Use forecast API for dates within 16 days, otherwise use climate averages
    const now = new Date();
    const from = new Date(dateFrom);
    const diffDays = Math.round(
      (from.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays <= 14) {
      // Real forecast
      url = `https://api.open-meteo.com/v1/forecast?latitude=${geo.latitude}&longitude=${geo.longitude}&daily=temperature_2m_max,temperature_2m_min,weathercode&start_date=${dateFrom}&end_date=${dateTo}&timezone=auto`;
    } else {
      // Historical climate data — use last year's same dates as proxy
      const lastYearFrom = dateFrom.replace(
        /^\d{4}/,
        String(new Date().getFullYear() - 1)
      );
      const lastYearTo = dateTo.replace(
        /^\d{4}/,
        String(new Date().getFullYear() - 1)
      );
      url = `https://archive-api.open-meteo.com/v1/archive?latitude=${geo.latitude}&longitude=${geo.longitude}&daily=temperature_2m_max,temperature_2m_min,weathercode&start_date=${lastYearFrom}&end_date=${lastYearTo}&timezone=auto`;
    }
  } else {
    // No dates — get current month's climate from last year
    const now = new Date();
    const month = now.getMonth();
    const lastYear = now.getFullYear() - 1;
    const startDate = `${lastYear}-${String(month + 1).padStart(2, "0")}-01`;
    const endDay = new Date(lastYear, month + 1, 0).getDate();
    const endDate = `${lastYear}-${String(month + 1).padStart(2, "0")}-${String(endDay).padStart(2, "0")}`;
    url = `https://archive-api.open-meteo.com/v1/archive?latitude=${geo.latitude}&longitude=${geo.longitude}&daily=temperature_2m_max,temperature_2m_min,weathercode&start_date=${startDate}&end_date=${endDate}&timezone=auto`;
  }

  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();

  const daily = data.daily;
  if (!daily?.temperature_2m_max?.length) return null;

  const temps_max: number[] = daily.temperature_2m_max;
  const temps_min: number[] = daily.temperature_2m_min;
  const codes: number[] = daily.weathercode || [];

  const avgMax = Math.round(
    temps_max.reduce((a: number, b: number) => a + b, 0) / temps_max.length
  );
  const avgMin = Math.round(
    temps_min.reduce((a: number, b: number) => a + b, 0) / temps_min.length
  );

  // Most frequent weather code
  const avgCode = codes.length > 0
    ? codes.sort(
        (a, b) =>
          codes.filter((v) => v === a).length -
          codes.filter((v) => v === b).length
      ).pop()!
    : 0;

  const icon = weatherCodeToIcon(avgCode);

  return { tempMin: avgMin, tempMax: avgMax, icon };
}

function weatherCodeToIcon(code: number): "sun" | "cloud" | "rain" | "snow" {
  // WMO weather codes: https://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-data/HTML/WMO-CODE/WMO4677.HTM
  if (code <= 1) return "sun";
  if (code <= 3) return "cloud";
  if (code >= 71 && code <= 77) return "snow";
  if (code >= 80 || (code >= 51 && code <= 67)) return "rain";
  return "cloud";
}
