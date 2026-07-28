"use client";

import { Suspense, useEffect, useState } from "react";

import { DataFastScript } from "@/components/analytics/datafast-script";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { GoogleAnalyticsPageView } from "@/components/analytics/google-analytics-page-view";
import { CONSENT_UPDATED_EVENT } from "@/lib/consent/events";
import {
  CONSENT_COOKIE_NAME,
  analyticsConsentGranted,
  decodeConsent,
} from "@/lib/consent/preferences";

function readConsentCookie(): string | null {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${CONSENT_COOKIE_NAME}=`));
  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null;
}

/**
 * Loads GA and DataFast only after analytics consent. Keeps third-party
 * scripts off the critical path for first-time visitors who have not chosen.
 */
export function ConsentGatedAnalytics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const sync = () => setEnabled(analyticsConsentGranted(readConsentCookie()));
    sync();

    const onConsentUpdated = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      setEnabled(detail?.analytics === true);
    };

    window.addEventListener(CONSENT_UPDATED_EVENT, onConsentUpdated);
    return () =>
      window.removeEventListener(CONSENT_UPDATED_EVENT, onConsentUpdated);
  }, []);

  if (!enabled) return null;

  return (
    <>
      <GoogleAnalytics />
      <DataFastScript />
      <Suspense fallback={null}>
        <GoogleAnalyticsPageView />
      </Suspense>
    </>
  );
}
