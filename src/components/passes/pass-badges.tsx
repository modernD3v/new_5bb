"use client";

import { useId, useState } from "react";
import {
  NO_PASS_LABEL,
  PASS_BADGE_STYLES,
  PASS_LABELS,
  type MountainPassInfo,
} from "@/lib/passes/config";

function PassBadge({ info }: { info: MountainPassInfo }) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();
  const label = PASS_LABELS[info.pass];

  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-expanded={info.tierNote ? open : undefined}
        aria-describedby={info.tierNote ? tooltipId : undefined}
        aria-label={`${label} pass${info.tierNote ? `: ${info.tierNote}` : ""}`}
        onClick={(e) => {
          // Badges sit inside clickable rows and map popups.
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        onBlur={() => setOpen(false)}
        className={`rounded px-1.5 py-0.5 text-[10px] leading-none font-bold tracking-wide uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#7DD3FC] ${PASS_BADGE_STYLES[info.pass]}`}
      >
        {label}
      </button>
      {info.tierNote && (
        <span
          role="tooltip"
          id={tooltipId}
          className={`absolute top-full left-0 z-[1000] mt-1 w-max max-w-[220px] rounded-md bg-zinc-900 px-2 py-1 text-[11px] leading-snug font-normal text-white shadow-lg ring-1 ring-zinc-700 group-hover:block ${open ? "block" : "hidden"}`}
        >
          {info.tierNote}
        </span>
      )}
    </span>
  );
}

export function PassBadges({
  passes,
  showNoPass = false,
  className = "",
}: {
  passes: MountainPassInfo[];
  showNoPass?: boolean;
  className?: string;
}) {
  if (passes.length === 0) {
    return showNoPass ? (
      <span className={`text-[11px] text-zinc-500 ${className}`}>
        {NO_PASS_LABEL}
      </span>
    ) : null;
  }
  return (
    <span className={`flex flex-wrap items-center gap-1 ${className}`}>
      {passes.map((p) => (
        <PassBadge key={p.pass} info={p} />
      ))}
    </span>
  );
}
