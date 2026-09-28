import Link from "next/link";
import { scoreColor } from "@/lib/snow/format";
import type { MountainScoreRow } from "@/lib/snow/get-scores";

export function MountainRankList({
  mountains,
}: {
  mountains: MountainScoreRow[];
}) {
  return (
    <ol className="divide-y divide-zinc-800">
      {mountains.map((m, idx) => {
        const color = scoreColor(m.score, m.isIndoor);
        const display =
          m.isIndoor || m.score == null ? "—" : String(m.score);
        return (
          <li key={m.slug}>
            <Link
              href={`/mountains/${m.slug}`}
              className="flex items-center gap-3 px-3 py-3 transition hover:bg-zinc-900/80"
            >
              <span className="w-6 text-xs text-zinc-500">{idx + 1}</span>
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-zinc-950"
                style={{ backgroundColor: color }}
                aria-label={
                  m.isIndoor
                    ? "Indoor"
                    : `Score ${m.score ?? "pending"} out of 10`
                }
              >
                {m.isIndoor ? "⌂" : display}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-white">
                  {m.name}
                </span>
                <span className="block truncate text-xs text-zinc-400">
                  {m.state} · {m.label}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
