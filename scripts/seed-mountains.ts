import { eq, inArray } from "drizzle-orm";
import { createDb } from "../src/lib/db";
import { mountainPasses, mountains, seedRuns } from "../src/lib/db/schema";
import {
  MOUNTAIN_SEEDS,
  PASS_SEEDS,
  PASS_SEED_SEASON,
  PASS_SEED_VERIFIED_AT,
} from "../src/lib/db/seed-data";

/**
 * Idempotent upsert of all seeded mountains (conflict target: slug).
 * opening_date / closing_date are admin-owned and never touched here.
 */
export async function seedMountains(
  connectionString?: string,
): Promise<{ upserted: number }> {
  const db = createDb(connectionString);

  for (const m of MOUNTAIN_SEEDS) {
    await db
      .insert(mountains)
      .values({
        slug: m.slug,
        name: m.name,
        state: m.state,
        lat: m.lat,
        lon: m.lon,
        summitElevFt: m.summitElevFt,
        baseElevFt: m.baseElevFt,
        isIndoor: m.isIndoor,
        websiteUrl: m.websiteUrl,
        driveNote: m.driveNote,
        active: m.active,
      })
      .onConflictDoUpdate({
        target: mountains.slug,
        set: {
          name: m.name,
          state: m.state,
          lat: m.lat,
          lon: m.lon,
          summitElevFt: m.summitElevFt,
          baseElevFt: m.baseElevFt,
          isIndoor: m.isIndoor,
          websiteUrl: m.websiteUrl,
          driveNote: m.driveNote,
          active: m.active,
        },
      });
  }

  return { upserted: MOUNTAIN_SEEDS.length };
}

export const PASS_SEED_KEY = `mountain_passes:${PASS_SEED_SEASON}`;

/**
 * Seeds the season's pass rows once. After that, passes belong to /admin:
 * the seed_runs marker stops later builds from re-adding a row an admin
 * deleted or overwriting an edited tier note.
 */
export async function seedMountainPasses(
  connectionString?: string,
): Promise<{ inserted: number; skipped: boolean }> {
  const db = createDb(connectionString);

  const done = await db
    .select({ key: seedRuns.key })
    .from(seedRuns)
    .where(eq(seedRuns.key, PASS_SEED_KEY))
    .limit(1);
  if (done.length > 0) return { inserted: 0, skipped: true };

  const rows = await db
    .select({ id: mountains.id, slug: mountains.slug })
    .from(mountains)
    .where(
      inArray(
        mountains.slug,
        PASS_SEEDS.map((p) => p.slug),
      ),
    );
  const idBySlug = new Map(rows.map((r) => [r.slug, r.id]));

  const values = PASS_SEEDS.map((p) => {
    const mountainId = idBySlug.get(p.slug);
    if (!mountainId) throw new Error(`Pass seed references unknown mountain "${p.slug}"`);
    return {
      mountainId,
      pass: p.pass,
      tierNote: p.tierNote,
      season: PASS_SEED_SEASON,
      sourceUrl: p.sourceUrl,
      verifiedAt: PASS_SEED_VERIFIED_AT,
    };
  });

  const inserted = await db
    .insert(mountainPasses)
    .values(values)
    .onConflictDoNothing({
      target: [mountainPasses.mountainId, mountainPasses.pass, mountainPasses.season],
    })
    .returning({ id: mountainPasses.id });

  await db.insert(seedRuns).values({ key: PASS_SEED_KEY }).onConflictDoNothing();

  return { inserted: inserted.length, skipped: false };
}
