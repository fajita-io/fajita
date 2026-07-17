import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

import { serverEnv } from "@/lib/env";
import { consumeOutbox } from "@/lib/alerts/delivery/consumer";
import { runDeliveryPass } from "@/lib/alerts/delivery/worker";
import { runFanoutPass } from "@/lib/subscribers/delivery/fanout";
import { runSubscriberDeliveryPass } from "@/lib/subscribers/delivery/worker";
import { evaluateLifecycleBatch } from "@/lib/lifecycle/rules";
import { runLifecycleDeliveryPass } from "@/lib/lifecycle/delivery/worker";
import { generateWeeklyReportsBatch } from "@/lib/reports/weekly";
import { generateIncidentRecapsBatch } from "@/lib/reports/incident-recaps";
import {
  reconcileLifecycleDelivery,
  reconcileOnboardingBatch,
} from "@/lib/lifecycle/reconciliation";
import {
  expireEligibilityWindows,
  releaseMaturedCommissions,
} from "@/lib/affiliates/conversions";
import { dispatchAffiliateNotifications } from "@/lib/affiliates/notifications";
import { scanAffiliateFraudSignals } from "@/lib/affiliates/fraud";

/**
 * Scheduled maintenance tick (Vercel Cron).
 *
 *   GET /api/cron/tick
 *   Authorization: Bearer <CRON_SECRET>
 *
 * Vercel sends the Authorization header when CRON_SECRET is set in the
 * project environment. Each job is idempotent. Missing optional subsystems
 * degrade by skipping rather than failing the whole tick.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(request: Request): boolean {
  const expected = serverEnv().CRON_SECRET;
  if (!expected) return false;
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token || token.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const result: Record<string, unknown> = { ok: true };

  try {
    result.alerts = {
      consumed: await consumeOutbox(100),
      delivered: await runDeliveryPass({ max: 40, leaseSeconds: 90 }),
    };
  } catch (error) {
    console.error("[cron] alerts failed", error);
    result.alerts = { ok: false };
  }

  try {
    result.subscribers = {
      fanout: await runFanoutPass({ max: 20 }),
      delivered: await runSubscriberDeliveryPass({ max: 40, leaseSeconds: 90 }),
    };
  } catch (error) {
    console.error("[cron] subscribers failed", error);
    result.subscribers = { ok: false };
  }

  try {
    result.lifecycle = {
      rules: await evaluateLifecycleBatch(50),
      reports: await generateWeeklyReportsBatch(25),
      recaps: await generateIncidentRecapsBatch(25),
      delivery: await runLifecycleDeliveryPass({ max: 40 }),
      reconcile: {
        delivery: await reconcileLifecycleDelivery(true),
        onboarding: await reconcileOnboardingBatch(50),
      },
    };
  } catch (error) {
    console.error("[cron] lifecycle failed", error);
    result.lifecycle = { ok: false };
  }

  try {
    result.affiliates = {
      expired: await expireEligibilityWindows(500),
      matured: await releaseMaturedCommissions(500),
      notified: await dispatchAffiliateNotifications(200),
      fraud: await scanAffiliateFraudSignals(200),
    };
  } catch (error) {
    console.error("[cron] affiliates failed", error);
    result.affiliates = { ok: false };
  }

  return NextResponse.json(result);
}
