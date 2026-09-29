import type { SeasonStatus } from "@/lib/season/status";
import { seasonShortLabel } from "@/lib/season/status";
import { mountainDisplayColor } from "@/lib/snow/format";

export function ScoreBadge({
  score,
  label,
  isIndoor,
  season = { state: "open" },
  size = "md",
}: {
  score: number | null;
  label: string;
  isIndoor: boolean;
  season?: SeasonStatus;
  size?: "md" | "lg";
}) {
  const offSeason = isIndoor ? null : seasonShortLabel(season);
  const color = mountainDisplayColor({ score, isIndoor, season });
  const display = isIndoor ? "⌂" : offSeason ? "Off" : score == null ? "-" : String(score);
  const dim = size === "lg" ? "size-24 text-4xl" : "size-14 text-xl";

  return (
    <div className="flex items-center gap-4">
      <div
        className={`flex ${dim} items-center justify-center rounded-full font-bold text-zinc-950 ${offSeason ? "!text-2xl" : ""}`}
        style={{ backgroundColor: color }}
        aria-label={
          isIndoor
            ? "Indoor mountain"
            : offSeason
              ? `No score: ${offSeason}`
              : `Score ${score} out of 10`
        }
      >
        {display}
      </div>
      <div>
        <div className="text-lg font-semibold text-white">
          {offSeason ?? label}
        </div>
        {!isIndoor && !offSeason && score != null && (
          <div className="text-sm text-zinc-400">{score}/10</div>
        )}
      </div>
    </div>
  );
}
