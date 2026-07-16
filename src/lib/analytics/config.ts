/**
 * DataFast configuration for fajita.io.
 * Public website ID and domain are safe to expose in the browser.
 */
export const datafastConfig = {
  websiteId:
    process.env.NEXT_PUBLIC_DATAFAST_WEBSITE_ID ?? "dfid_xLc2ttRXakQUhrp4aV9xj",
  domain: process.env.NEXT_PUBLIC_DATAFAST_DOMAIN ?? "fajita.io",
  scriptSrc: "https://datafa.st/js/script.js",
  allowLocalhost: process.env.NODE_ENV === "development",
} as const;

export const DATAFAST_VISITOR_COOKIE = "datafast_visitor_id";
export const DATAFAST_SESSION_COOKIE = "datafast_session_id";
