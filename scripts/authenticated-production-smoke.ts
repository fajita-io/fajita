#!/usr/bin/env tsx
/**
 * Authenticated-adjacent production smoke (LB-008).
 *
 * Verifies production data paths, cron execution, billing surfaces, and app
 * route guards without a browser login. Complements npm run smoke:public.
 *
 *   npm run smoke:authenticated
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";

loadEnvConfig(process.cwd());

const prodPath = resolve(process.cwd(), ".env.production.local");
if (existsSync(prodPath)) {
  for (const line of readFileSync(prodPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq);
    let val = trimmed.slice(eq + 1);
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!val) continue;
    process.env[key] = val;
  }
}

const BASE = (process.env.SMOKE_BASE_URL ?? "https://fajita.io").replace(/\/$/, "");
const STATUS_SLUG = process.env.FAJITA_SERVICE_STATUS_SLUG?.trim() ?? "platform";
const INTERNAL_ORG_SLUG = "fajita-platform";

type Check = { id: string; ok: boolean; detail: string };

const checks: Check[] = [];

function record(id: string, ok: boolean, detail: string): void {
  checks.push({ id, ok, detail });
  console.log(`${ok ? "OK" : "FAIL"} ${id}: ${detail}`);
}

function serviceDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase production env");
  return createClient(url, key);
}

async function fetchStatus(path: string, expectRedirect = false): Promise<Response> {
  return fetch(`${BASE}${path}`, {
    redirect: expectRedirect ? "manual" : "follow",
    headers: { "user-agent": "fajita-auth-smoke/1.0" },
    cache: "no-store",
  });
}

async function checkPlatformFixture(): Promise<void> {
  const db = serviceDb();
  const { data: org } = await db
    .from("organizations")
    .select("id, slug, is_internal")
    .eq("slug", INTERNAL_ORG_SLUG)
    .maybeSingle();
  record(
    "internal-org",
    Boolean(org?.is_internal),
    org ? `${org.slug} (${org.id})` : "missing fajita-platform org",
  );

  const { data: page } = await db
    .from("status_pages")
    .select("id, slug, status, visibility")
    .eq("slug", STATUS_SLUG)
    .maybeSingle();
  record(
    "status-page-published",
    page?.status === "published" && page.visibility === "public",
    page ? `${page.slug} ${page.status}` : `no page for slug ${STATUS_SLUG}`,
  );

  const { count } = await db
    .from("monitors")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", org?.id ?? "")
    .eq("status", "active");
  record("platform-monitors", (count ?? 0) >= 5, `active monitors: ${count ?? 0}`);
}

async function checkMonitorExecution(): Promise<void> {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret) {
    record("monitor-cron", false, "CRON_SECRET not set locally");
    return;
  }

  const before = Date.now();
  const res = await fetch(`${BASE}/api/cron/monitor-tick`, {
    headers: { authorization: `Bearer ${cronSecret}` },
    cache: "no-store",
  });
  const body = (await res.json()) as { ok?: boolean; monitors?: unknown };
  const monitorCount =
    typeof body.monitors === "number"
      ? body.monitors
      : Array.isArray(body.monitors)
        ? body.monitors.length
        : body.monitors
          ? 1
          : 0;
  record(
    "monitor-cron",
    res.ok && body.ok === true,
    `status=${res.status} monitors=${monitorCount}`,
  );

  const db = serviceDb();
  const { data: recent } = await db
    .from("monitors")
    .select("name, last_check_at, last_result_status")
    .not("last_check_at", "is", null)
    .order("last_check_at", { ascending: false })
    .limit(3);

  const fresh = (recent ?? []).some((m) => {
    if (!m.last_check_at) return false;
    return new Date(m.last_check_at).getTime() >= before - 120_000;
  });
  record(
    "monitor-checks-recent",
    (recent ?? []).length > 0 && fresh,
    recent?.map((m) => `${m.name}:${m.last_result_status}`).join(", ") ?? "none",
  );
}

async function checkAppGuards(): Promise<void> {
  const appRes = await fetchStatus("/app", true);
  const appGuarded = [302, 307, 401, 404].includes(appRes.status);
  record("app-guard", appGuarded, `/app → ${appRes.status}`);

  const internalRes = await fetchStatus("/internal/launch", true);
  record(
    "internal-guard",
    [302, 307, 401, 404].includes(internalRes.status),
    `/internal/launch → ${internalRes.status}`,
  );

  const billingRes = await fetchStatus("/app/settings/billing", true);
  record(
    "billing-guard",
    [302, 307, 401, 404].includes(billingRes.status),
    `/app/settings/billing → ${billingRes.status}`,
  );
}

async function checkWebhooks(): Promise<void> {
  const stripeRes = await fetch(`${BASE}/api/webhooks/stripe`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  });
  record("stripe-webhook-guard", stripeRes.status === 400, `unsigned POST → ${stripeRes.status}`);

  const clerkRes = await fetch(`${BASE}/api/webhooks/clerk`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  });
  record("clerk-webhook-guard", clerkRes.status === 400, `unsigned POST → ${clerkRes.status}`);
}

async function checkStatusSurfaces(): Promise<void> {
  const official = await fetchStatus("/status");
  const officialHtml = await official.text();
  record(
    "official-status",
    official.ok && !officialHtml.includes("Monitoring is expanding"),
    `/status → ${official.status}`,
  );

  const hosted = await fetchStatus(`/status/${STATUS_SLUG}`);
  const hostedHtml = await hosted.text();
  record(
    "hosted-status-slug",
    hosted.ok && hostedHtml.length > 500,
    `/status/${STATUS_SLUG} → ${hosted.status}`,
  );

  const badge = await fetchStatus(`/status/${STATUS_SLUG}/badge`);
  record("status-badge", badge.ok, `/status/${STATUS_SLUG}/badge → ${badge.status}`);
}

async function checkBillingState(): Promise<void> {
  const healthRes = await fetchStatus("/api/health");
  const health = (await healthRes.json()) as {
    billingEnforcementEnabled?: boolean;
    sentryConfigured?: boolean;
  };
  record(
    "billing-enforcement",
    health.billingEnforcementEnabled === true,
    `enforcement=${health.billingEnforcementEnabled}`,
  );
  record(
    "sentry-configured",
    health.sentryConfigured === true,
    health.sentryConfigured
      ? "Sentry DSN active in production"
      : "Sentry DSN not set (run npm run wire:sentry after creating a Sentry project)",
  );

  const db = serviceDb();
  const { count: webhookEvents, error: webhookError } = await db
    .from("billing_webhook_events")
    .select("*", { count: "exact", head: true })
    .eq("status", "processed")
    .limit(0);
  record(
    "billing-webhooks-processed",
    !webhookError && (webhookEvents ?? 0) > 0,
    webhookError?.message ?? `processed events: ${webhookEvents ?? 0}`,
  );
}

async function main(): Promise<void> {
  console.log(`Authenticated production smoke against ${BASE}`);
  console.log(`Status slug: ${STATUS_SLUG}\n`);

  await checkPlatformFixture();
  await checkMonitorExecution();
  await checkAppGuards();
  await checkWebhooks();
  await checkStatusSurfaces();
  await checkBillingState();

  const failed = checks.filter((c) => !c.ok);
  const sentryOnly =
    failed.length === 1 && failed[0]?.id === "sentry-configured";
  console.log(`\nSummary: ${checks.length - failed.length}/${checks.length} checks passed`);
  if (failed.length > 0) {
    if (sentryOnly && process.env.SMOKE_ALLOW_MISSING_SENTRY === "1") {
      console.warn("\nSentry DSN not configured. All other checks passed.");
      console.log("\nAuthenticated production smoke PASSED (Sentry pending).");
      return;
    }
    console.error("\nFailed:");
    for (const f of failed) console.error(`  - ${f.id}: ${f.detail}`);
    process.exit(1);
  }
  console.log("\nAuthenticated production smoke PASSED.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
