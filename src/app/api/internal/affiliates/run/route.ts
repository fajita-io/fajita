import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

import { serverEnv } from "@/lib/env";
import {
  expireEligibilityWindows,
  releaseMaturedCommissions,
} from "@/lib/affiliates/conversions";
import { dispatchAffiliateNotifications } from "@/lib/affiliates/notifications";
import { scanAffiliateFraudSignals } from "@/lib/affiliates/fraud";
import {
  reconcileAttributions,
  reconcileCommissions,
  reconcilePayouts,
} from "@/lib/affiliates/reconciliation";

/**
 * Internal affiliate engine trigger.
 *
 *   POST /api/internal/affiliates/run
 *   Authorization: Bearer <AFFILIATE_WORKER_TOKEN>
 *
 * Drives idempotent maintenance passes:
 *   - mature: move held commissions past their hold to payable.
 *   - expire: end elapsed eligibility windows and expire their conversions.
 *   - notify: deliver pending affiliate notifications (email).
 *   - fraud_scan: open heuristic fraud flags (velocity, refund rate).
 *   - reconcile: dry-run commission + payout + attribution reconciliation.
 *
 * Intended for a scheduled trigger (e.g. hourly). Every operation is idempotent,
 * so a frequent schedule stays safe. Disabled when AFFILIATE_WORKER_TOKEN is
 * unset. No customer or affiliate identity in the response.
 *
 * Body (optional JSON):
 *   { "jobs": ["mature", "expire", "notify", "fraud_scan", "reconcile"] }
 * Defaults to mature, expire, notify, fraud_scan.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: Request): boolean {
  const expected = serverEnv().AFFILIATE_WORKER_TOKEN;
  if (!expected) return false;
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (token.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  let jobs = ["mature", "expire", "notify", "fraud_scan"];
  const body = (await request.json().catch(() => null)) as {
    jobs?: unknown;
  } | null;
  if (Array.isArray(body?.jobs) && body.jobs.length > 0) {
    jobs = body.jobs.filter((j): j is string => typeof j === "string");
  }

  try {
    const result: Record<string, unknown> = { ok: true };
    if (jobs.includes("expire")) {
      result.expired = await expireEligibilityWindows(500);
    }
    if (jobs.includes("mature")) {
      result.matured = await releaseMaturedCommissions(500);
    }
    if (jobs.includes("notify")) {
      result.notified = await dispatchAffiliateNotifications(200);
    }
    if (jobs.includes("fraud_scan")) {
      result.fraud = await scanAffiliateFraudSignals(200);
    }
    if (jobs.includes("reconcile")) {
      result.reconcile = {
        commission: await reconcileCommissions(true),
        payout: await reconcilePayouts(true),
        attribution: await reconcileAttributions(true),
      };
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("[affiliates] run failed", error);
    return NextResponse.json(
      { ok: false, error: "Affiliate run failed." },
      { status: 500 },
    );
  }
}
