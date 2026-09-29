import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { JsonLd } from "@/components/seo/json-ld";
import { buildMetadata, faqPageJsonLd } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "FAQ",
  description:
    "Answers about Five Borough Boarders — joining, NYC mountain access, snow scores, Catch a Ride, and Big Snow.",
  path: "/faq",
});

const faqs: { question: string; answer: string }[] = [
  {
    question: "What is Five Borough Boarders?",
    answer:
      "Five Borough Boarders is a NYC snowboarding community for riders across Manhattan, Brooklyn, Queens, the Bronx, and Staten Island. We help people cut travel costs, share rides, find weekend snow, and make new friends. The website is the community home base for the Snow Board map, trips, rides, and joining the email list.",
  },
  {
    question: "How do I join?",
    answer:
      "Start on the Join page to get on the email list so you are not dependent on Instagram alone. You can also follow @5boroughboarders on Instagram for trip posts and hangouts. Full member accounts (check-ins, posts, Catch a Ride) land with Auth.js in a later phase of the site build.",
  },
  {
    question: "Which mountains can I reach from NYC?",
    answer:
      "The Snow Board tracks the mountains NYC riders commonly drive to, including Hunter, Windham, Belleayre, Mountain Creek, Camelback, Blue Mountain, Mount Snow, Stratton, Killington, and indoor Big Snow at American Dream. Each mountain page notes drive time context from Midtown where we have it. Admins can add more mountains later.",
  },
  {
    question: "What's the cheapest way to go snowboarding from NYC?",
    answer:
      // TODO(owner): Confirm current bus/train options, operators, and ballpark round-trip prices before publishing specific numbers.
      "The cheapest trips usually combine a carpool (Catch a Ride when it launches) or a shared day-bus with an early start and a mountain that is closer to the city. Indoor Big Snow can be cheaper for a short session without a long drive. Check the weekend snow score first so you do not spend travel money on a skippable forecast.",
  },
  {
    question: "How does Catch a Ride work, and is it safe?",
    answer:
      "Catch a Ride is a members-only carpool board: drivers offer seats toward a mountain and date; riders request a seat with a short message. Contact details stay private until a driver accepts, and both sides only see handles after acceptance. Safety guidelines, an 18+ ride checkbox, and report tools are part of the design so the community can keep rides respectful.",
  },
  {
    question: "How is the weekend snow score calculated?",
    answer:
      "Outdoor mountains get a 1–10 score from Open-Meteo forecasts: recent snow since Wednesday, weekend snowfall, daytime temps, rain, cold nights for snowmaking, and wind gusts. The score is forecast-based — it does not know trail counts or base depth — so always check the resort before you go. Scores refresh on demand with about a 40-minute freshness window.",
  },
  {
    question: "Is Big Snow worth it?",
    answer:
      // TODO(owner): Confirm ticket/price ranges and best-use cases (practice vs full day) from lived community experience.
      "Big Snow American Dream is the indoor mountain in our list — always open regardless of outdoor weather, so it skips the outdoor weekend score. It is a solid option for practice, short sessions, or days when the outdoor forecast is a skip. For a full alpine day with real terrain, outdoor Catskills / Poconos / Vermont mountains are still what most of the crew plans around.",
  },
];

export default function FaqPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12 sm:px-8">
        <h1 className="font-[family-name:var(--font-display)] text-5xl tracking-wide text-white">
          FAQ
        </h1>
        <p className="mt-4 text-base leading-relaxed text-zinc-300">
          Straight answers about Five Borough Boarders, weekend snow, and getting
          to the mountains from NYC.
        </p>

        <div className="mt-10 space-y-8">
          {faqs.map((faq) => (
            <section key={faq.question}>
              <h2 className="text-lg font-semibold text-white">
                {faq.question}
              </h2>
              <p className="mt-2 text-base leading-relaxed text-zinc-300">
                {faq.answer}
              </p>
            </section>
          ))}
        </div>

        <p className="mt-12 text-sm text-zinc-500">
          More context on the{" "}
          <Link href="/crew" className="text-[#7DD3FC] hover:underline">
            Crew
          </Link>{" "}
          page, or{" "}
          <Link href="/join" className="text-[#7DD3FC] hover:underline">
            join the email list
          </Link>
          .
        </p>
      </main>
      <SiteFooter />
      <JsonLd data={faqPageJsonLd(faqs)} />
    </>
  );
}
