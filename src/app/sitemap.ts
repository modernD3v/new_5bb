import type { MetadataRoute } from "next";
import { and, asc, eq, gte } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { events, mountains } from "@/lib/db/schema";
import { isShopEnabled } from "@/lib/flags";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: absoluteUrl("/board"),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/crew"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: absoluteUrl("/join"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/faq"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  if (isShopEnabled()) {
    entries.push({
      url: absoluteUrl("/shop"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    });
  }

  try {
    const db = getDb();
    const activeMountains = await db
      .select({
        slug: mountains.slug,
      })
      .from(mountains)
      .where(eq(mountains.active, true))
      .orderBy(asc(mountains.name));

    for (const m of activeMountains) {
      entries.push({
        url: absoluteUrl(`/mountains/${m.slug}`),
        lastModified: now,
        changeFrequency: "hourly",
        priority: 0.8,
      });
    }

    const upcoming = await db
      .select({
        slug: events.slug,
        startsAt: events.startsAt,
      })
      .from(events)
      .where(and(eq(events.published, true), gte(events.startsAt, now)))
      .orderBy(asc(events.startsAt));

    if (upcoming.length > 0) {
      entries.push({
        url: absoluteUrl("/trips"),
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
      for (const ev of upcoming) {
        entries.push({
          url: absoluteUrl(`/trips/${ev.slug}`),
          lastModified: ev.startsAt,
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }
    }
  } catch {
    // DB unavailable at build/preview — still emit static routes.
  }

  return entries;
}
