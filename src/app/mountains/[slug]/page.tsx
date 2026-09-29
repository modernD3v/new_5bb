import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { JsonLd } from "@/components/seo/json-ld";
import { ForecastStrip } from "@/components/snow/forecast-strip";
import { ScoreBadge } from "@/components/snow/score-badge";
import {
  DISCLAIMER,
  formatUpdatedAgo,
  getMountainScore,
} from "@/lib/snow";
import type { DayForecastSummary } from "@/lib/snow/extract";
import {
  breadcrumbJsonLd,
  buildMetadata,
  skiResortJsonLd,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const mountain = await getMountainScore(slug);
  if (!mountain) {
    return buildMetadata({
      title: "Mountain not found",
      description: "That mountain is not on the Snow Board.",
      path: `/mountains/${slug}`,
    });
  }

  const topReason = mountain.reasons[0];
  const scoreBit =
    mountain.isIndoor || mountain.score == null
      ? "Indoor: always on"
      : `${mountain.score}/10 (${mountain.label})`;
  const description = topReason
    ? `${mountain.name} this weekend: ${scoreBit}. ${topReason}`
    : `${mountain.name} this weekend: ${scoreBit}. Forecast-based snow score for NYC riders.`;

  return buildMetadata({
    title: `${mountain.name} Snow Forecast This Weekend`,
    description,
    path: `/mountains/${mountain.slug}`,
  });
}

export default async function MountainPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mountain = await getMountainScore(slug);
  if (!mountain) notFound();

  const days = (mountain.forecast.days ?? []) as DayForecastSummary[];
  const updated = formatUpdatedAgo(mountain.computedAt);
  const scoreText =
    mountain.isIndoor || mountain.score == null
      ? "Indoor: always on"
      : `${mountain.score} out of 10 — ${mountain.label}`;

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a] text-white">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
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
              {mountain.name} snow forecast this weekend
            </h1>
          </div>

          <p className="text-base text-zinc-100">
            Weekend snow score: {scoreText}.
          </p>
          <p className="text-sm text-zinc-400">{updated}.</p>

          <ScoreBadge
            score={mountain.score}
            label={mountain.label}
            isIndoor={mountain.isIndoor}
            size="lg"
          />

          {mountain.reasons.length > 0 && (
            <div>
              <h2 className="text-sm font-medium tracking-wide text-sky-300 uppercase">
                Why this score
              </h2>
              <ul className="mt-2 space-y-1 text-sm text-zinc-200">
                {mountain.reasons.map((r) => (
                  <li key={r}>• {r}</li>
                ))}
              </ul>
            </div>
          )}
        </header>

        <section className="mt-8 space-y-3">
          <h2 className="text-sm font-medium tracking-wide text-sky-300 uppercase">
            Fri–Sun forecast
          </h2>
          {days.length === 0 ? (
            <p className="text-sm text-zinc-400">
              No outdoor Fri–Sun forecast (indoor mountain).
            </p>
          ) : (
            <>
              <ul className="space-y-2 text-sm text-zinc-200">
                {days.map((d) => (
                  <li key={d.date}>
                    {d.date}:{" "}
                    {d.snowIn > 0
                      ? `${d.snowIn.toFixed(1)} in snow`
                      : "no snow"}
                    ,{" "}
                    {d.rainIn > 0
                      ? `${d.rainIn.toFixed(1)} in rain`
                      : "dry"}
                    , high/low{" "}
                    {d.highF != null && d.lowF != null
                      ? `${Math.round(d.highF)}°F / ${Math.round(d.lowF)}°F`
                      : "n/a"}
                    , gusts{" "}
                    {d.maxGustMph != null
                      ? `${Math.round(d.maxGustMph)} mph`
                      : "n/a"}
                    .
                  </li>
                ))}
              </ul>
              <ForecastStrip days={days} />
            </>
          )}
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
      </main>
      <SiteFooter />
      <JsonLd
        data={[
          skiResortJsonLd({
            name: mountain.name,
            lat: mountain.lat,
            lon: mountain.lon,
            websiteUrl: mountain.websiteUrl,
            description: scoreText,
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Board", path: "/board" },
            {
              name: mountain.name,
              path: `/mountains/${mountain.slug}`,
            },
          ]),
        ]}
      />
    </div>
  );
}
