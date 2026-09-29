/**
 * Off-season state for a mountain, from its opening/closing dates for the
 * current season. Pure date-string math on YYYY-MM-DD in America/New_York.
 */

/** Seasons roll over on this day: dates from Jul 1 belong to the winter that follows. */
export const SEASON_ROLLOVER_MMDD = "07-01";
/** With no opening date, scores start on this day. */
export const DEFAULT_OPENING_MMDD = "11-15";
/** With no closing date, the season is treated as over after this day. */
export const DEFAULT_CLOSING_MMDD = "04-30";

export type SeasonStatus =
  | { state: "open" }
  | { state: "preseason"; opensOn: string | null }
  | { state: "closed"; closedOn: string | null };

export type SeasonWindow = {
  /** e.g. "2026-27" */
  label: string;
  startYear: number;
  /** First day of the season window (Jul 1) */
  start: string;
  /** Last day of the season window (Jun 30) */
  end: string;
};

function yearOf(isoDate: string): number {
  return Number(isoDate.slice(0, 4));
}

export function seasonWindowFor(today: string): SeasonWindow {
  const year = yearOf(today);
  const startYear =
    today.slice(5) >= SEASON_ROLLOVER_MMDD ? year : year - 1;
  const endYear = startYear + 1;
  return {
    label: `${startYear}-${String(endYear).slice(2)}`,
    startYear,
    start: `${startYear}-${SEASON_ROLLOVER_MMDD}`,
    end: `${endYear}-06-30`,
  };
}

export function seasonLabelFor(today: string): string {
  return seasonWindowFor(today).label;
}

function inWindow(date: string | null, w: SeasonWindow): string | null {
  if (!date) return null;
  return date >= w.start && date <= w.end ? date : null;
}

/**
 * - Before opening_date → preseason ("Opens <date>").
 * - No opening_date and before Nov 15 → preseason ("Preseason").
 * - After closing_date (or after Apr 30 with no closing date) → closed.
 * - Otherwise open, and the numeric score is shown.
 * Dates from a previous season are ignored, so last year's closing date
 * doesn't read as "Season's over" in October.
 */
export function getSeasonStatus(input: {
  today: string;
  openingDate: string | null;
  closingDate: string | null;
  isIndoor?: boolean;
}): SeasonStatus {
  if (input.isIndoor) return { state: "open" };

  const w = seasonWindowFor(input.today);
  const opening = inWindow(input.openingDate, w);
  const closing = inWindow(input.closingDate, w);
  const today = input.today;

  if (closing && today > closing) return { state: "closed", closedOn: closing };

  if (opening) {
    if (today < opening) return { state: "preseason", opensOn: opening };
  } else if (today < `${w.startYear}-${DEFAULT_OPENING_MMDD}`) {
    return { state: "preseason", opensOn: null };
  }

  if (!closing && today > `${w.startYear + 1}-${DEFAULT_CLOSING_MMDD}`) {
    return { state: "closed", closedOn: null };
  }

  return { state: "open" };
}

export function isScoreVisible(status: SeasonStatus): boolean {
  return status.state === "open";
}

/** "Nov 21" (or "Nov 21, 2026" with `withYear`). Dates are calendar days, so format in UTC. */
export function formatSeasonDate(isoDate: string, withYear = false): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    ...(withYear ? { year: "numeric" } : {}),
  }).format(new Date(Date.UTC(y!, m! - 1, d!)));
}

/** Short pin/list label: "Opens Nov 21", "Preseason", "Closed". */
export function seasonShortLabel(status: SeasonStatus): string | null {
  switch (status.state) {
    case "open":
      return null;
    case "preseason":
      return status.opensOn
        ? `Opens ${formatSeasonDate(status.opensOn)}`
        : "Preseason";
    case "closed":
      return "Closed";
  }
}

/** Mountain page copy. */
export function seasonMessage(
  status: SeasonStatus,
  mountainName: string,
): string | null {
  switch (status.state) {
    case "open":
      return null;
    case "preseason":
      return `Season hasn't started. Scores start when ${mountainName} opens.`;
    case "closed":
      return "Season's over. See you next winter.";
  }
}
