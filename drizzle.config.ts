import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });
config({ path: ".env" });

/**
 * Prefer the direct (unpooled) Neon URL for migrations.
 * Fall back to DATABASE_URL so pooled-only setups still work.
 * Placeholder is only for `drizzle-kit generate` — never migrate against it.
 */
const PLACEHOLDER =
  "postgresql://user:pass@localhost:5432/5bb_placeholder?sslmode=disable";

const configuredUrl =
  process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || "";

const isMigrateCommand = process.argv.some((arg) => arg === "migrate");

if (isMigrateCommand && !configuredUrl) {
  throw new Error(
    "Missing DATABASE_URL_UNPOOLED (preferred) or DATABASE_URL. " +
      "On Cursor Cloud / Vercel, set both pointing at the intended Neon branch. " +
      "Never commit connection strings.",
  );
}

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: configuredUrl || PLACEHOLDER,
  },
  strict: true,
  verbose: true,
});
