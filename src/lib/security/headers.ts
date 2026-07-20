import type { NextConfig } from "next";

const clerkHost = "https://*.clerk.accounts.dev";
const datafastHost = "https://datafa.st";
const supabaseHost = "https://*.supabase.co";
const sentryHost = "https://*.ingest.sentry.io";

/**
 * Production security headers for marketing, auth, app, and API routes.
 * CSP allows Clerk, DataFast, Supabase, and Sentry while blocking framing
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
      clerkHost,
      "https://challenges.cloudflare.com",
    ].join(" "),
    [
      "connect-src 'self'",
      datafastHost,
      clerkHost,
      supabaseHost,
      sentryHost,
      "https://*.clerk.com",
    ].join(" "),
    "img-src 'self' data: blob: https:",
    "style-src 'self' 'unsafe-inline'",
    [
      "font-src 'self' data:",
      clerkHost,
    ].join(" "),
    [
      "frame-src 'self'",
      clerkHost,
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
