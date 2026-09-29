import { describe, expect, it } from "vitest";
import { getSql } from "@/lib/db";
import { __test } from "./refresh";

/**
 * Acceptance: when several refresh attempts race, only one claims the lock.
 * Uses the live Neon `dev` database when DATABASE_URL is set.
 */
describe("refresh lock concurrency", () => {
  it("allows only one claim while lock is held", async () => {
    if (!process.env.DATABASE_URL && !process.env.DATABASE_URL_UNPOOLED) {
      return;
    }

    const key = `test-lock-${Date.now()}`;
    const sql = getSql();

    try {
      await sql`DELETE FROM refresh_locks WHERE key = ${key}`;

      const results = await Promise.all([
        __test.claimRefreshLock(key),
        __test.claimRefreshLock(key),
        __test.claimRefreshLock(key),
        __test.claimRefreshLock(key),
        __test.claimRefreshLock(key),
      ]);

      const wins = results.filter(Boolean).length;
      expect(wins).toBe(1);
    } finally {
      await sql`DELETE FROM refresh_locks WHERE key = ${key}`;
    }
  }, 20_000);
});
