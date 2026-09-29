import type { MetadataRoute } from "next";
import {
  absoluteUrl,
  isProductionDeploy,
  robotsDisallowPaths,
} from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  if (!isProductionDeploy()) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  const disallow = robotsDisallowPaths();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow,
      },
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow,
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow,
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow,
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow,
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
