import Link from "next/link";
import { notFound } from "next/navigation";
import { ForecastStrip } from "@/components/snow/forecast-strip";
import { ScoreBadge } from "@/components/snow/score-badge";
import {
  DISCLAIMER,
  formatUpdatedAgo,
  getMountainScore,
} from "@/lib/snow";
import type { DayForecastSummary } from "@/lib/snow/extract";

export const dynamic = "force-dynamic";

export default async function MountainPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mountain = await getMountainScore(slug);
  if (!mountain) notFound();

  const days = (mountain.forecast.days ?? []) as DayForecastSummary[];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
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
            size="lg"
          />

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
        </header>

        <section className="mt-8 space-y-3">
          <h2 className="text-sm font-medium tracking-wide text-sky-300 uppercase">
            Fri–Sun forecast
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
