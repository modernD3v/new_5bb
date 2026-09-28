import { eq, sql } from "drizzle-orm";
import { getDb, getSql } from "@/lib/db";
import { mountains, scoreSnapshots } from "@/lib/db/schema";
import {
  REFRESH_LOCK_KEY,
} from "./config";
import { extractForecastStrip, extractScoreInputs } from "./extract";
import { fetchOpenMeteoForecasts } from "./open-meteo";
import { indoorScore, scoreWeekend } from "./score";
import { getTargetWeekend, type TargetWeekend } from "./weekend";

export type RefreshResult = {
  refreshed: boolean;
  skipped: boolean;
  reason?: string;
  weekendStart: string;
};

async function claimRefreshLock(key = REFRESH_LOCK_KEY): Promise<boolean> {
  const raw = getSql();
  const rows = await raw`
    INSERT INTO refresh_locks AS rl (key, locked_until)
    VALUES (${key}, now() + interval '2 minutes')
    ON CONFLICT (key) DO UPDATE
      SET locked_until = now() + interval '2 minutes'
      WHERE rl.locked_until < now()
    RETURNING key
  `;
  return rows.length > 0;
}

async function releaseRefreshLock(key = REFRESH_LOCK_KEY): Promise<void> {
  const db = getDb();
  await db.execute(
    sql`UPDATE refresh_locks SET locked_until = now() - interval '1 second' WHERE key = ${key}`,
  );
}

/**
 * Fetch Open-Meteo, score outdoor mountains, upsert score_snapshots.
 * Respects the refresh lock unless `force` is true (still claims the lock).
 */
export async function refreshWeekendScores(options?: {
  now?: Date;
  force?: boolean;
  lockKey?: string;
}): Promise<RefreshResult> {
  const now = options?.now ?? new Date();
  const weekend = getTargetWeekend(now);
  const lockKey = options?.lockKey ?? REFRESH_LOCK_KEY;

  const claimed = await claimRefreshLock(lockKey);
  if (!claimed) {
    return {
      refreshed: false,
      skipped: true,
      reason: "lock-held",
      weekendStart: weekend.saturday,
    };
  }

  try {
    await runRefresh(weekend);
    return {
      refreshed: true,
      skipped: false,
      weekendStart: weekend.saturday,
    };
  } catch (err) {
    console.error("[snow/refresh] Open-Meteo refresh failed", err);
    return {
      refreshed: false,
      skipped: false,
      reason: err instanceof Error ? err.message : "refresh-failed",
      weekendStart: weekend.saturday,
    };
  } finally {
    await releaseRefreshLock(lockKey);
  }
}

async function runRefresh(weekend: TargetWeekend) {
  const db = getDb();
  const all = await db.select().from(mountains).where(eq(mountains.active, true));
  const outdoor = all.filter((m) => !m.isIndoor);
  const indoor = all.filter((m) => m.isIndoor);

  const forecasts =
    outdoor.length > 0
      ? await fetchOpenMeteoForecasts(
          outdoor.map((m) => ({
            id: m.id,
            lat: m.lat,
            lon: m.lon,
            summitElevFt: m.summitElevFt,
          })),
        )
      : [];

  if (outdoor.length > 0 && forecasts.length !== outdoor.length) {
    throw new Error(
      `Open-Meteo returned ${forecasts.length} locations for ${outdoor.length} mountains`,
    );
  }

  const computedAt = new Date();

  for (let i = 0; i < outdoor.length; i++) {
    const mountain = outdoor[i]!;
    const loc = forecasts[i]!;
    const inputs = extractScoreInputs(loc, weekend);
    const scored = scoreWeekend(inputs);
    const forecast = {
      days: extractForecastStrip(loc, weekend),
      inputs,
    };

    await db
      .insert(scoreSnapshots)
      .values({
        mountainId: mountain.id,
        weekendStart: weekend.saturday,
        score: scored.score,
        label: scored.label,
        reasons: scored.reasons,
        forecast,
        computedAt,
      })
      .onConflictDoUpdate({
        target: [scoreSnapshots.mountainId, scoreSnapshots.weekendStart],
        set: {
          score: scored.score,
          label: scored.label,
          reasons: scored.reasons,
          forecast,
          computedAt,
        },
      });
  }

  for (const mountain of indoor) {
    const scored = indoorScore();
    await db
      .insert(scoreSnapshots)
      .values({
        mountainId: mountain.id,
        weekendStart: weekend.saturday,
        score: null,
        label: scored.label,
        reasons: scored.reasons,
        forecast: { days: [], indoor: true },
        computedAt,
      })
      .onConflictDoUpdate({
        target: [scoreSnapshots.mountainId, scoreSnapshots.weekendStart],
        set: {
          score: null,
          label: scored.label,
          reasons: scored.reasons,
          forecast: { days: [], indoor: true },
          computedAt,
        },
      });
  }
}

/** Exported for tests — claim lock without refreshing. */
export const __test = { claimRefreshLock, releaseRefreshLock };
