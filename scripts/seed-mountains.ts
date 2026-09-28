import { createDb } from "../src/lib/db";
import { mountains } from "../src/lib/db/schema";
import { MOUNTAIN_SEEDS } from "../src/lib/db/seed-data";

/** Idempotent upsert of all seeded mountains (conflict target: slug). */
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
