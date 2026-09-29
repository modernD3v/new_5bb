import type { Metadata } from "next";
import Link from "next/link";
import { BoardMapDynamic } from "@/components/board/board-map-dynamic";
import { MountainRankList } from "@/components/board/mountain-rank-list";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { DISCLAIMER, formatUpdatedAgo, getWeekendScores } from "@/lib/snow";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildMetadata({
  title: "Snow Board",
  description:
    "Weekend snow scores for the mountains NYC riders go to — map pins and a ranked list from Five Borough Boarders.",
  path: "/board",
});

export default async function BoardPage() {
  const payload = await getWeekendScores();

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a] text-white">
      <SiteHeader />
      <header className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <div>
          <h1 className="text-xl font-bold">Snow Board</h1>
          <p className="text-xs text-zinc-400">
            Weekend of {payload.weekend.saturday} ·{" "}
            {formatUpdatedAgo(payload.newestComputedAt)}
            {payload.isStale ? " (refreshing…)" : ""}
          </p>
        </div>
        <Link href="/" className="text-xs text-sky-300 hover:underline">
          Home
        </Link>
      </header>

      <div className="flex flex-1 flex-col lg:flex-row">
        <div className="h-[55vh] min-h-[320px] w-full lg:h-auto lg:flex-1">
          <BoardMapDynamic mountains={payload.mountains} />
        </div>
        <aside className="w-full border-t border-zinc-800 lg:w-96 lg:border-t-0 lg:border-l">
          <div className="border-b border-zinc-800 px-4 py-3 text-sm font-medium">
            Ranked by weekend score
          </div>
          <MountainRankList mountains={payload.mountains} />
          <p className="border-t border-zinc-800 px-4 py-3 text-xs leading-relaxed text-zinc-500">
            {DISCLAIMER}
          </p>
        </aside>
      </div>
      <SiteFooter />
    </div>
  );
}
