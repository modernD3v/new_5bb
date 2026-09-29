import { and, eq } from "drizzle-orm";
import { after } from "next/server";
import { getDb } from "@/lib/db";
import { listPassesByMountain, resolvePassSeason } from "@/lib/db/passes";
import { mountains, scoreSnapshots } from "@/lib/db/schema";
import type { MountainPassInfo } from "@/lib/passes/config";
import {
  getSeasonStatus,
  seasonLabelFor,
  type SeasonStatus,
} from "@/lib/season/status";
import { SCORE_TTL_MINUTES } from "./config";
import { refreshWeekendScores } from "./refresh";
import { formatIsoDateNy, getTargetWeekend } from "./weekend";
import type { DayForecastSummary } from "./extract";

export type MountainScoreRow = {
  mountainId: string;
  slug: string;
  name: string;
  state: string;
  lat: number;
  lon: number;
  summitElevFt: number;
  baseElevFt: number;
  isIndoor: boolean;
  websiteUrl: string | null;
  driveNote: string | null;
  score: number | null;
  label: string;
  reasons: string[];
  forecast: { days?: DayForecastSummary[]; indoor?: boolean };
  computedAt: Date | null;
  weekendStart: string;
  ridersGoing: number;
  openingDate: string | null;
  closingDate: string | null;
  /** When not "open", the UI hides the numeric score. */
  season: SeasonStatus;
  passes: MountainPassInfo[];
};

export type ScoresPayload = {
  weekend: ReturnType<typeof getTargetWeekend>;
  mountains: MountainScoreRow[];
  newestComputedAt: Date | null;
  isStale: boolean;
  refreshedInline: boolean;
  /** Season the pass info belongs to, e.g. "2026-27" */
  passSeason: string;
};

/** Open mountains by score, then off-season / unscored, each group by name. */
export function rankMountains<
  T extends { name: string; score: number | null; season: SeasonStatus },
>(rows: readonly T[]): T[] {
  const rankScore = (r: T) =>
    r.season.state === "open" && r.score != null ? r.score : -1;
  return [...rows].sort(
    (a, b) => rankScore(b) - rankScore(a) || a.name.localeCompare(b.name),
  );
}

function isFresh(computedAt: Date | null, now: Date): boolean {
  if (!computedAt) return false;
  const ageMs = now.getTime() - computedAt.getTime();
  return ageMs <= SCORE_TTL_MINUTES * 60 * 1000;
}

async function loadRows(weekendStart: string) {
  const db = getDb();
  return db
    .select({
      mountainId: mountains.id,
      slug: mountains.slug,
      name: mountains.name,
      state: mountains.state,
      lat: mountains.lat,
      lon: mountains.lon,
      summitElevFt: mountains.summitElevFt,
      baseElevFt: mountains.baseElevFt,
      isIndoor: mountains.isIndoor,
      websiteUrl: mountains.websiteUrl,
      driveNote: mountains.driveNote,
      openingDate: mountains.openingDate,
      closingDate: mountains.closingDate,
      score: scoreSnapshots.score,
      label: scoreSnapshots.label,
      reasons: scoreSnapshots.reasons,
      forecast: scoreSnapshots.forecast,
      computedAt: scoreSnapshots.computedAt,
    })
    .from(mountains)
    .leftJoin(
      scoreSnapshots,
      and(
        eq(scoreSnapshots.mountainId, mountains.id),
        eq(scoreSnapshots.weekendStart, weekendStart),
      ),
    )
    .where(eq(mountains.active, true));
}

async function loadSnapshots(
  weekendStart: string,
  today: string,
  passSeason: string,
): Promise<MountainScoreRow[]> {
  const [rows, passesByMountain] = await Promise.all([
    loadRows(weekendStart),
    listPassesByMountain(passSeason),
  ]);

  return rankMountains(
    rows.map((r) => ({
      mountainId: r.mountainId,
      slug: r.slug,
      name: r.name,
      state: r.state,
      lat: r.lat,
      lon: r.lon,
      summitElevFt: r.summitElevFt,
      baseElevFt: r.baseElevFt,
      isIndoor: r.isIndoor,
      websiteUrl: r.websiteUrl,
      driveNote: r.driveNote,
      score: r.score,
      label: r.label ?? (r.isIndoor ? "Indoor: always on" : "Pending"),
      reasons: (r.reasons as string[] | null) ?? [],
      forecast: (r.forecast as MountainScoreRow["forecast"] | null) ?? {},
      computedAt: r.computedAt,
      weekendStart,
      ridersGoing: 0,
      openingDate: r.openingDate,
      closingDate: r.closingDate,
      season: getSeasonStatus({
        today,
        openingDate: r.openingDate,
        closingDate: r.closingDate,
        isIndoor: r.isIndoor,
      }),
      passes: passesByMountain.get(r.mountainId) ?? [],
    })),
  );
}

/**
 * Load scores for the target weekend with stale-while-revalidate.
 * - No snapshots → refresh inline (wait)
 * - Fresh → serve
 * - Stale → serve + `after()` background refresh
 */
export async function getWeekendScores(options?: {
  now?: Date;
  scheduleBackgroundRefresh?: boolean;
}): Promise<ScoresPayload> {
  const now = options?.now ?? new Date();
  const scheduleBg = options?.scheduleBackgroundRefresh ?? true;
  const weekend = getTargetWeekend(now);
  const today = formatIsoDateNy(now);
  const passSeason = await resolvePassSeason(seasonLabelFor(today));

  let rows = await loadSnapshots(weekend.saturday, today, passSeason);
  const hasAnySnapshot = rows.some((r) => r.computedAt != null);
  const hasMissingSnapshot = rows.some((r) => r.computedAt == null);
  const newestComputedAt = rows.reduce<Date | null>((acc, r) => {
    if (!r.computedAt) return acc;
    if (!acc || r.computedAt > acc) return r.computedAt;
    return acc;
  }, null);

  let refreshedInline = false;

  if (!hasAnySnapshot) {
    await refreshWeekendScores({ now });
    refreshedInline = true;
    rows = await loadSnapshots(weekend.saturday, today, passSeason);
  } else if (
    scheduleBg &&
    (!isFresh(newestComputedAt, now) || hasMissingSnapshot)
  ) {
    after(() => {
      void refreshWeekendScores({ now });
    });
  }

  const newestAfter = rows.reduce<Date | null>((acc, r) => {
    if (!r.computedAt) return acc;
    if (!acc || r.computedAt > acc) return r.computedAt;
    return acc;
  }, null);

  return {
    weekend,
    mountains: rows,
    newestComputedAt: newestAfter,
    isStale: !isFresh(newestAfter, now),
    refreshedInline,
    passSeason,
  };
}

export async function getMountainScore(
  slug: string,
  options?: { now?: Date },
): Promise<(MountainScoreRow & { all: ScoresPayload }) | null> {
  const payload = await getWeekendScores(options);
  const mountain = payload.mountains.find((m) => m.slug === slug);
  if (!mountain) return null;
  return { ...mountain, all: payload };
}
