"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { BoardMapDynamic } from "@/components/board/board-map-dynamic";
import { MountainRankList } from "@/components/board/mountain-rank-list";
import { PassFilterChips } from "@/components/board/pass-filter-chips";
import { PASS_LABELS, PASS_RESORT_URLS, SKI_PASSES } from "@/lib/passes/config";
import {
  filterByPassSelection,
  PASS_FILTER_KEYS,
  PASS_QUERY_PARAM,
  PASS_STORAGE_KEY,
  parsePassSelection,
  resolveInitialPassSelection,
  serializePassSelection,
  togglePassSelection,
  type PassFilterKey,
  type PassSelection,
} from "@/lib/passes/filter";
import { DISCLAIMER } from "@/lib/snow/config";
import type { MountainScoreRow } from "@/lib/snow/get-scores";

function readStoredSelection(): string | null {
  try {
    return window.localStorage.getItem(PASS_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredSelection(value: string | null) {
  try {
    if (value == null) window.localStorage.removeItem(PASS_STORAGE_KEY);
    else window.localStorage.setItem(PASS_STORAGE_KEY, value);
  } catch {
    // Private mode / storage disabled: the URL still carries the filter.
  }
}

function subscribeStorage(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function replaceUrlParam(value: string | null) {
  const url = new URL(window.location.href);
  if (value == null) url.searchParams.delete(PASS_QUERY_PARAM);
  else url.searchParams.set(PASS_QUERY_PARAM, value);
  // Keep the comma readable in shared links (?pass=ikon,indy).
  const search = url.searchParams.toString().replace(/%2C/gi, ",");
  window.history.replaceState(null, "", `${url.pathname}${search ? `?${search}` : ""}${url.hash}`);
}

export function BoardExplorer({
  mountains,
  urlPassParam,
  passSeason,
}: {
  mountains: MountainScoreRow[];
  /** Raw `?pass=` value from the request, if present. */
  urlPassParam: string | null;
  passSeason: string;
}) {
  // TODO(Phase 2): when Auth.js lands, pass the member's saved "My passes"
  // (profile field) in as `memberPasses` so it becomes their default filter.
  const stored = useSyncExternalStore(subscribeStorage, readStoredSelection, () => null);
  const [picked, setPicked] = useState<PassSelection | null>(() =>
    urlPassParam ? parsePassSelection(urlPassParam) : null,
  );

  const selection = useMemo(
    () => picked ?? resolveInitialPassSelection({ urlParam: urlPassParam, stored }),
    [picked, stored, urlPassParam],
  );

  // A remembered default shows up in the URL too, so the view is shareable.
  useEffect(() => {
    if (picked == null && !urlPassParam && stored) {
      replaceUrlParam(serializePassSelection(parsePassSelection(stored)));
    }
  }, [picked, stored, urlPassParam]);

  const onToggle = useCallback(
    (key: PassFilterKey | "all") => {
      const next = togglePassSelection(selection, key);
      const serialized = serializePassSelection(next);
      setPicked(next);
      replaceUrlParam(serialized);
      writeStoredSelection(serialized ?? "all");
    },
    [selection],
  );

  const visible = useMemo(
    () => filterByPassSelection(mountains, selection),
    [mountains, selection],
  );

  const counts = useMemo(() => {
    const c = { all: mountains.length } as Record<PassFilterKey | "all", number>;
    for (const key of PASS_FILTER_KEYS) {
      c[key] = filterByPassSelection(mountains, [key]).length;
    }
    return c;
  }, [mountains]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="space-y-2 border-b border-zinc-800 px-4 py-3">
        <PassFilterChips selection={selection} counts={counts} onToggle={onToggle} />
        <p className="text-xs leading-relaxed text-zinc-400">
          Pass info for the {passSeason} season. Always confirm with the pass before you go.{" "}
          <span className="whitespace-nowrap">
            {SKI_PASSES.map((p, i) => (
              <span key={p}>
                {i > 0 && " · "}
                <a
                  href={PASS_RESORT_URLS[p]}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-300 underline"
                >
                  {PASS_LABELS[p]} resorts
                </a>
              </span>
            ))}
          </span>
        </p>
      </div>

      <div className="flex flex-1 flex-col lg:flex-row">
        <div className="h-[55vh] min-h-[320px] w-full lg:h-auto lg:flex-1">
          <BoardMapDynamic mountains={visible} />
        </div>
        <aside className="w-full border-t border-zinc-800 lg:w-96 lg:border-t-0 lg:border-l">
          <div className="flex items-baseline justify-between border-b border-zinc-800 px-4 py-3 text-sm font-medium">
            <span>Ranked by weekend score</span>
            <span className="text-xs font-normal text-zinc-500" aria-live="polite">
              {visible.length} of {mountains.length} mountains
            </span>
          </div>
          {visible.length === 0 ? (
            <p className="px-4 py-6 text-sm text-zinc-400">
              No mountains match this filter.
            </p>
          ) : (
            <MountainRankList mountains={visible} />
          )}
          <p className="border-t border-zinc-800 px-4 py-3 text-xs leading-relaxed text-zinc-500">
            {DISCLAIMER}
          </p>
        </aside>
      </div>
    </div>
  );
}
