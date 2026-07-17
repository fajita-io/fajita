import { NextResponse } from "next/server";

import { BILLING_ENFORCEMENT_ENABLED } from "@/lib/billing/enforcement";
import { isSentryConfigured } from "@/lib/observability/sentry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public liveness endpoint. No secrets. Safe for Fajita self-monitors and
 * uptime probes. Does not confirm database or Stripe health (those stay
 * internal) so a DB outage can still return 200 for the web process.
 */
export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: "fajita-web",
      time: new Date().toISOString(),
      sentryConfigured: isSentryConfigured(),
      billingEnforcementEnabled: BILLING_ENFORCEMENT_ENABLED,
    },
    {
      status: 200,
      headers: {
        "cache-control": "no-store",
      },
    },
  );
}
