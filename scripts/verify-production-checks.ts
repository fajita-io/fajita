#!/usr/bin/env npx tsx
/**
 * Run all five production readiness checks and print pass/fail.
 *
 *   npx tsx scripts/verify-production-checks.ts
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";

import {
  authProductionReady,
  evaluateAuthProductionReadiness,
} from "../src/lib/auth/production-readiness";

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
    process.env[key] = val;
  }
}

const BASE = process.env.SMOKE_BASE_URL ?? "https://fajita.io";

async function checkSelfMonitoring(): Promise<boolean> {
  const slug = process.env.FAJITA_SERVICE_STATUS_SLUG?.trim();
  console.log("\n[1] Self-monitoring");
  if (!slug) {
    console.log("  FAIL FAJITA_SERVICE_STATUS_SLUG not set locally");
    return false;
  }
  console.log(`  OK slug configured: ${slug}`);

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const { data: page } = await db
    .from("status_pages")
    .select("id,status,visibility")
    .eq("slug", slug)
    .maybeSingle();
  if (!page || page.status !== "published") {
    console.log("  FAIL status page not published");
    return false;
  }
  console.log("  OK published status page exists");

  const { count } = await db
    .from("monitors")
    .select("id", { count: "exact", head: true })
    .eq("status", "active");
  console.log(`  ${(count ?? 0) > 0 ? "OK" : "FAIL"} active monitors: ${count ?? 0}`);

  const res = await fetch(`${BASE}/status`, { cache: "no-store" });
  const html = await res.text();
  const expanding = html.includes("Monitoring is expanding");
  console.log(`  ${expanding ? "FAIL" : "OK"} /status free of placeholder notice`);
  return !expanding && (count ?? 0) > 0;
}

async function checkMonitorExecution(): Promise<boolean> {
  console.log("\n[2] Monitor execution");
  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const { data: workers } = await db
    .from("monitor_workers")
    .select("worker_key,last_heartbeat_at,status")
    .order("last_heartbeat_at", { ascending: false })
    .limit(3);
  const recentWorker = (workers ?? []).some((w) => {
    if (!w.last_heartbeat_at) return false;
    return Date.now() - new Date(w.last_heartbeat_at).getTime() < 10 * 60 * 1000;
  });
  console.log(
    `  ${recentWorker ? "OK" : "WARN"} worker heartbeat in last 10m: ${recentWorker}`,
  );

  const { data: checked } = await db
    .from("monitors")
    .select("id,name,last_check_at,last_result_status")
    .not("last_check_at", "is", null)
    .limit(3);
  const hasChecks = (checked ?? []).length > 0;
  console.log(
    `  ${hasChecks ? "OK" : "FAIL"} monitors with last_check_at: ${(checked ?? []).length}`,
  );
  if (checked?.length) {
    for (const m of checked) {
      console.log(`      · ${m.name}: ${m.last_result_status} @ ${m.last_check_at}`);
    }
  }
  return hasChecks;
}

async function checkStripe(): Promise<boolean> {
  console.log("\n[3] Stripe + billing");
  const auth = authProductionReady({ production: true });
  console.log(`  ${auth ? "OK" : "FAIL"} auth/billing env`);

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const { count: subs } = await db
    .from("billing_subscriptions")
    .select("id", { count: "exact", head: true })
    .in("status", ["active", "trialing"]);
  console.log(`  ${(subs ?? 0) > 0 ? "OK" : "WARN"} live subscriptions in DB: ${subs ?? 0}`);
  const enforcement = process.env.BILLING_ENFORCEMENT_ENABLED?.trim().toLowerCase();
  let enforced =
    enforcement === "1" || enforcement === "true" || enforcement === "yes" || enforcement === "on";
  try {
    const healthRes = await fetch(`${BASE}/api/health`, { cache: "no-store" });
    if (healthRes.ok) {
      const health = (await healthRes.json()) as {
        billingEnforcementEnabled?: boolean;
      };
      if (health.billingEnforcementEnabled === true) {
        enforced = true;
      }
    }
  } catch {
    // Fall back to local env only.
  }
  console.log(
    `  ${enforced ? "OK" : "WARN"} BILLING_ENFORCEMENT_ENABLED=${enforced ? "on" : "off"}`,
  );
  return auth;
}

async function checkProductHunt(): Promise<boolean> {
  console.log("\n[4] Product Hunt banner");
  const url = process.env.NEXT_PUBLIC_PRODUCT_HUNT_URL?.trim();
  if (!url) {
    console.log("  WARN NEXT_PUBLIC_PRODUCT_HUNT_URL not set (banner hidden until launch URL exists)");
    return true;
  }
  console.log(`  OK banner URL configured`);
  const res = await fetch(BASE, { cache: "no-store" });
  const html = await res.text();
  const shown = html.includes(url);
  console.log(`  ${shown ? "OK" : "FAIL"} homepage renders PH banner`);
  return shown;
}

async function checkPublicSmoke(): Promise<boolean> {
  console.log("\n[5] Public smoke");
  const res = await fetch(`${BASE}/api/health`, { cache: "no-store" });
  if (!res.ok) {
    console.log(`  FAIL /api/health ${res.status}`);
    return false;
  }
  const body = (await res.json()) as { ok?: boolean; billingEnforcementEnabled?: boolean };
  console.log(`  OK /api/health ok=${body.ok} enforcement=${body.billingEnforcementEnabled}`);
  return body.ok === true;
}

async function main(): Promise<void> {
  console.log(`Production checks for ${BASE}`);

  const authChecks = evaluateAuthProductionReadiness({ production: true });
  for (const c of authChecks) {
    console.log(`${c.ok ? "PASS" : "FAIL"} ${c.id}`);
  }

  const results = await Promise.all([
    checkSelfMonitoring(),
    checkMonitorExecution(),
    checkStripe(),
    checkProductHunt(),
    checkPublicSmoke(),
  ]);

  const failed = results.filter((r) => !r).length;
  console.log(`\nSummary: ${results.length - failed}/${results.length} checks passed`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
