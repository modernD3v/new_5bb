import Link from "next/link";

const links = [
  { href: "/board", label: "Board" },
  { href: "/crew", label: "Crew" },
  { href: "/join", label: "Join" },
] as const;

export function SiteHeader({ transparent = false }: { transparent?: boolean }) {
  return (
    <header
      className={
        transparent
          ? "absolute inset-x-0 top-0 z-30"
          : "border-b border-zinc-800 bg-[#0A0A0A]"
      }
    >
      <div className="mx-auto flex min-h-14 max-w-6xl items-center justify-between gap-4 px-4 py-2 sm:min-h-16 sm:px-6 md:min-h-[4.5rem]">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7DD3FC]"
        >
          {/* Real traced badge — plain img avoids next/image re-encode of SVG */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logo-badge.svg"
            alt=""
            width={56}
            height={56}
            className="h-11 w-11 shrink-0 md:h-14 md:w-14"
            decoding="async"
          />
          {/* Hide wordmark under 640px so badge + Board/Crew/Join stay one row */}
          <span className="sr-only sm:not-sr-only sm:inline sm:text-[15px] sm:font-medium sm:tracking-wide sm:text-white md:text-base">
            Five Borough Boarders
          </span>
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-1 sm:gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-2.5 py-1.5 text-[15px] font-medium text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7DD3FC]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
