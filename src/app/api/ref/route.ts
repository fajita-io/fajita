import { NextResponse, type NextRequest } from "next/server";

import { appUrl } from "@/lib/env";
import {
  REFERRAL_COOKIE_NAME,
  decodeReferralCookie,
  encodeReferralCookie,
  referralCookieOptions,
} from "@/lib/affiliates/cookie";
import { DEFAULT_DESTINATION, resolveDestination } from "@/lib/affiliates/destinations";
import { recordReferralVisit } from "@/lib/affiliates/tracking";
import {
  CONSENT_COOKIE_NAME,
  referralConsentGranted,
} from "@/lib/consent/preferences";

/**
 * First-party referral redirect endpoint.
 *
 * Affiliate links resolve here (directly or via middleware rewrite of a
 * `?ref=` navigation). It validates the code and destination, records a
 * privacy-minimized click and first-party session server-side, sets the signed
 * referral cookie, and redirects to an allowlisted destination. It can never
 * become an open redirect: the destination is validated against a fixed
 * allowlist and falls back to the homepage.
 *
 * Only top-level document navigations create attribution (Sec-Fetch-Dest guard),
 * which blocks cookie stuffing via images, iframes, and background requests.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Best-effort per-instance rate limit for the public referral endpoint. A
// durable limiter (edge KV) is a documented follow-up; this bounds abuse from a
// single hot instance without blocking legitimate spikes.
const HITS = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 60;

function rateLimited(key: string): boolean {
  const now = Date.now();
  const entry = HITS.get(key);
  if (!entry || entry.resetAt < now) {
    HITS.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("ref") ?? url.searchParams.get("code");
  const campaignSlug = url.searchParams.get("fjc");
  const destination = resolveDestination(url.searchParams.get("to")) ?? DEFAULT_DESTINATION;
  const redirectTo = new URL(destination, appUrl);

  // No code, or a non-top-level navigation: redirect cleanly, attribute nothing.
  if (!code) return NextResponse.redirect(redirectTo);
  const secFetchDest = request.headers.get("sec-fetch-dest");
  if (secFetchDest && secFetchDest !== "document") {
    return NextResponse.redirect(redirectTo);
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  if (rateLimited(ip)) {
    return NextResponse.redirect(redirectTo);
  }

  const consentRaw = request.cookies.get(CONSENT_COOKIE_NAME)?.value;
  const maySetReferralCookie = referralConsentGranted(consentRaw);

  // Without referral consent, send the visitor to the destination without
  // writing the attribution cookie. Clicks are not attributed.
  if (!maySetReferralCookie) {
    return NextResponse.redirect(redirectTo);
  }

  const existing = decodeReferralCookie(request.cookies.get(REFERRAL_COOKIE_NAME)?.value);

  let sessionId: string | null = null;
  try {
    const result = await recordReferralVisit({
      code,
      campaignSlug,
      destination,
      existingSessionId: existing?.sessionId ?? null,
      userAgent: request.headers.get("user-agent"),
      referrer: request.headers.get("referer"),
      countryRegion: request.headers.get("x-vercel-ip-country"),
    });
    sessionId = result.sessionId;
  } catch {
    // Never let tracking failure break the visitor's navigation.
    sessionId = null;
  }

  const response = NextResponse.redirect(redirectTo);
  if (sessionId) {
    const { value, maxAgeSeconds } = encodeReferralCookie(sessionId);
    response.cookies.set(REFERRAL_COOKIE_NAME, value, referralCookieOptions(maxAgeSeconds));
  }
  return response;
}
