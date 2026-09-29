import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { SiteHeader } from "@/components/site-header";
import { PassBadges } from "@/components/passes/pass-badges";
import { isAuthorizedAdmin } from "@/lib/admin/auth";
import { seasonSchema } from "@/lib/admin/mountain-form";
import {
  listMountainsForAdmin,
  listPassSeasons,
  resolvePassSeason,
} from "@/lib/db/passes";
import { getSeasonStatus, seasonLabelFor, seasonShortLabel } from "@/lib/season/status";
import { formatIsoDateNy } from "@/lib/snow/weekend";
import { copySeasonAction } from "./actions";
import { MountainSeasonForm } from "./mountain-season-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin: mountains · Five Borough Boarders",
  robots: { index: false, follow: false },
};

export default async function AdminMountainsPage({
  searchParams,
}: PageProps<"/admin/mountains">) {
  const h = await headers();
  if (!isAuthorizedAdmin(h.get("authorization"))) notFound();

  const query = await searchParams;
  const today = formatIsoDateNy(new Date());
  const currentSeason = seasonLabelFor(today);
  const requested = seasonSchema.safeParse(query.season);
  const season = requested.success
    ? requested.data
    : await resolvePassSeason(currentSeason);

  const [rows, seasons] = await Promise.all([
    listMountainsForAdmin(season),
    listPassSeasons(),
  ]);
  const seasonOptions = Array.from(new Set([currentSeason, season, ...seasons])).sort().reverse();
  const previousSeason = seasons.find((s) => s < season) ?? null;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 px-4 py-8">
        <div className="space-y-1">
          <p className="text-xs text-zinc-500">
            <Link href="/admin" className="hover:underline">
              Admin
            </Link>{" "}
            / Mountains
          </p>
          <h1 className="text-2xl font-bold">Mountains: passes and season dates</h1>
          <p className="text-sm text-zinc-400">
            Passes change every season. Check each one against the official
            pass site, paste the page URL as the source, and set the verified
            date. Opening and closing dates drive the off-season state on the
            board (no score before opening or after closing).
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-4 rounded-lg border border-zinc-800 p-4">
          <form method="get" className="flex items-end gap-2">
            <label className="space-y-1 text-xs text-zinc-400">
              <span>Pass season</span>
              <input
                name="season"
                list="season-options"
                defaultValue={season}
                pattern="\d{4}-\d{2}"
                className="w-28 rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-sm text-white"
              />
              <datalist id="season-options">
                {seasonOptions.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </label>
            <button
              type="submit"
              className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm hover:border-zinc-500"
            >
              Show
            </button>
          </form>

          {previousSeason && rows.every((m) => m.passes.length === 0) && (
            <form action={copySeasonAction} className="flex items-end gap-2">
              <input type="hidden" name="from" value={previousSeason} />
              <input type="hidden" name="to" value={season} />
              <button
                type="submit"
                className="rounded-md bg-sky-300 px-3 py-1.5 text-sm font-semibold text-zinc-950"
              >
                Start {season} from {previousSeason} passes
              </button>
            </form>
          )}

          {typeof query.copied === "string" && (
            <p role="status" className="text-sm text-green-400">
              Copied {query.copied} pass rows. Re-verify each one.
            </p>
          )}
          {query.error === "copy" && (
            <p role="status" className="text-sm text-red-400">
              Couldn&apos;t copy that season.
            </p>
          )}
        </div>

        <ul className="space-y-3">
          {rows.map((m) => {
            const status = getSeasonStatus({
              today,
              openingDate: m.openingDate,
              closingDate: m.closingDate,
              isIndoor: m.isIndoor,
            });
            return (
              <li key={m.id}>
                <details className="group rounded-lg border border-zinc-800 bg-zinc-900/40">
                  <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3">
                    <span className="font-medium">{m.name}</span>
                    <span className="text-xs text-zinc-500">{m.state}</span>
                    <PassBadges passes={m.passes} showNoPass />
                    <span className="ml-auto text-xs text-zinc-400">
                      {m.isIndoor ? "Indoor" : (seasonShortLabel(status) ?? "Open, scoring")}
                      {!m.active && " · inactive"}
                    </span>
                  </summary>
                  <div className="border-t border-zinc-800 px-4 py-4">
                    <MountainSeasonForm
                      mountain={{
                        id: m.id,
                        openingDate: m.openingDate,
                        closingDate: m.closingDate,
                        passes: m.passes,
                      }}
                      season={season}
                      today={today}
                    />
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      </main>
    </>
  );
}
