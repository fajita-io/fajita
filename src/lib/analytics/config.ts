/**
 * DataFast configuration for fajita.io.
 * Public website ID and domain are safe to expose in the browser.
 * Disabled by default in self-hosted mode unless FAJITA_ANALYTICS_ENABLED=1.
 */
import { deploymentConfig } from "@/lib/deployment/config";

const analyticsOn = deploymentConfig().analyticsEnabled;

export const datafastConfig = {
  websiteId: analyticsOn
    ? (process.env.NEXT_PUBLIC_DATAFAST_WEBSITE_ID?.trim() ?? "")
    : "",
  domain: analyticsOn
    ? (process.env.NEXT_PUBLIC_DATAFAST_DOMAIN?.trim() ?? "")
    : "",
  scriptSrc: "https://datafa.st/js/script.js",
  allowLocalhost: process.env.NODE_ENV === "development",
} as const;

export const DATAFAST_VISITOR_COOKIE = "datafast_visitor_id";
export const DATAFAST_SESSION_COOKIE = "datafast_session_id";
