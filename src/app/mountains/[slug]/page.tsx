import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MountainPassInfoSection } from "@/components/passes/mountain-pass-info";
import { ForecastStrip } from "@/components/snow/forecast-strip";
import { ScoreBadge } from "@/components/snow/score-badge";
import { getMountainBySlug } from "@/lib/db/mountains";
import { formatSeasonDate, seasonMessage } from "@/lib/season/status";
import {
  DISCLAIMER,
  formatUpdatedAgo,
  getMountainScore,
} from "@/lib/snow";
import type { DayForecastSummary } from "@/lib/snow/extract";

export const dynamic = "force-dynamic";

/** Stable on purpose: search snippets shouldn't carry a score that changes hourly. */
function mountainDescription(m: { name: string; state: string }) {
  return `Weekend snow score and forecast for ${m.name}, ${m.state}.`;
}

export async function generateMetadata({
  params,
}: PageProps<"/mountains/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const mountain = await getMountainBySlug(slug);
  if (!mountain) return {};
  return {
    title: `${mountain.name} weekend snow score | Five Borough Boarders`,
    description: mountainDescription(mountain),
  };
}

export default async function MountainPage({
  params,
}: PageProps<"/mountains/[slug]">) {
  const { slug } = await params;
  const mountain = await getMountainScore(slug);
  if (!mountain) notFound();

  const days = (mountain.forecast.days ?? []) as DayForecastSummary[];
  const offSeasonMessage = mountain.isIndoor
    ? null
    : seasonMessage(mountain.season, mountain.name);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SkiResort",
    name: mountain.name,
    description: mountainDescription(mountain),
    ...(mountain.websiteUrl ? { url: mountain.websiteUrl } : {}),
    address: {
      "@type": "PostalAddress",
      addressRegion: mountain.state,
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: mountain.lat,
      longitude: mountain.lon,
    },
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link
          href="/board"
          className="text-sm text-sky-300 hover:underline"
        >
          ← Snow Board
        </Link>

        <header className="mt-4 space-y-4">
          <div>
            <p className="text-sm text-zinc-400">
              {mountain.state}
              {mountain.driveNote ? ` · ${mountain.driveNote}` : ""}
            </p>
            <h1 className="text-3xl font-bold tracking-tight">
              {mountain.name}
            </h1>
          </div>

          <ScoreBadge
            score={mountain.score}
            label={mountain.label}
            isIndoor={mountain.isIndoor}
            season={mountain.season}
            size="lg"
          />

          {offSeasonMessage ? (
            <p className="text-sm text-zinc-300">
              {offSeasonMessage}
              {mountain.season.state === "preseason" &&
                mountain.season.opensOn &&
                ` Opening day is ${formatSeasonDate(mountain.season.opensOn, true)}.`}
            </p>
          ) : (
            <>
              <p className="text-sm text-zinc-400">
                {formatUpdatedAgo(mountain.computedAt)}
              </p>
              {mountain.reasons.length > 0 && (
                <ul className="space-y-1 text-sm text-zinc-200">
                  {mountain.reasons.map((r) => (
                    <li key={r}>• {r}</li>
                  ))}
                </ul>
              )}
            </>
          )}

          <MountainPassInfoSection
            mountainName={mountain.name}
            passes={mountain.passes}
            season={mountain.all.passSeason}
          />
        </header>

        <section className="mt-8 space-y-3">
          <h2 className="text-sm font-medium tracking-wide text-sky-300 uppercase">
            Fri to Sun forecast
          </h2>
          <ForecastStrip days={days} />
        </section>

        <p className="mt-8 text-xs leading-relaxed text-zinc-500">
          {DISCLAIMER}{" "}
          {mountain.websiteUrl && (
            <a
              href={mountain.websiteUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sky-400 underline"
            >
              Resort site
            </a>
          )}
        </p>
      </div>
    </div>
  );
}
