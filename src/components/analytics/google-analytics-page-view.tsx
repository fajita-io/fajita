"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { googleAnalyticsConfig } from "@/lib/analytics/google-config";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Sends GA4 page views on App Router client navigations.
 */
export function GoogleAnalyticsPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { measurementId } = googleAnalyticsConfig;

  useEffect(() => {
    if (!measurementId || !pathname) return;
    if (typeof window.gtag !== "function") return;

    const query = searchParams.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;

    window.gtag("config", measurementId, {
      page_path: pagePath,
    });
  }, [measurementId, pathname, searchParams]);

  return null;
}
