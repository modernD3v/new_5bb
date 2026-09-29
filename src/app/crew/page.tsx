import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Crew · Five Borough Boarders",
  description:
    "Helping the snowboarding community in the 5 boroughs of NYC cut costs on travel and make new friends.",
};

export default function CrewPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12 sm:px-8">
        <p className="text-sm tracking-[0.18em] text-[#7DD3FC] uppercase">
          The crew
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl tracking-wide text-white sm:text-6xl">
          Five Borough Boarders
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-zinc-200">
          Helping the snowboarding community in the 5 boroughs of NYC cut costs
          on travel and make new friends.
        </p>
        <p className="mt-4 text-base leading-relaxed text-zinc-400">
          We&apos;re a NYC snowboarding community — about 1,200 strong on
          Instagram — organizing trips, carpools, and hangouts so riders across
          the five boroughs can get to the mountains together.
        </p>
        <p className="mt-8">
          <a
            href="https://www.instagram.com/5boroughboarders/"
            target="_blank"
            rel="noreferrer"
            className="text-[#7DD3FC] underline underline-offset-4 hover:text-sky-200"
          >
            @5boroughboarders on Instagram
          </a>
        </p>

        <section className="mt-16 border-t border-zinc-800 pt-8">
          <h2 className="text-sm font-medium tracking-wide text-zinc-400 uppercase">
            Photo credits
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Home hero —{" "}
            <a
              href="https://www.pexels.com/photo/snowboarder-in-mid-air-at-laax-swiss-alps-30310305/"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-200 underline decoration-zinc-600 underline-offset-2 hover:text-white"
            >
              Esther Höfling
            </a>
            {" · "}
            <a
              href="https://www.instagram.com/stlng.vsl"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-200 underline decoration-zinc-600 underline-offset-2 hover:text-white"
            >
              @stlng.vsl
            </a>
            {" · "}
            Laax, Swiss Alps (Pexels).
          </p>
        </section>

        <p className="mt-12 text-sm text-zinc-500">
          <Link href="/join" className="text-[#7DD3FC] hover:underline">
            Join the crew
          </Link>
          {" · "}
          <Link href="/board" className="text-[#7DD3FC] hover:underline">
            This weekend&apos;s snow
          </Link>
        </p>
      </main>
    </>
  );
}
