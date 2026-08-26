import Script from "next/script";

import { datafastConfig } from "@/lib/analytics/config";

/**
 * DataFast pageview tracking + goal queue.
 * Mount once in the root layout `<head>` with afterInteractive (DataFast docs).
 */
export function DataFastScript() {
  const { websiteId, domain, scriptSrc, allowLocalhost } = datafastConfig;

  if (!websiteId || !domain) {
    return null;
  }

  return (
    <>
      <Script id="datafast-queue" strategy="afterInteractive">
        {`
          window.datafast = window.datafast || function() {
            (window.datafast.q = window.datafast.q || []).push(arguments);
          };
        `}
      </Script>
      <Script
        src={scriptSrc}
        data-website-id={websiteId}
        data-domain={domain}
        {...(allowLocalhost ? { "data-allow-localhost": "true" } : {})}
        strategy="afterInteractive"
      />
    </>
  );
}
