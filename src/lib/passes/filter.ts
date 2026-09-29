import { SKI_PASSES, type SkiPass } from "./config";

export const PASS_FILTER_KEYS = [...SKI_PASSES, "none"] as const;
export type PassFilterKey = (typeof PASS_FILTER_KEYS)[number];

/** Empty selection means "All". Always kept in canonical order, no duplicates. */
export type PassSelection = PassFilterKey[];

export const PASS_QUERY_PARAM = "pass";
export const PASS_STORAGE_KEY = "5bb:board:pass-filter";

function isFilterKey(value: string): value is PassFilterKey {
  return (PASS_FILTER_KEYS as readonly string[]).includes(value);
}

function normalize(keys: Iterable<PassFilterKey>): PassSelection {
  const set = new Set(keys);
  const ordered = PASS_FILTER_KEYS.filter((k) => set.has(k));
  // Every chip on is the same view as "All".
  return ordered.length === PASS_FILTER_KEYS.length ? [] : ordered;
}

/** Parse `?pass=ikon,indy` (or a stored value). Unknown tokens are ignored; "all" clears. */
export function parsePassSelection(
  raw: string | string[] | null | undefined,
): PassSelection {
  if (raw == null) return [];
  const joined = Array.isArray(raw) ? raw.join(",") : raw;
  const tokens = joined
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  if (tokens.includes("all")) return [];
  return normalize(tokens.filter(isFilterKey));
}

/** `null` means "All" (drop the query param). */
export function serializePassSelection(selection: PassSelection): string | null {
  const normalized = normalize(selection);
  return normalized.length === 0 ? null : normalized.join(",");
}

/** Chip behavior: "all" clears everything, other chips toggle (multi-select). */
export function togglePassSelection(
  selection: PassSelection,
  key: PassFilterKey | "all",
): PassSelection {
  if (key === "all") return [];
  const next = new Set(selection);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  return normalize(next);
}

export function isAllSelected(selection: PassSelection): boolean {
  return normalize(selection).length === 0;
}

/**
 * A mountain matches when it has any selected pass, or it has no pass and
 * "No pass" is selected.
 */
export function mountainMatchesPassSelection(
  passes: readonly SkiPass[],
  selection: PassSelection,
): boolean {
  const normalized = normalize(selection);
  if (normalized.length === 0) return true;
  if (passes.length === 0) return normalized.includes("none");
  return passes.some((p) => normalized.includes(p));
}

export function filterByPassSelection<T extends { passes: readonly { pass: SkiPass }[] }>(
  mountains: readonly T[],
  selection: PassSelection,
): T[] {
  return mountains.filter((m) =>
    mountainMatchesPassSelection(
      m.passes.map((p) => p.pass),
      selection,
    ),
  );
}

/**
 * Initial selection precedence: shared URL, then the member's saved passes,
 * then this browser's last choice, then All.
 */
export function resolveInitialPassSelection(sources: {
  urlParam?: string | string[] | null;
  memberPasses?: readonly SkiPass[] | null;
  stored?: string | null;
}): PassSelection {
  if (sources.urlParam != null && sources.urlParam !== "") {
    return parsePassSelection(sources.urlParam);
  }
  if (sources.memberPasses && sources.memberPasses.length > 0) {
    return normalize(sources.memberPasses);
  }
  if (sources.stored != null) return parsePassSelection(sources.stored);
  return [];
}
