import Link from "next/link";
import { PassBadges } from "@/components/passes/pass-badges";
import { seasonShortLabel } from "@/lib/season/status";
import { mountainDisplayColor } from "@/lib/snow/format";
import type { MountainScoreRow } from "@/lib/snow/get-scores";

export function MountainRankList({
  mountains,
}: {
  mountains: MountainScoreRow[];
}) {
  return (
    <ol className="divide-y divide-zinc-800">
      {mountains.map((m, idx) => {
        const offSeason = seasonShortLabel(m.season);
        // Rows arrive ranked (rankMountains), so scored rows are a prefix.
        const scored = !offSeason && !m.isIndoor && m.score != null;
        const rank = idx + 1;
        const color = mountainDisplayColor(m);
        const display = m.isIndoor
          ? "⌂"
          : offSeason
            ? "Off"
            : m.score == null
              ? "-"
              : String(m.score);
        return (
          <li
            key={m.slug}
            className="relative flex items-center gap-3 px-3 py-3 transition hover:bg-zinc-900/80"
          >
            <span className="w-6 text-xs text-zinc-500">
              {scored ? rank : ""}
            </span>
            <span
              className={`flex size-9 shrink-0 items-center justify-center rounded-full font-bold text-zinc-950 ${offSeason ? "text-[11px]" : "text-sm"}`}
              style={{ backgroundColor: color }}
              aria-label={
                m.isIndoor
                  ? "Indoor"
                  : offSeason
                    ? `No score: ${offSeason}`
                    : `Score ${m.score ?? "pending"} out of 10`
              }
            >
              {display}
            </span>
            <span className="min-w-0 flex-1">
              <Link
                href={`/mountains/${m.slug}`}
                className="block truncate font-medium text-white after:absolute after:inset-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7DD3FC]"
              >
                {m.name}
              </Link>
              <span className="block truncate text-xs text-zinc-400">
                {m.state} · {offSeason ?? m.label}
              </span>
              <PassBadges
                passes={m.passes}
                showNoPass
                className="relative z-10 mt-1 w-fit"
              />
            </span>
          </li>
        );
      })}
    </ol>
  );
}
