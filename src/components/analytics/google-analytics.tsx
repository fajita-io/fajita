import Script from "next/script";

import { googleAnalyticsConfig } from "@/lib/analytics/google-config";

/**
 * Google Analytics (gtag.js). Mount once in the root layout `<head>`.
 */
export function GoogleAnalytics() {
  const { measurementId } = googleAnalyticsConfig;

  if (!measurementId) {
    return null;
  }

  return (
    <>
      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  );
}
