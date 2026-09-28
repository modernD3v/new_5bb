import { asc, eq } from "drizzle-orm";
import { getDb } from "./index";
import { mountains } from "./schema";

export async function listActiveMountains() {
  const db = getDb();
  return db
    .select()
    .from(mountains)
    .where(eq(mountains.active, true))
    .orderBy(asc(mountains.name));
}

export async function getMountainBySlug(slug: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(mountains)
    .where(eq(mountains.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}
