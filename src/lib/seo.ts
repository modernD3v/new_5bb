import type { Metadata } from "next";
import { isShopEnabled } from "@/lib/flags";

export const SITE_NAME = "Five Borough Boarders";

export const DEFAULT_DESCRIPTION =
  "Five Borough Boarders is a NYC snowboarding community helping riders in all five boroughs cut travel costs, share rides and make new friends.";

export const DEFAULT_OG_IMAGE = "/brand/logo-badge-1024.png";

export const INSTAGRAM_URL = "https://www.instagram.com/5boroughboarders";

/** Absolute site origin (no trailing slash). */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export function isProductionDeploy(): boolean {
  return process.env.VERCEL_ENV === "production";
}

export function absoluteUrl(path = "/"): string {
  const base = getSiteUrl();
  if (!path || path === "/") return `${base}/`;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

type BuildMetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  /** When true, omit the "| Five Borough Boarders" template (home only). */
  absoluteTitle?: boolean;
};

/**
 * Shared Next.js Metadata for every public page.
 * Canonical, Open Graph, Twitter card, and preview noindex.
 */
export function buildMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  absoluteTitle = false,
}: BuildMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = image.startsWith("http") ? image : absoluteUrl(image);
  const production = isProductionDeploy();

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: absoluteTitle ? title : `${title} | ${SITE_NAME}`,
      description,
      url,
      images: [{ url: imageUrl, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: absoluteTitle ? title : `${title} | ${SITE_NAME}`,
      description,
      images: [imageUrl],
    },
    robots: production
      ? { index: true, follow: true }
      : { index: false, follow: false },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    logo: absoluteUrl(DEFAULT_OG_IMAGE),
    sameAs: [INSTAGRAM_URL],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    description: DEFAULT_DESCRIPTION,
    publisher: { "@type": "Organization", name: SITE_NAME },
  };
}

export function skiResortJsonLd(input: {
  name: string;
  lat: number;
  lon: number;
  websiteUrl: string | null;
  description?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SkiResort",
    name: input.name,
    url: input.websiteUrl ?? undefined,
    description: input.description,
    geo: {
      "@type": "GeoCoordinates",
      latitude: input.lat,
      longitude: input.lon,
    },
  };
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqPageJsonLd(
  faqs: { question: string; answer: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/** Phase 3 /trips helper — one Event per upcoming trip. */
export function tripEventJsonLd(input: {
  name: string;
  startDate: string;
  locationText: string | null;
  partifulUrl: string | null;
  description?: string | null;
  path?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: input.name,
    startDate: input.startDate,
    description: input.description ?? undefined,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: input.locationText
      ? { "@type": "Place", name: input.locationText }
      : undefined,
    offers: input.partifulUrl
      ? {
          "@type": "Offer",
          url: input.partifulUrl,
          availability: "https://schema.org/InStock",
        }
      : undefined,
    url: input.path ? absoluteUrl(input.path) : undefined,
    organizer: {
      "@type": "Organization",
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
  };
}

/** Paths disallowed in production robots (member / admin / gated shop). */
export function robotsDisallowPaths(): string[] {
  const paths = ["/admin", "/api", "/profile", "/rides"];
  if (!isShopEnabled()) paths.push("/shop");
  return paths;
}
