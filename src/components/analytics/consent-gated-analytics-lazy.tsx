"use client";

import dynamic from "next/dynamic";

const ConsentGatedAnalytics = dynamic(
  () =>
    import("./consent-gated-analytics").then((m) => m.ConsentGatedAnalytics),
  { ssr: false },
);

export function ConsentGatedAnalyticsLazy() {
  return <ConsentGatedAnalytics />;
}
