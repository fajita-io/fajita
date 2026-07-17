import { NextResponse } from "next/server";

import { serviceClient } from "@/lib/supabase/service";
import { rateLimit, clientKey } from "@/lib/site/rate-limit";
import { SUBSCRIBER_RATE_LIMITS } from "@/lib/subscribers/constants";
import { emailHash, ipHash } from "@/lib/subscribers/email-crypto";
import { normalizeEmail } from "@/lib/subscribers/normalize";
import {
  recordSubscriptionRequest,
  type SubscribeInput,
} from "@/lib/subscribers/subscribe";
import { sendConfirmationEmail } from "@/lib/subscribers/delivery/confirmation";
import type { SimplePreferenceChoice } from "@/lib/subscribers/prefs";

/**
 * Public subscribe endpoint (double opt-in step 1).
 *
 *   POST /api/status-subscriptions/subscribe
 *   body: { statusPageId, email, allComponents, componentIds, incidentUpdates,
 *           maintenanceUpdates, website } // "website" is a honeypot
 *
 * Always returns the same neutral response so an attacker cannot learn whether
 * an address is subscribed, pending, suppressed, or new. A confirmation email
 * is sent only when the status page allows subscriptions and the address is
 * eligible. Never activates delivery: the subscriber must confirm.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NEUTRAL = {
  ok: true,
  message: "Check your inbox for a confirmation link.",
} as const;

interface Body {
  slug?: string;
  email?: string;
  allComponents?: boolean;
  componentSlugs?: string[];
  incidentUpdates?: boolean;
  maintenanceUpdates?: boolean;
  website?: string; // honeypot: must be empty
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  // Honeypot: silently accept (neutral) without doing anything.
  if (body.website && body.website.trim() !== "") {
    return NextResponse.json(NEUTRAL);
  }

  const slug = typeof body.slug === "string" ? body.slug : "";
  const rawEmail = typeof body.email === "string" ? body.email : "";
  if (!slug || !rawEmail) {
    return NextResponse.json({ ok: false, message: "Enter your email address." }, { status: 400 });
  }

  // Per-IP and per-email rate limits (separate windows).
  const ip = clientKey(request);
  const normalized = normalizeEmail(rawEmail);
  if (
    !rateLimit(`sub:ip:${ip}`, {
      limit: SUBSCRIBER_RATE_LIMITS.subscribePerIpMax,
      windowMs: SUBSCRIBER_RATE_LIMITS.subscribePerIpWindowMs,
    }) ||
    !rateLimit(`sub:em:${emailHash(normalized)}`, {
      limit: SUBSCRIBER_RATE_LIMITS.subscribePerEmailMax,
      windowMs: SUBSCRIBER_RATE_LIMITS.subscribePerEmailWindowMs,
    })
  ) {
    // Neutral response, no work: do not reveal rate-limit state to enumerators.
    return NextResponse.json(NEUTRAL);
  }

  // Resolve the page and verify it accepts public subscriptions. Password /
  // organization-only pages do not accept anonymous public subscriptions here.
  const db = serviceClient();
  const { data: page } = await db
    .from("status_pages")
    .select(
      "id, organization_id, status, subscriptions_enabled, subscriber_form_auto_paused_at, visibility",
    )
    .eq("slug", slug)
    .is("deleted_at", null)
    .maybeSingle();

  if (
    !page ||
    !page.subscriptions_enabled ||
    page.subscriber_form_auto_paused_at !== null ||
    ["suspended", "pending_deletion", "deleted"].includes(page.status) ||
    page.visibility === "password_protected" ||
    page.visibility === "organization_only"
  ) {
    // Neutral: never disclose why. A disabled form simply cannot subscribe.
    return NextResponse.json(NEUTRAL);
  }

  // Resolve public component slugs to internal component ids for this page. A
  // slug that does not belong to this page is silently dropped.
  const requestedSlugs = Array.isArray(body.componentSlugs)
    ? body.componentSlugs.filter((c) => typeof c === "string").slice(0, 200)
    : [];
  let componentIds: string[] = [];
  let selectedNames: string[] = [];
  if (requestedSlugs.length > 0) {
    const { data: comps } = await db
      .from("status_page_components")
      .select("id, slug, name")
      .eq("status_page_id", page.id)
      .in("slug", requestedSlugs);
    componentIds = (comps ?? []).map((c) => c.id);
    selectedNames = (comps ?? []).map((c) => c.name);
  }

  const choice: SimplePreferenceChoice = {
    allComponents: body.allComponents !== false,
    componentIds,
    incidentUpdates: body.incidentUpdates !== false,
    maintenanceUpdates: body.maintenanceUpdates !== false,
  };

  const input: SubscribeInput = {
    organizationId: page.organization_id,
    statusPageId: page.id,
    email: rawEmail,
    choice,
    consentSource: "public_form",
    ipHash: ipHash(ip) || null,
    userAgentSummary: summarizeUserAgent(request.headers.get("user-agent")),
  };

  try {
    const outcome = await recordSubscriptionRequest(input);
    if (outcome.kind === "invalid") {
      return NextResponse.json(
        { ok: false, message: outcome.message, suggestion: outcome.suggestion },
        { status: 400 },
      );
    }
    if (outcome.send && outcome.confirmationToken) {
      // Send confirmation off the neutral path; failure is logged, not exposed.
      await sendConfirmationEmail({
        statusPageId: page.id,
        email: outcome.email,
        confirmationToken: outcome.confirmationToken,
        choice,
        componentNames: selectedNames,
      }).catch((error) => console.error("[subscribers] confirmation send failed", error));
    }
    return NextResponse.json(NEUTRAL);
  } catch (error) {
    console.error("[subscribers] subscribe failed", error);
    // Still neutral to the caller: do not leak internal failure detail.
    return NextResponse.json(NEUTRAL);
  }
}

/** Coarse, non-identifying UA summary for consent evidence. */
function summarizeUserAgent(ua: string | null): string | null {
  if (!ua) return null;
  const os = /Windows/.test(ua)
    ? "Windows"
    : /Mac OS X|Macintosh/.test(ua)
      ? "macOS"
      : /Android/.test(ua)
        ? "Android"
        : /iPhone|iPad|iOS/.test(ua)
          ? "iOS"
          : /Linux/.test(ua)
            ? "Linux"
            : "Other";
  const browser = /Firefox/.test(ua)
    ? "Firefox"
    : /Edg\//.test(ua)
      ? "Edge"
      : /Chrome/.test(ua)
        ? "Chrome"
        : /Safari/.test(ua)
          ? "Safari"
          : "Other";
  return `${browser} on ${os}`;
}
