import type { DayForecastSummary } from "@/lib/snow/extract";

function dayName(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y!, m! - 1, d!, 17));
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "America/New_York",
  }).format(dt);
}

export function ForecastStrip({ days }: { days: DayForecastSummary[] }) {
  if (days.length === 0) {
    return (
      <p className="text-sm text-zinc-400">No outdoor forecast (indoor).</p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {days.map((d) => (
        <div
          key={d.date}
          className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-3 text-center"
        >
          <div className="text-xs font-medium tracking-wide text-sky-300 uppercase">
            {dayName(d.date)}
          </div>
          <div className="mt-2 text-sm text-white">
            {d.snowIn > 0 ? `${d.snowIn.toFixed(1)}" snow` : "No snow"}
          </div>
          <div className="text-xs text-zinc-400">
            {d.rainIn > 0 ? `${d.rainIn.toFixed(1)}" rain` : "Dry"}
          </div>
          <div className="mt-1 text-xs text-zinc-300">
            {d.highF != null && d.lowF != null
              ? `${Math.round(d.highF)}° / ${Math.round(d.lowF)}°`
              : "—"}
          </div>
          <div className="text-xs text-zinc-500">
            Gust{" "}
            {d.maxGustMph != null ? `${Math.round(d.maxGustMph)} mph` : "—"}
          </div>
        </div>
      ))}
    </div>
  );
}
