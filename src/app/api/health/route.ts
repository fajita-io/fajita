import { NextResponse } from "next/server";

import { BILLING_ENFORCEMENT_ENABLED } from "@/lib/billing/enforcement";
import { deploymentConfig } from "@/lib/deployment/config";
import { isSentryConfigured } from "@/lib/observability/sentry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public liveness endpoint. No secrets. Safe for Fajita self-monitors and
 * uptime probes. Does not confirm database or Stripe health (those stay
 * internal) so a DB outage can still return 200 for the web process.
 */
export async function GET() {
  const cfg = deploymentConfig();
  return NextResponse.json(
    {
      ok: true,
      service: "fajita-web",
      version: cfg.version,
      deploymentMode: cfg.mode,
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
