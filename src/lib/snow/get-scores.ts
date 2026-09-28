import { and, asc, desc, eq, sql } from "drizzle-orm";
import { after } from "next/server";
import { getDb } from "@/lib/db";
import { mountains, scoreSnapshots } from "@/lib/db/schema";
import { SCORE_TTL_MINUTES } from "./config";
import { refreshWeekendScores } from "./refresh";
import { getTargetWeekend } from "./weekend";
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
};

export type ScoresPayload = {
  weekend: ReturnType<typeof getTargetWeekend>;
  mountains: MountainScoreRow[];
  newestComputedAt: Date | null;
  isStale: boolean;
  refreshedInline: boolean;
};

function isFresh(computedAt: Date | null, now: Date): boolean {
  if (!computedAt) return false;
  const ageMs = now.getTime() - computedAt.getTime();
  return ageMs <= SCORE_TTL_MINUTES * 60 * 1000;
}

async function loadSnapshots(
  weekendStart: string,
): Promise<MountainScoreRow[]> {
  const db = getDb();
  const rows = await db
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
      score: scoreSnapshots.score,
      label: scoreSnapshots.label,
      reasons: scoreSnapshots.reasons,
      forecast: scoreSnapshots.forecast,
      computedAt: scoreSnapshots.computedAt,
      weekendStart: scoreSnapshots.weekendStart,
    })
    .from(mountains)
    .leftJoin(
      scoreSnapshots,
      and(
        eq(scoreSnapshots.mountainId, mountains.id),
        eq(scoreSnapshots.weekendStart, weekendStart),
      ),
    )
    .where(eq(mountains.active, true))
    .orderBy(
      sql`CASE WHEN ${scoreSnapshots.score} IS NULL THEN 1 ELSE 0 END`,
      desc(scoreSnapshots.score),
      asc(mountains.name),
    );

  return rows.map((r) => ({
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
  }));
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

  let rows = await loadSnapshots(weekend.saturday);
  const hasAnySnapshot = rows.some((r) => r.computedAt != null);
  const newestComputedAt = rows.reduce<Date | null>((acc, r) => {
    if (!r.computedAt) return acc;
    if (!acc || r.computedAt > acc) return r.computedAt;
    return acc;
  }, null);

  let refreshedInline = false;

  if (!hasAnySnapshot) {
    await refreshWeekendScores({ now });
    refreshedInline = true;
    rows = await loadSnapshots(weekend.saturday);
  } else if (!isFresh(newestComputedAt, now) && scheduleBg) {
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
