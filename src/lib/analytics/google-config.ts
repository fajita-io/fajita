/**
 * Google Analytics configuration for fajita.io.
 * Measurement ID is safe to expose in the browser.
 */
export const googleAnalyticsConfig = {
  measurementId:
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-6G1L4QF863",
} as const;
