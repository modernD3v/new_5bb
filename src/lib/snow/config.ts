/** Score freshness window (minutes). See docs/PLAN.md §7.7. */
export const SCORE_TTL_MINUTES = 40;

/** How long a refresh lock is held to prevent duplicate Open-Meteo calls. */
export const REFRESH_LOCK_MINUTES = 2;

export const REFRESH_LOCK_KEY = "weekend-scores";

export const OPEN_METEO_BASE = "https://api.open-meteo.com/v1/forecast";

export const TIMEZONE = "America/New_York";

/** Convert feet → meters for Open-Meteo elevation. */
export function feetToMeters(feet: number): number {
  return feet * 0.3048;
}

export const SCORE_COLORS = {
  send: "#22C55E",
  solid: "#A3E635",
  meh: "#F59E0B",
  skip: "#EF4444",
  indoor: "#94A3B8",
} as const;

export const DISCLAIMER =
  "Forecast-based score. Doesn't know trail counts or base depth. Check the resort before you go.";
