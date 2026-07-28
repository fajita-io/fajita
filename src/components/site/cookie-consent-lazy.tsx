"use client";

import dynamic from "next/dynamic";

const CookieConsentBanner = dynamic(
  () =>
    import("@/components/site/cookie-consent-banner").then(
      (m) => m.CookieConsentBanner,
    ),
  { ssr: false },
);

export function CookieConsentLazy() {
  return <CookieConsentBanner />;
}
