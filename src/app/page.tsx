import type { Metadata } from "next";
import { HomeHero } from "@/components/home-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { DEFAULT_DESCRIPTION, SITE_NAME, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: SITE_NAME,
  description: DEFAULT_DESCRIPTION,
  path: "/",
  absoluteTitle: true,
  image: "/images/hero-desktop-1920.jpg",
});

export default function Home() {
  return (
    <>
      {/* Preload desktop Retina webp set for LCP (art-directed <picture> below) */}
      <link
        rel="preload"
        as="image"
        type="image/webp"
        imageSrcSet="/images/hero-desktop-1920.webp 1920w, /images/hero-desktop-2880.webp 2880w, /images/hero-desktop-3840.webp 3840w"
        imageSizes="100vw"
        media="(min-width: 768px)"
      />
      <SiteHeader transparent />
      <main className="flex flex-1 flex-col">
        <HomeHero />
      </main>
      <SiteFooter />
    </>
  );
}
