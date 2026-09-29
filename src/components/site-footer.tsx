import Link from "next/link";
import { INSTAGRAM_URL } from "@/lib/seo";

const footerLinks = [
  { href: "/board", label: "Snow Board" },
  { href: "/crew", label: "Crew" },
  { href: "/join", label: "Join" },
  { href: "/faq", label: "FAQ" },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-zinc-800 bg-[#0A0A0A]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm text-zinc-400">
          © {new Date().getFullYear()} Five Borough Boarders
        </p>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-4 gap-y-2">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-zinc-300 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7DD3FC]"
            >
              {link.label}
            </Link>
          ))}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-zinc-300 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7DD3FC]"
          >
            Instagram
          </a>
        </nav>
      </div>
    </footer>
  );
}
