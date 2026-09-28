import { config } from "dotenv";
import { seedMountains } from "./seed-mountains";

config({ path: ".env.local" });
config({ path: ".env" });

async function main() {
  console.log("Seeding mountains (idempotent upsert on slug)…");
  const { upserted } = await seedMountains();
  console.log(`Seed complete: ${upserted} mountains upserted.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
