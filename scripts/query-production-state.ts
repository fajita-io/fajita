#!/usr/bin/env npx tsx
import { loadEnvConfig } from "@next/env";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

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
    process.env[key] = val;
  }
}

async function main(): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env");
  const db = createClient(url, key);

  const { data: orgs, error: oErr } = await db
    .from("organizations")
    .select("id,name,slug,is_internal,status,created_at")
    .order("created_at", { ascending: true })
    .limit(20);
  console.log("organizations", oErr?.message ?? orgs);

  const { data: internal } = await db
    .from("organizations")
    .select("id,name,slug")
    .eq("is_internal", true);
  console.log("internal_orgs", internal);

  const { data: pages, error: pErr } = await db
    .from("status_pages")
    .select("id,slug,name,status,visibility,organization_id,published_at")
    .is("deleted_at", null);
  console.log("status_pages", pErr?.message ?? pages);

  const { data: snaps } = await db
    .from("status_page_public_snapshots")
    .select("slug,visibility,overall_status,generated_at")
    .limit(10);
  console.log("snapshots", snaps);

  const { count: monitorCount } = await db
    .from("monitors")
    .select("id", { count: "exact", head: true });
  const { data: activeMonitors } = await db
    .from("monitors")
    .select("id,name,url:target_url,status,last_check_at,last_result_status")
    .eq("status", "active")
    .limit(10);
  console.log("monitor_count", monitorCount, "active_sample", activeMonitors);

  const { data: workers } = await db
    .from("monitor_workers")
    .select(
      "worker_key,region,status,last_heartbeat_at,active_lease_count,recent_success_count,recent_failure_count",
    )
    .order("last_heartbeat_at", { ascending: false })
    .limit(5);
  console.log("monitor_workers", workers);

  const { data: schedules } = await db
    .from("check_schedules")
    .select("monitor_id,enabled,next_check_at")
    .eq("enabled", true)
    .limit(5);
  console.log("check_schedules_sample", schedules);

  const { data: profiles } = await db
    .from("user_profiles")
    .select("id,external_id,email,display_name")
    .order("created_at", { ascending: true })
    .limit(5);
  console.log("profiles_sample", profiles);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
