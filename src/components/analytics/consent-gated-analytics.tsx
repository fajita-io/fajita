"use client";

import { Suspense } from "react";

import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { GoogleAnalyticsPageView } from "@/components/analytics/google-analytics-page-view";

/**
 * GA4 pageviews. DataFast loads from the root layout head on every visit.
 */
export function ConsentGatedAnalytics() {
  return (
    <>
      <GoogleAnalytics />
      <Suspense fallback={null}>
        <GoogleAnalyticsPageView />
      </Suspense>
    </>
  );
}
