"use client";

import { PASS_LABELS } from "@/lib/passes/config";
import {
  isAllSelected,
  PASS_FILTER_KEYS,
  type PassFilterKey,
  type PassSelection,
} from "@/lib/passes/filter";

const CHIP_LABELS: Record<PassFilterKey | "all", string> = {
  all: "All",
  ...PASS_LABELS,
  none: "No pass",
};

export function PassFilterChips({
  selection,
  counts,
  onToggle,
}: {
  selection: PassSelection;
  counts: Record<PassFilterKey | "all", number>;
  onToggle: (key: PassFilterKey | "all") => void;
}) {
  const chips = ["all", ...PASS_FILTER_KEYS] as const;
  return (
    <div
      role="group"
      aria-label="Filter mountains by ski pass"
      className="flex gap-2 overflow-x-auto pb-0.5"
    >
      {chips.map((key) => {
        const pressed =
          key === "all" ? isAllSelected(selection) : selection.includes(key);
        return (
          <button
            key={key}
            type="button"
            aria-pressed={pressed}
            onClick={() => onToggle(key)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7DD3FC] ${
              pressed
                ? "border-sky-300 bg-sky-300 text-zinc-950"
                : "border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-zinc-500"
            }`}
          >
            {CHIP_LABELS[key]}
            <span
              className={`ml-1.5 text-xs ${pressed ? "text-zinc-700" : "text-zinc-500"}`}
            >
              {counts[key]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
