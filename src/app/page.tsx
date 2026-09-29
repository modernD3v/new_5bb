import { HomeHero } from "@/components/home-hero";
import { SiteHeader } from "@/components/site-header";

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
    </>
  );
}
