import { scoreColor } from "@/lib/snow/format";

export function ScoreBadge({
  score,
  label,
  isIndoor,
  size = "md",
}: {
  score: number | null;
  label: string;
  isIndoor: boolean;
  size?: "md" | "lg";
}) {
  const color = scoreColor(score, isIndoor);
  const display = isIndoor || score == null ? "⌂" : String(score);
  const dim = size === "lg" ? "size-24 text-4xl" : "size-14 text-xl";

  return (
    <div className="flex items-center gap-4">
      <div
        className={`flex ${dim} items-center justify-center rounded-full font-bold text-zinc-950`}
        style={{ backgroundColor: color }}
        aria-label={
          isIndoor ? "Indoor mountain" : `Score ${score} out of 10`
        }
      >
        {display}
      </div>
      <div>
        <div className="text-lg font-semibold text-white">{label}</div>
        {!isIndoor && score != null && (
          <div className="text-sm text-zinc-400">{score}/10</div>
        )}
      </div>
    </div>
  );
}
