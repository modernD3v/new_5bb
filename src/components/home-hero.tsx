/**
 * Full-bleed home hero with art-directed Retina srcsets.
 * Gradient: bottom 40% transparent → #0A0A0A at ~85%; top nav scrim.
 */
import Link from "next/link";

export function HomeHero() {
  return (
    <section className="relative isolate min-h-[100svh] w-full overflow-hidden bg-[#0A0A0A] text-white">
      <picture className="absolute inset-0 block">
        <source
          media="(max-width: 767px)"
          type="image/webp"
          srcSet="/images/hero-mobile-828.webp 828w, /images/hero-mobile-1242.webp 1242w, /images/hero-mobile-1787.webp 1787w"
          sizes="100vw"
        />
        <source
          media="(max-width: 767px)"
          type="image/jpeg"
          srcSet="/images/hero-mobile-1242.jpg"
        />
        <source
          type="image/webp"
          srcSet="/images/hero-desktop-1920.webp 1920w, /images/hero-desktop-2880.webp 2880w, /images/hero-desktop-3840.webp 3840w"
          sizes="100vw"
        />
        <img
          src="/images/hero-desktop-1920.jpg"
          alt="Snowboarder mid-air above a terrain park in the Alps"
          width={1920}
          height={1280}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-[50%_50%] md:object-[50%_40%] hero-zoom"
        />
      </picture>

      {/* Top scrim behind nav */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-40"
        style={{
          background:
            "linear-gradient(to bottom, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0) 100%)",
        }}
      />

      {/* Bottom 40% dark gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[40%]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(10,10,10,0) 0%, #0A0A0A 85%)",
        }}
      />

      <div className="relative z-20 flex min-h-[100svh] flex-col justify-end px-5 pb-16 pt-28 sm:px-8 sm:pb-20 lg:px-12">
        <div className="hero-rise max-w-xl">
          <h1 className="font-[family-name:var(--font-display)] text-5xl leading-[0.95] tracking-wide text-white sm:text-6xl md:text-7xl">
            Five Borough Boarders
          </h1>
          <p className="mt-4 max-w-md text-lg leading-snug text-white sm:text-xl">
            We love snowboarding. Join us!
          </p>
          <div className="hero-rise-delay mt-7 flex flex-wrap gap-3">
            <Link
              href="/board"
              className="inline-flex h-11 items-center justify-center rounded-md bg-[#7DD3FC] px-5 text-[15px] font-semibold text-[#0A0A0A] transition hover:bg-[#bae6fd] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              This weekend&apos;s snow
            </Link>
            <Link
              href="/join"
              className="inline-flex h-11 items-center justify-center rounded-md border border-white bg-transparent px-5 text-[15px] font-semibold text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7DD3FC]"
            >
              Join the crew
            </Link>
          </div>
        </div>
      </div>

      <p className="absolute right-4 bottom-4 z-20 text-[12px] leading-none text-white/60 sm:right-6 sm:bottom-5">
        Photo:{" "}
        <a
          href="https://www.pexels.com/photo/snowboarder-in-mid-air-at-laax-swiss-alps-30310305/"
          target="_blank"
          rel="noreferrer"
          className="underline decoration-white/40 underline-offset-2 transition hover:text-white/80 hover:decoration-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7DD3FC]"
        >
          Esther Höfling
        </a>
        <span className="sr-only"> on Pexels</span>
        <span aria-hidden className="mx-1.5 text-white/35">
          ·
        </span>
        <a
          href="https://www.instagram.com/stlng.vsl"
          target="_blank"
          rel="noreferrer"
          className="underline decoration-white/40 underline-offset-2 transition hover:text-white/80 hover:decoration-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7DD3FC]"
        >
          Instagram
        </a>
      </p>
    </section>
  );
}
