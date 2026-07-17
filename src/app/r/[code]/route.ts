import { NextResponse, type NextRequest } from "next/server";

import { appUrl } from "@/lib/env";
import { CUSTOMER_REFERRAL_COOKIE, CUSTOMER_REFERRAL_WINDOW_DAYS } from "@/lib/scale/referrals";

/**
 * Customer referral landing (distinct from Phase 12 affiliate /api/ref).
 * Sets a first-party customer-referral cookie pointer only. No open redirects.
 * Does not create affiliate commissions.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CODE_RE = /^c_[a-zA-Z0-9_-]{3,32}$/;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> },
) {
  const { code } = await context.params;
  const dest = new URL("/", appUrl);

  if (!CODE_RE.test(code)) {
    return NextResponse.redirect(dest, 302);
  }

  // Top-level navigations only (reduce cookie stuffing).
  const destFetch = request.headers.get("sec-fetch-dest");
  if (destFetch && destFetch !== "document") {
    return NextResponse.redirect(dest, 302);
  }

  const response = NextResponse.redirect(dest, 302);
  const maxAge = CUSTOMER_REFERRAL_WINDOW_DAYS * 24 * 60 * 60;
  const expiresAt = Math.floor(Date.now() / 1000) + maxAge;
  // Opaque pointer only: code + expiry. Server must re-validate against DB when binding.
  response.cookies.set(CUSTOMER_REFERRAL_COOKIE, `1.${code}.${expiresAt}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  return response;
}
