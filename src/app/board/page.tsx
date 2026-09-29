import Link from "next/link";
import { BoardExplorer } from "@/components/board/board-explorer";
import { SiteHeader } from "@/components/site-header";
import { PASS_QUERY_PARAM } from "@/lib/passes/filter";
import { formatUpdatedAgo, getWeekendScores } from "@/lib/snow";

export const dynamic = "force-dynamic";

export default async function BoardPage({ searchParams }: PageProps<"/board">) {
  const [payload, query] = await Promise.all([getWeekendScores(), searchParams]);
  const rawPass = query[PASS_QUERY_PARAM];
  const urlPassParam = Array.isArray(rawPass) ? rawPass.join(",") : (rawPass ?? null);

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

      <BoardExplorer
        mountains={payload.mountains}
        urlPassParam={urlPassParam}
        passSeason={payload.passSeason}
      />
    </div>
  );
}
