import Image from "next/image";
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
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
        >
          <Image
            src="/brand/logo-badge.svg"
            alt="Five Borough Boarders"
            width={40}
            height={40}
            priority
            className="size-9 sm:size-10"
          />
          <span className="sr-only sm:not-sr-only sm:text-sm sm:font-semibold sm:tracking-wide sm:text-white">
            Five Borough Boarders
          </span>
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-1 sm:gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-2.5 py-1.5 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
