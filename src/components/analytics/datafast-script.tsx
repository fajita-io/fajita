import Script from "next/script";

import { datafastConfig } from "@/lib/analytics/config";

/**
 * DataFast pageview tracking + goal queue.
 * Mount once in the root layout `<head>`.
 */
export function DataFastScript() {
  const { websiteId, domain, scriptSrc, allowLocalhost } = datafastConfig;

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
        defer
        src={scriptSrc}
        data-website-id={websiteId}
        data-domain={domain}
        {...(allowLocalhost ? { "data-allow-localhost": "true" } : {})}
        strategy="afterInteractive"
      />
    </>
  );
}
