import {
  NextResponse,
  type NextFetchEvent,
  type NextRequest,
} from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { trackAICrawlerRequest } from "@datafast/ai-crawl";

import { datafastConfig } from "@/lib/analytics/config";
import { STATUS_PAGE_ZONE } from "@/lib/status-pages/config";

/**
 * Protected surfaces. Everything under /app (the authenticated product) and
 * /internal (Brand Lab, App Lab) requires a signed-in session. Marketing,
 * auth, and public API routes stay open; API authorization is enforced inside
 * each route handler, not here.
 */
const isProtectedRoute = createRouteMatcher(["/app(.*)", "/internal(.*)"]);

/** Webhooks and auth callbacks must stay public; handlers verify signatures. */
const isPublicRoute = createRouteMatcher([
  "/login(.*)",
  "/signup(.*)",
  "/auth(.*)",
  "/forgot-password(.*)",
  "/verify-email(.*)",
  "/api/webhooks(.*)",
  "/api/ref(.*)",
  "/billing/checkout(.*)",
]);

const APP_HOST = (process.env.NEXT_PUBLIC_APP_URL ?? "https://fajita.io")
  .replace(/^https?:\/\//, "")
  .replace(/\/.*$/, "")
  .toLowerCase();

/** Hostnames that always serve the marketing/app shell (never status rewrites). */
const PLATFORM_HOSTS = new Set([
  "fajita.io",
  "www.fajita.io",
  "localhost",
  "127.0.0.1",
]);

/**
 * Resolve status-page host routing. Requests on a hosted subdomain
 * (<slug>.status.fajita.io) rewrite to /status/<slug>; requests on a verified
 * custom domain rewrite to the host resolver. The primary app/marketing host
 * and local/preview hosts are never rewritten. Returns null when no rewrite
 * applies.
 */
function statusHostRewrite(request: NextRequest): URL | null {
  const host = (request.headers.get("host") ?? "").split(":")[0].toLowerCase();
  if (!host) return null;

  const path = request.nextUrl.pathname;
  // Never touch platform paths or the status routes themselves.
  if (
    path.startsWith("/api") ||
    path.startsWith("/_next") ||
    path.startsWith("/status") ||
    path.startsWith("/_status-host") ||
    path.startsWith("/app") ||
    path.startsWith("/internal")
  ) {
    return null;
  }

  const isPrimary =
    PLATFORM_HOSTS.has(host) ||
    host === APP_HOST ||
    host === `www.${APP_HOST}` ||
    host.endsWith(".vercel.app");
  if (isPrimary) return null;

  const url = request.nextUrl.clone();

  // Hosted subdomain: <slug>.status.fajita.io
  if (host.endsWith(`.${STATUS_PAGE_ZONE}`)) {
    const slug = host.slice(0, host.length - STATUS_PAGE_ZONE.length - 1);
    if (!slug || slug.includes(".")) return null;
    url.pathname = `/status/${slug}${path === "/" ? "" : path}`;
    return url;
  }

  // Custom domain: route to the host resolver.
  url.pathname = `/_status-host/${encodeURIComponent(host)}${path === "/" ? "" : path}`;
  return url;
}

/**
 * Detect an affiliate referral navigation and build the redirect to the referral
 * endpoint. Returns null when the request is not an eligible top-level referral
 * visit on the primary host.
 */
function referralCapture(request: NextRequest): URL | null {
  if (request.method !== "GET") return null;
  const ref = request.nextUrl.searchParams.get("ref");
  if (!ref) return null;

  const path = request.nextUrl.pathname;
  if (
    path.startsWith("/api") ||
    path.startsWith("/_next") ||
    path.startsWith("/app") ||
    path.startsWith("/internal") ||
    path.startsWith("/status") ||
    path.startsWith("/_status-host")
  ) {
    return null;
  }

  // Only top-level document navigations qualify (anti cookie-stuffing).
  const secFetchDest = request.headers.get("sec-fetch-dest");
  if (secFetchDest && secFetchDest !== "document") return null;

  const url = request.nextUrl.clone();
  url.pathname = "/api/ref";
  const campaign = request.nextUrl.searchParams.get("fjc");
  url.search = "";
  url.searchParams.set("ref", ref);
  if (campaign) url.searchParams.set("fjc", campaign);
  url.searchParams.set("to", path);
  return url;
}

export default clerkMiddleware(
  async (auth, request: NextRequest, event: NextFetchEvent) => {
    // AI-crawler analytics for content routes only (not API/webhooks).
    if (!request.nextUrl.pathname.startsWith("/api")) {
      trackAICrawlerRequest(request, event, {
        websiteId: datafastConfig.websiteId,
        ...(process.env.DATAFAST_BOT_TOKEN
          ? { authToken: process.env.DATAFAST_BOT_TOKEN }
          : {}),
      });
    }

    const rewrite = statusHostRewrite(request);
    if (rewrite) {
      return NextResponse.rewrite(rewrite);
    }

    // Affiliate referral capture. A top-level navigation carrying `?ref=` on a
    // public marketing path is redirected to the referral endpoint, which
    // records attribution server-side, sets the signed first-party cookie, and
    // sends the visitor on to a clean, allowlisted destination (stripping the
    // referral params from the visible URL). Only document navigations qualify,
    // which blocks cookie stuffing via subresource requests.
    const referralRedirect = referralCapture(request);
    if (referralRedirect) {
      return NextResponse.redirect(referralRedirect);
    }

    if (isProtectedRoute(request) && !isPublicRoute(request)) {
      await auth.protect();
    }

    return NextResponse.next();
  },
);

export const config = {
  matcher: [
    // Run on everything except Next internals and static asset files, so
    // Clerk's auth() works in routes and robots.txt/llms.txt stay reachable.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|ttf|woff2?)).*)",
    "/(api|trpc)(.*)",
  ],
};
