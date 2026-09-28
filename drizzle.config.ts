import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });
config({ path: ".env" });

/** Placeholder lets `drizzle-kit generate` run without a live DB. Never migrate against this. */
const PLACEHOLDER =
  "postgresql://user:pass@localhost:5432/5bb_placeholder?sslmode=disable";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? PLACEHOLDER,
  },
  strict: true,
  verbose: true,
});
