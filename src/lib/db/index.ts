import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function requireDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and use your Neon *dev* branch connection string.",
    );
  }
  return url;
}

export function createDb(connectionString = requireDatabaseUrl()) {
  const sql = neon(connectionString);
  return drizzle(sql, { schema });
}

export type Db = ReturnType<typeof createDb>;

/** Lazy singleton for server code. Prefer createDb() in scripts. */
let _db: Db | null = null;
export function getDb() {
  if (!_db) _db = createDb();
  return _db;
}
