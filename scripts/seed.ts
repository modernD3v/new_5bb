import { config } from "dotenv";
import { seedMountainPasses, seedMountains } from "./seed-mountains";

config({ path: ".env.local" });
config({ path: ".env" });

async function main() {
  console.log("Seeding mountains (idempotent upsert on slug)…");
  const { upserted } = await seedMountains();
  console.log(`Seed complete: ${upserted} mountains upserted.`);

  const passes = await seedMountainPasses();
  console.log(
    passes.skipped
      ? "Pass rows already seeded for this season; leaving admin edits alone."
      : `Seeded ${passes.inserted} pass rows.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
