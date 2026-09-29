"use client";

import dynamic from "next/dynamic";
import type { MountainScoreRow } from "@/lib/snow/get-scores";

const BoardMap = dynamic(
  () => import("./board-map").then((m) => m.BoardMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-zinc-200 text-sm text-zinc-600 animate-pulse">
        Loading map…
      </div>
    ),
  },
);

export function BoardMapDynamic({
  mountains,
}: {
  mountains: MountainScoreRow[];
}) {
  return <BoardMap mountains={mountains} />;
}
