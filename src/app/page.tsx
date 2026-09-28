import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#7dd3fc33,_transparent_55%),linear-gradient(180deg,_#0a0a0a_0%,_#111827_100%)]"
      />
      <div className="relative z-10 mx-auto max-w-lg space-y-6">
        <p className="text-sm font-medium tracking-[0.2em] text-sky-300 uppercase">
          NYC · Snow · Crew
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          5 Borough Boarders
        </h1>
        <p className="text-base leading-relaxed text-zinc-300">
          Helping snowboarders in the five boroughs cut travel costs and make
          new friends.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/board"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-sky-300 px-4 text-sm font-medium text-zinc-950 transition hover:bg-sky-200"
          >
            Open Snow Board
          </Link>
          <a
            className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-600 px-4 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800"
            href="https://www.instagram.com/5boroughboarders/"
            target="_blank"
            rel="noreferrer"
          >
            Instagram
          </a>
        </div>
      </div>
    </main>
  );
}
