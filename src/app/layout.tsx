import type { Metadata } from "next";
import { Geist, Geist_Mono, Bebas_Neue } from "next/font/google";
import { JsonLd } from "@/components/seo/json-ld";
import {
  DEFAULT_DESCRIPTION,
  SITE_NAME,
  buildMetadata,
  getSiteUrl,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const display = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const rootMeta = buildMetadata({
  title: SITE_NAME,
  description: DEFAULT_DESCRIPTION,
  path: "/",
  absoluteTitle: true,
});

export const metadata: Metadata = {
  ...rootMeta,
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  icons: {
    icon: [{ url: "/favicon.ico" }],
    apple: [{ url: "/apple-icon.png" }],
  },
};

export const viewport = {
  themeColor: "#0A0A0A",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[#0A0A0A] text-white">
        {children}
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      </body>
    </html>
  );
}
