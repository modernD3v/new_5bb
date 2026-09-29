import { HomeHero } from "@/components/home-hero";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <>
      <SiteHeader transparent />
      <main className="flex flex-1 flex-col">
        <HomeHero />
      </main>
    </>
  );
}
