import { SCORE_COLORS } from "./config";

export function scoreColor(score: number | null, isIndoor: boolean): string {
  if (isIndoor || score == null) return SCORE_COLORS.indoor;
  if (score >= 8) return SCORE_COLORS.send;
  if (score >= 6) return SCORE_COLORS.solid;
  if (score >= 4) return SCORE_COLORS.meh;
  return SCORE_COLORS.skip;
}

export function formatUpdatedAgo(computedAt: Date | null, now = new Date()): string {
  if (!computedAt) return "Not yet updated";
  const mins = Math.max(
    0,
    Math.round((now.getTime() - computedAt.getTime()) / 60000),
  );
  if (mins < 1) return "Updated just now";
  if (mins < 60) return `Updated ${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `Updated ${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `Updated ${days} day${days === 1 ? "" : "s"} ago`;
}

export { SCORE_COLORS };
