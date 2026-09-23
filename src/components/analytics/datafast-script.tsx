import Script from "next/script";

import { datafastConfig } from "@/lib/analytics/config";

/**
 * DataFast pageview tracking + goal queue.
 * Loads through a same-origin /datafast/* proxy so ad blockers cannot drop
 * the pixel or event XHR (mirrors Adventure / DataFast Next.js docs).
 * Mount once in the root layout.
 */
export function DataFastScript() {
  const { websiteId, domain, allowLocalhost } = datafastConfig;

  if (!websiteId || !domain) {
    return null;
  }

  return (
    <>
      <Script id="datafast-queue" strategy="beforeInteractive">
        {`
          window.datafast = window.datafast || function() {
            (window.datafast.q = window.datafast.q || []).push(arguments);
          };
        `}
      </Script>
      <Script
        id="datafast-pixel"
        src="/datafast/script.js"
        data-api-url="/datafast/events"
        data-website-id={websiteId}
        data-domain={domain}
        {...(allowLocalhost ? { "data-allow-localhost": "true" } : {})}
        strategy="afterInteractive"
      />
    </>
  );
}
