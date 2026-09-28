import { feetToMeters, OPEN_METEO_BASE, TIMEZONE } from "./config";
import type { OpenMeteoLocation } from "./extract";

export type MountainCoord = {
  id: string;
  lat: number;
  lon: number;
  summitElevFt: number;
};

function normalizeLocations(
  data: OpenMeteoLocation | OpenMeteoLocation[],
): OpenMeteoLocation[] {
  return Array.isArray(data) ? data : [data];
}

/**
 * One batched Open-Meteo forecast call for all outdoor mountains.
 * Summit elevations are converted ft → m for the elevation param.
 */
export async function fetchOpenMeteoForecasts(
  mountains: MountainCoord[],
): Promise<OpenMeteoLocation[]> {
  if (mountains.length === 0) return [];

  const latitude = mountains.map((m) => m.lat).join(",");
  const longitude = mountains.map((m) => m.lon).join(",");
  const elevation = mountains
    .map((m) => feetToMeters(m.summitElevFt).toFixed(1))
    .join(",");

  const params = new URLSearchParams({
    latitude,
    longitude,
    elevation,
    daily:
      "snowfall_sum,rain_sum,temperature_2m_max,temperature_2m_min,wind_gusts_10m_max",
    hourly: "temperature_2m,snowfall,rain,wind_gusts_10m",
    temperature_unit: "fahrenheit",
    wind_speed_unit: "mph",
    precipitation_unit: "inch",
    timezone: TIMEZONE,
    past_days: "5",
    forecast_days: "10",
  });

  const res = await fetch(`${OPEN_METEO_BASE}?${params.toString()}`, {
    // Freshness is controlled by our TTL + refresh lock, not HTTP cache.
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Open-Meteo HTTP ${res.status}`);
  }

  const json = (await res.json()) as
    | OpenMeteoLocation
    | OpenMeteoLocation[]
    | { reason?: string; error?: boolean };

  if (
    json &&
    typeof json === "object" &&
    "error" in json &&
    (json as { error?: boolean }).error
  ) {
    throw new Error(
      `Open-Meteo error: ${(json as { reason?: string }).reason ?? "unknown"}`,
    );
  }

  return normalizeLocations(json as OpenMeteoLocation | OpenMeteoLocation[]);
}
