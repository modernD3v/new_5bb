import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Join · Five Borough Boarders",
  description: "Join the Five Borough Boarders email list.",
};

export default function JoinPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-lg flex-1 px-5 py-16 sm:px-8">
        <h1 className="font-[family-name:var(--font-display)] text-5xl tracking-wide text-white">
          Join the crew
        </h1>
        <p className="mt-4 text-base leading-relaxed text-zinc-300">
          Email signup lands in Phase 4. For now, follow us on Instagram and
          check the Snow Board for this weekend&apos;s scores.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="https://www.instagram.com/5boroughboarders/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center justify-center rounded-md bg-[#7DD3FC] px-5 text-sm font-semibold text-[#0A0A0A] hover:bg-[#bae6fd]"
          >
            Instagram
          </a>
          <Link
            href="/board"
            className="inline-flex h-11 items-center justify-center rounded-md border border-white px-5 text-sm font-semibold text-white hover:bg-white/10"
          >
            This weekend&apos;s snow
          </Link>
        </div>
      </main>
    </>
  );
}
