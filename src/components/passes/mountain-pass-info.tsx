import {
  PASS_BADGE_STYLES,
  PASS_LABELS,
  PASS_RESORT_URLS,
  SKI_PASSES,
  type MountainPassInfo,
} from "@/lib/passes/config";
import { formatSeasonDate } from "@/lib/season/status";

export function passSummarySentence(
  mountainName: string,
  passes: MountainPassInfo[],
  season: string,
): string {
  if (passes.length === 0) {
    return `${mountainName} isn't on the Epic, Ikon or Indy pass for the ${season} season. Buy a season pass or lift tickets from the resort.`;
  }
  const names = passes.map((p) => `${PASS_LABELS[p.pass]} Pass`);
  const list =
    names.length === 1
      ? names[0]
      : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  return `${mountainName} is on the ${list} for the ${season} season.`;
}

function latestVerified(passes: MountainPassInfo[]): string | null {
  return passes.reduce<string | null>(
    (acc, p) => (p.verifiedAt && (!acc || p.verifiedAt > acc) ? p.verifiedAt : acc),
    null,
  );
}

/** Server-rendered so pass access is in the page HTML for search engines. */
export function MountainPassInfoSection({
  mountainName,
  passes,
  season,
}: {
  mountainName: string;
  passes: MountainPassInfo[];
  season: string;
}) {
  const verified = latestVerified(passes);
  return (
    <section aria-labelledby="passes-heading" className="space-y-2">
      <h2
        id="passes-heading"
        className="text-sm font-medium tracking-wide text-sky-300 uppercase"
      >
        Ski passes {season}
      </h2>
      <p className="text-sm text-zinc-300">
        {passSummarySentence(mountainName, passes, season)}
      </p>
      {passes.length > 0 && (
        <ul className="space-y-1.5">
          {passes.map((p) => (
            <li key={p.pass} className="flex flex-wrap items-center gap-2 text-sm">
              <span
                className={`rounded px-1.5 py-0.5 text-[11px] leading-none font-bold tracking-wide uppercase ${PASS_BADGE_STYLES[p.pass]}`}
              >
                {PASS_LABELS[p.pass]}
              </span>
              <span className="text-zinc-200">{p.tierNote ?? "Included"}</span>
              {p.sourceUrl && (
                <a
                  href={p.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-sky-400 underline"
                >
                  Source
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
      {verified && (
        <p className="text-xs text-zinc-500">
          Verified {formatSeasonDate(verified, true)}. Always confirm with the
          pass before you go:{" "}
          {SKI_PASSES.map((p, i) => (
            <span key={p}>
              {i > 0 && " · "}
              <a
                href={PASS_RESORT_URLS[p]}
                target="_blank"
                rel="noreferrer"
                className="text-sky-400 underline"
              >
                {PASS_LABELS[p]}
              </a>
            </span>
          ))}
        </p>
      )}
    </section>
  );
}
