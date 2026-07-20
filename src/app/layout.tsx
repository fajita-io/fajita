import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Suspense } from "react";

import { DataFastScript } from "@/components/analytics/datafast-script";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { GoogleAnalyticsPageView } from "@/components/analytics/google-analytics-page-view";
import {
  clerkSignInFallbackRedirectUrl,
  clerkSignInUrl,
  clerkSignUpFallbackRedirectUrl,
  clerkSignUpUrl,
} from "@/lib/auth/clerk-config";
import { clerkAppearance } from "@/lib/auth/clerk-appearance";
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
    "Fajita monitors your websites, APIs, certificates, and cron jobs. When something starts cooking, your team hears about it before your customers do.",
  alternates: { canonical: "/" },
  openGraph: {
    siteName: "Fajita",
    type: "website",
    url: siteUrl,
    title: "Fajita · Know when your software gets too hot",
    description:
      "Fajita monitors your websites, APIs, certificates, and cron jobs. When something starts cooking, your team hears about it before your customers do.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fajita · Know when your software gets too hot",
    description:
      "Uptime monitoring for websites, APIs, certificates, and cron jobs. Your team hears about it before your customers do.",
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
    <ClerkProvider
      appearance={clerkAppearance}
      signInUrl={clerkSignInUrl}
      signUpUrl={clerkSignUpUrl}
      signInFallbackRedirectUrl={clerkSignInFallbackRedirectUrl}
      signUpFallbackRedirectUrl={clerkSignUpFallbackRedirectUrl}
    >
      <html lang="en" className={fontVariables} suppressHydrationWarning>
        <head>
          <GoogleAnalytics />
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
          <Suspense fallback={null}>
            <GoogleAnalyticsPageView />
          </Suspense>
          <DataFastScript />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
