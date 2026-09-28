import type { ScoreInputs } from "./score";
import { WEIGHTS } from "./weights";
import type { TargetWeekend } from "./weekend";

export type OpenMeteoLocation = {
  latitude: number;
  longitude: number;
  elevation?: number;
  timezone?: string;
  hourly: {
    time: string[];
    temperature_2m: (number | null)[];
    snowfall: (number | null)[];
    rain: (number | null)[];
    wind_gusts_10m: (number | null)[];
  };
  daily: {
    time: string[];
    snowfall_sum: (number | null)[];
    rain_sum: (number | null)[];
    temperature_2m_max: (number | null)[];
    temperature_2m_min: (number | null)[];
    wind_gusts_10m_max: (number | null)[];
  };
};

export type DayForecastSummary = {
  date: string;
  snowIn: number;
  rainIn: number;
  highF: number | null;
  lowF: number | null;
  maxGustMph: number | null;
};

function sumRange(
  times: string[],
  values: (number | null)[],
  predicate: (isoLocal: string) => boolean,
): number {
  let total = 0;
  for (let i = 0; i < times.length; i++) {
    if (!predicate(times[i]!)) continue;
    total += values[i] ?? 0;
  }
  return total;
}

function avgRange(
  times: string[],
  values: (number | null)[],
  predicate: (isoLocal: string) => boolean,
): number | null {
  let total = 0;
  let n = 0;
  for (let i = 0; i < times.length; i++) {
    if (!predicate(times[i]!)) continue;
    const v = values[i];
    if (v == null) continue;
    total += v;
    n += 1;
  }
  return n === 0 ? null : total / n;
}

function maxRange(
  times: string[],
  values: (number | null)[],
  predicate: (isoLocal: string) => boolean,
): number | null {
  let max: number | null = null;
  for (let i = 0; i < times.length; i++) {
    if (!predicate(times[i]!)) continue;
    const v = values[i];
    if (v == null) continue;
    max = max == null ? v : Math.max(max, v);
  }
  return max;
}

function dateOf(isoLocal: string): string {
  return isoLocal.slice(0, 10);
}

function hourOf(isoLocal: string): number {
  return Number(isoLocal.slice(11, 13));
}

/**
 * Turn one Open-Meteo location payload into ScoreInputs for the target weekend.
 */
export function extractScoreInputs(
  loc: OpenMeteoLocation,
  weekend: TargetWeekend,
): ScoreInputs {
  const { hourly, daily } = loc;
  const { saturday, sunday, friday, wednesday, monday } = weekend;

  const recentSnowIn = sumRange(hourly.time, hourly.snowfall, (t) => {
    const d = dateOf(t);
    return d >= wednesday && d <= friday;
  });

  const weekendSnowIn = sumRange(hourly.time, hourly.snowfall, (t) => {
    const d = dateOf(t);
    return d === saturday || d === sunday;
  });

  const dayTemp =
    avgRange(hourly.time, hourly.temperature_2m, (t) => {
      const d = dateOf(t);
      const h = hourOf(t);
      return (d === saturday || d === sunday) && h >= 9 && h <= 16;
    }) ?? 32;

  const rainIn = sumRange(hourly.time, hourly.rain, (t) => {
    const d = dateOf(t);
    return d === friday || d === saturday || d === sunday;
  });

  let coldNights = 0;
  for (let i = 0; i < daily.time.length; i++) {
    const d = daily.time[i]!;
    if (d < monday || d > friday) continue;
    const min = daily.temperature_2m_min[i];
    if (min != null && min <= WEIGHTS.coldNightMaxF) coldNights += 1;
  }

  const maxGustMph =
    maxRange(hourly.time, hourly.wind_gusts_10m, (t) => {
      const d = dateOf(t);
      const h = hourOf(t);
      return (d === saturday || d === sunday) && h >= 9 && h <= 16;
    }) ?? 0;

  return {
    recentSnowIn,
    weekendSnowIn,
    dayTempF: dayTemp,
    rainIn,
    coldNights,
    maxGustMph,
  };
}

export function extractForecastStrip(
  loc: OpenMeteoLocation,
  weekend: TargetWeekend,
): DayForecastSummary[] {
  const days = [weekend.friday, weekend.saturday, weekend.sunday];
  return days.map((date) => {
    const idx = loc.daily.time.indexOf(date);
    return {
      date,
      snowIn: idx >= 0 ? (loc.daily.snowfall_sum[idx] ?? 0) : 0,
      rainIn: idx >= 0 ? (loc.daily.rain_sum[idx] ?? 0) : 0,
      highF: idx >= 0 ? (loc.daily.temperature_2m_max[idx] ?? null) : null,
      lowF: idx >= 0 ? (loc.daily.temperature_2m_min[idx] ?? null) : null,
      maxGustMph:
        idx >= 0 ? (loc.daily.wind_gusts_10m_max[idx] ?? null) : null,
    };
  });
}
