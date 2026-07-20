import type { NextConfig } from "next";

/** Dev/test Clerk instances (*.clerk.accounts.dev). */
const clerkDevHost = "https://*.clerk.accounts.dev";
/** Production Clerk custom domains (DNS-only CNAMEs on fajita.io). */
const clerkProductionFrontend = "https://clerk.fajita.io";
const clerkProductionAccounts = "https://accounts.fajita.io";
const datafastHost = "https://datafa.st";
const googleAnalyticsHost = "https://www.google-analytics.com";
const googleTagManagerHost = "https://www.googletagmanager.com";
const supabaseHost = "https://*.supabase.co";
const sentryHost = "https://*.ingest.sentry.io";

/**
 * Production security headers for marketing, auth, app, and API routes.
 * CSP allows Clerk, DataFast, Google Analytics, Supabase, and Sentry while blocking framing
 * and tightening defaults elsewhere.
 */
export function buildSecurityHeaders(): NonNullable<
  NextConfig["headers"]
> {
  const csp = [
    "default-src 'self'",
    [
      "script-src 'self' 'unsafe-inline'",
      datafastHost,
      googleTagManagerHost,
      clerkDevHost,
      clerkProductionFrontend,
      "https://challenges.cloudflare.com",
    ].join(" "),
    [
      "connect-src 'self'",
      datafastHost,
      googleAnalyticsHost,
      googleTagManagerHost,
      "https://analytics.google.com",
      "https://region1.google-analytics.com",
      clerkDevHost,
      clerkProductionFrontend,
      clerkProductionAccounts,
      supabaseHost,
      sentryHost,
      "https://*.clerk.com",
    ].join(" "),
    "img-src 'self' data: blob: https:",
    "style-src 'self' 'unsafe-inline'",
    [
      "font-src 'self' data:",
      clerkDevHost,
      clerkProductionFrontend,
    ].join(" "),
    [
      "frame-src 'self'",
      clerkDevHost,
      clerkProductionFrontend,
      clerkProductionAccounts,
      "https://challenges.cloudflare.com",
    ].join(" "),
    "object-src 'none'",
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join("; ");

  const shared = [
    { key: "Content-Security-Policy", value: csp },
    {
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), payment=()",
    },
    { key: "X-Frame-Options", value: "DENY" },
  ];

  return async () => [
    {
      source: "/:path*",
      headers: shared,
    },
  ];
}
