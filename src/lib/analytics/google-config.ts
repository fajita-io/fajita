/**
 * Google Analytics configuration for fajita.io.
 * Measurement ID is safe to expose in the browser.
 * Disabled by default in self-hosted mode unless FAJITA_ANALYTICS_ENABLED=1.
 */
import { deploymentConfig } from "@/lib/deployment/config";

export const googleAnalyticsConfig = {
  measurementId: deploymentConfig().analyticsEnabled
    ? (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? "")
    : "",
} as const;
