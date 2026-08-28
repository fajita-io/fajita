import {
  NextResponse,
  type NextFetchEvent,
  type NextRequest,
} from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { trackAICrawlerRequest } from "@datafast/ai-crawl";

import { datafastConfig } from "@/lib/analytics/config";
import { platformHosts, primaryAppHost } from "@/lib/deployment/config";
import { STATUS_PAGE_ZONE } from "@/lib/status-pages/config";

/**
 * Protected surfaces. Everything under /app (the authenticated product)
 * requires a signed-in session. Marketing, auth, and public API routes stay
 * open; API authorization is enforced inside each route handler, not here.
 */
const isProtectedRoute = createRouteMatcher(["/app(.*)"]);

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

/**
 * Routes that need Clerk session handling. Marketing, docs, blog, glossary,
 * status pages, and most public APIs skip Clerk entirely so HTML can cache at
 * the edge without auth middleware overhead.
 */
const needsClerk = createRouteMatcher([
  "/app(.*)",
  "/login(.*)",
  "/signup(.*)",
  "/auth(.*)",
  "/forgot-password(.*)",
  "/verify-email(.*)",
  "/billing(.*)",
  "/affiliate(.*)",
  "/api/support(.*)",
]);

/** Hostnames that always serve the marketing/app shell (never status rewrites). */
const PLATFORM_HOSTS = platformHosts();

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
    path.startsWith("/app")
  ) {
    return null;
  }

  const appHost = primaryAppHost();
  const isPrimary =
    PLATFORM_HOSTS.has(host) ||
    host === appHost ||
    host === `www.${appHost}` ||
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

function runSharedMiddleware(
  request: NextRequest,
  event: NextFetchEvent,
): NextResponse | null {
  const pathname = request.nextUrl.pathname;

  if (!pathname.startsWith("/api") && datafastConfig.websiteId) {
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

  const referralRedirect = referralCapture(request);
  if (referralRedirect) {
    return NextResponse.redirect(referralRedirect);
  }

  return null;
}

const clerkHandler = clerkMiddleware(
  async (auth, request: NextRequest, event: NextFetchEvent) => {
    const shared = runSharedMiddleware(request, event);
    if (shared) return shared;

    if (isProtectedRoute(request) && !isPublicRoute(request)) {
      await auth.protect();
    }

    return NextResponse.next();
  },
);

export default function middleware(
  request: NextRequest,
  event: NextFetchEvent,
) {
  const shared = runSharedMiddleware(request, event);
  if (shared) return shared;

  if (needsClerk(request)) {
    return clerkHandler(request, event);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on everything except Next internals and static asset files, so
    // robots.txt/llms.txt stay reachable.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|ttf|woff2?)).*)",
    "/(api|trpc)(.*)",
  ],
};
