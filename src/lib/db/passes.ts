import { and, asc, desc, eq, inArray, lte } from "drizzle-orm";
import type { MountainPassInfo, SkiPass } from "@/lib/passes/config";
import { SKI_PASSES } from "@/lib/passes/config";
import { getDb } from "./index";
import { mountainPasses, mountains } from "./schema";

/**
 * The season to show: the current one if any pass rows exist for it,
 * otherwise the latest earlier season that has rows (so the board isn't
 * blank on Jul 1 before an admin enters next season's passes).
 */
export async function resolvePassSeason(currentSeason: string): Promise<string> {
  const db = getDb();
  const rows = await db
    .selectDistinct({ season: mountainPasses.season })
    .from(mountainPasses)
    .where(lte(mountainPasses.season, currentSeason))
    .orderBy(desc(mountainPasses.season))
    .limit(1);
  return rows[0]?.season ?? currentSeason;
}

function sortPasses(rows: MountainPassInfo[]): MountainPassInfo[] {
  return [...rows].sort(
    (a, b) => SKI_PASSES.indexOf(a.pass) - SKI_PASSES.indexOf(b.pass),
  );
}

export async function listPassesByMountain(
  season: string,
  mountainIds?: string[],
): Promise<Map<string, MountainPassInfo[]>> {
  const db = getDb();
  const where = mountainIds
    ? and(
        eq(mountainPasses.season, season),
        inArray(mountainPasses.mountainId, mountainIds),
      )
    : eq(mountainPasses.season, season);
  const rows = await db
    .select({
      mountainId: mountainPasses.mountainId,
      pass: mountainPasses.pass,
      tierNote: mountainPasses.tierNote,
      season: mountainPasses.season,
      sourceUrl: mountainPasses.sourceUrl,
      verifiedAt: mountainPasses.verifiedAt,
    })
    .from(mountainPasses)
    .where(where);

  const byMountain = new Map<string, MountainPassInfo[]>();
  for (const { mountainId, ...info } of rows) {
    const list = byMountain.get(mountainId) ?? [];
    list.push(info);
    byMountain.set(mountainId, list);
  }
  for (const [id, list] of byMountain) byMountain.set(id, sortPasses(list));
  return byMountain;
}

// --- Admin ---

export async function listMountainsForAdmin(season: string) {
  const db = getDb();
  const all = await db.select().from(mountains).orderBy(asc(mountains.name));
  const passes = await listPassesByMountain(season);
  return all.map((m) => ({ ...m, passes: passes.get(m.id) ?? [] }));
}

export async function listPassSeasons(): Promise<string[]> {
  const db = getDb();
  const rows = await db
    .selectDistinct({ season: mountainPasses.season })
    .from(mountainPasses)
    .orderBy(desc(mountainPasses.season));
  return rows.map((r) => r.season);
}

/** Start a new season from last season's rows; verified_at is cleared so each row gets re-checked. */
export async function copyPassSeason(
  fromSeason: string,
  toSeason: string,
): Promise<number> {
  const db = getDb();
  const source = await db
    .select()
    .from(mountainPasses)
    .where(eq(mountainPasses.season, fromSeason));
  if (source.length === 0) return 0;
  const inserted = await db
    .insert(mountainPasses)
    .values(
      source.map((r) => ({
        mountainId: r.mountainId,
        pass: r.pass,
        tierNote: r.tierNote,
        season: toSeason,
        sourceUrl: r.sourceUrl,
        verifiedAt: null,
      })),
    )
    .onConflictDoNothing({
      target: [mountainPasses.mountainId, mountainPasses.pass, mountainPasses.season],
    })
    .returning({ id: mountainPasses.id });
  return inserted.length;
}

export type MountainPassEdit = {
  pass: SkiPass;
  tierNote: string | null;
  sourceUrl: string | null;
  verifiedAt: string | null;
};

/**
 * Replace one mountain's pass rows for a season and set its opening/closing
 * dates. No transactions on the neon-http driver, so delete-then-insert is
 * scoped to the passes that were unchecked, and checked ones are upserted.
 */
export async function saveMountainSeason(input: {
  mountainId: string;
  season: string;
  openingDate: string | null;
  closingDate: string | null;
  passes: MountainPassEdit[];
}): Promise<void> {
  const db = getDb();

  await db
    .update(mountains)
    .set({ openingDate: input.openingDate, closingDate: input.closingDate })
    .where(eq(mountains.id, input.mountainId));

  const keep = new Set(input.passes.map((p) => p.pass));
  const drop = SKI_PASSES.filter((p) => !keep.has(p));
  if (drop.length > 0) {
    await db
      .delete(mountainPasses)
      .where(
        and(
          eq(mountainPasses.mountainId, input.mountainId),
          eq(mountainPasses.season, input.season),
          inArray(mountainPasses.pass, drop),
        ),
      );
  }

  for (const p of input.passes) {
    await db
      .insert(mountainPasses)
      .values({
        mountainId: input.mountainId,
        season: input.season,
        pass: p.pass,
        tierNote: p.tierNote,
        sourceUrl: p.sourceUrl,
        verifiedAt: p.verifiedAt,
      })
      .onConflictDoUpdate({
        target: [
          mountainPasses.mountainId,
          mountainPasses.pass,
          mountainPasses.season,
        ],
        set: {
          tierNote: p.tierNote,
          sourceUrl: p.sourceUrl,
          verifiedAt: p.verifiedAt,
        },
      });
  }
}
