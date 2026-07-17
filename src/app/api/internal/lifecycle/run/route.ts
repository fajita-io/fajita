import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

import { serverEnv } from "@/lib/env";
import { evaluateLifecycleBatch } from "@/lib/lifecycle/rules";
import { runLifecycleDeliveryPass } from "@/lib/lifecycle/delivery/worker";
import { generateWeeklyReportsBatch } from "@/lib/reports/weekly";
import { generateIncidentRecapsBatch } from "@/lib/reports/incident-recaps";
import {
  reconcileLifecycleDelivery,
  reconcileOnboardingBatch,
} from "@/lib/lifecycle/reconciliation";

/**
 * Internal lifecycle trigger.
 *
 *   POST /api/internal/lifecycle/run
 *   Authorization: Bearer <LIFECYCLE_WORKER_TOKEN>
 *
 * Drives one pass of each lifecycle job: rule evaluation (organizations ->
 * delivery intents), report generation (weekly reports + incident recaps),
 * and delivery (intents -> provider). Intended for a scheduled trigger every
 * few minutes. Report generation is idempotent (unique period / incident
 * constraints), so a frequent schedule stays safe. Disabled when
 * LIFECYCLE_WORKER_TOKEN is unset. No customer data in the response.
 *
 * Body (optional JSON):
 *   { "jobs": ["rules", "reports", "recaps", "delivery", "reconcile"] }
 * defaults to all jobs.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: Request): boolean {
  const expected = serverEnv().LIFECYCLE_WORKER_TOKEN;
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
  let jobs = ["rules", "reports", "recaps", "delivery", "reconcile"];
  try {
    const body = (await request.json().catch(() => null)) as {
      jobs?: unknown;
    } | null;
    if (Array.isArray(body?.jobs) && body.jobs.length > 0) {
      jobs = body.jobs.filter((j): j is string => typeof j === "string");
    }
  } catch {
    // Empty body: run everything.
  }

  try {
    const result: Record<string, unknown> = { ok: true };
    if (jobs.includes("rules")) {
      result.evaluation = await evaluateLifecycleBatch(50);
    }
    if (jobs.includes("reports")) {
      result.reports = await generateWeeklyReportsBatch(20);
    }
    if (jobs.includes("recaps")) {
      result.recaps = await generateIncidentRecapsBatch(20);
    }
    if (jobs.includes("delivery")) {
      result.delivery = await runLifecycleDeliveryPass({
        max: 40,
        leaseSeconds: 90,
      });
    }
    if (jobs.includes("reconcile")) {
      result.onboardingReconcile = await reconcileOnboardingBatch(100, false);
      result.deliveryReconcile = await reconcileLifecycleDelivery(false);
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("[lifecycle] run failed", error);
    return NextResponse.json(
      { ok: false, error: "Lifecycle run failed." },
      { status: 500 },
    );
  }
}
