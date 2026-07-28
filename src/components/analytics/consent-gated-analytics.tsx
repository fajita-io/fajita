"use client";

import { Suspense } from "react";

import { DataFastScript } from "@/components/analytics/datafast-script";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { GoogleAnalyticsPageView } from "@/components/analytics/google-analytics-page-view";

/**
 * Product analytics (DataFast + GA4). Loads on every visit; optional cookies
 * can still be blocked through browser controls or recognized opt-out signals.
 */
export function ConsentGatedAnalytics() {
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
