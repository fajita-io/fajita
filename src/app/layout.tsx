import type { Metadata, Viewport } from "next";

import { ConsentGatedAnalyticsLazy } from "@/components/analytics/consent-gated-analytics-lazy";
import { ResourceHints } from "@/components/site/resource-hints";
import { fontVariables } from "@/lib/fonts";
import { themeInitScript } from "@/lib/theme/theme-script";

import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://fajita.io";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Fajita · Uptime monitoring and status pages",
    template: "%s · Fajita",
  },
  description:
    "Monitor websites, APIs, SSL certificates, cron jobs, and heartbeats. Verify failures, alert your team, and keep customers informed with Fajita.",
  alternates: { canonical: "/" },
  openGraph: {
    siteName: "Fajita",
    type: "website",
    url: siteUrl,
    title: "Your customers should not be your monitoring system.",
    description:
      "Fajita verifies outages, alerts your team, and publishes clear status updates before customers are left wondering.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Fajita. Know when your software gets too hot.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Your customers should not be your monitoring system.",
    description:
      "Fajita verifies outages, alerts your team, and publishes clear status updates before customers are left wondering.",
    images: ["/opengraph-image"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f3eb" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0c0b" },
  ],
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Fajita",
  url: siteUrl,
  logo: `${siteUrl}/brand/logos/fajita-mark.svg`,
  address: {
    "@type": "PostalAddress",
    streetAddress: "1001 S Main St, Ste 600",
    addressLocality: "Kalispell",
    addressRegion: "MT",
    postalCode: "59901",
    addressCountry: "US",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Fajita",
  url: siteUrl,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        <ResourceHints />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body>
        <ConsentGatedAnalyticsLazy />
        {children}
      </body>
    </html>
  );
}
