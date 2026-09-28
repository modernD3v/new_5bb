import { config } from "dotenv";
import { createDb } from "../src/lib/db";
import { mountains } from "../src/lib/db/schema";
import { MOUNTAIN_SEEDS } from "../src/lib/db/seed-data";

config({ path: ".env.local" });
config({ path: ".env" });

async function main() {
  const db = createDb();

  console.log(`Seeding ${MOUNTAIN_SEEDS.length} mountains…`);

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
    console.log(`  ✓ ${m.slug}`);
  }

  console.log("Seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
