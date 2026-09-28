import { TIMEZONE } from "./config";

export type TargetWeekend = {
  /** Saturday YYYY-MM-DD in America/New_York */
  saturday: string;
  /** Sunday YYYY-MM-DD in America/New_York */
  sunday: string;
  /** Friday before the weekend */
  friday: string;
  /** Wednesday before the weekend */
  wednesday: string;
  /** Monday of the week leading into the weekend */
  monday: string;
};

/** Calendar date in America/New_York as YYYY-MM-DD. */
export function formatIsoDateNy(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function weekdayNy(date: Date): number {
  // 0=Sun … 6=Sat in America/New_York
  const wd = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    weekday: "short",
  }).format(date);
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return map[wd]!;
}

/** Pure calendar-day arithmetic on YYYY-MM-DD (DST-safe for date-only math). */
export function addNyDays(isoDate: string, deltaDays: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const dt = new Date(Date.UTC(y!, m! - 1, d! + deltaDays));
  return dt.toISOString().slice(0, 10);
}

/**
 * Mon–Fri → upcoming Saturday/Sunday.
 * Sat–Sun → current weekend.
 */
export function getTargetWeekend(now: Date): TargetWeekend {
  const today = formatIsoDateNy(now);
  const weekday = weekdayNy(now);

  let daysUntilSaturday: number;
  if (weekday === 6) daysUntilSaturday = 0;
  else if (weekday === 0) daysUntilSaturday = -1;
  else daysUntilSaturday = 6 - weekday;

  const saturday = addNyDays(today, daysUntilSaturday);
  const sunday = addNyDays(saturday, 1);
  const friday = addNyDays(saturday, -1);
  const wednesday = addNyDays(saturday, -3);
  const monday = addNyDays(saturday, -5);

  return { saturday, sunday, friday, wednesday, monday };
}
