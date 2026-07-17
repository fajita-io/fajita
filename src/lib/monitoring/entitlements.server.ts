import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import { getOrgEntitlements } from "@/lib/billing/engine";
import type { PlanEntitlements } from "@/lib/billing/catalog";
import { type MonitorEntitlements } from "./entitlements";

const UNLIMITED = Number.MAX_SAFE_INTEGER;

/** Project the full billing entitlement set onto the monitor-specific shape. */
function toMonitorEntitlements(ent: PlanEntitlements): MonitorEntitlements {
  return {
    maxMonitors: ent.max_active_monitors ?? UNLIMITED,
    minimumCheckIntervalSeconds: ent.minimum_check_interval_seconds,
    resultRetentionDays: ent.detailed_check_retention_days,
    maxAssertionsPerMonitor: ent.max_assertions_per_monitor,
    maxSecretHeadersPerMonitor: ent.max_secret_headers_per_monitor,
    heartbeatEnabled: ent.heartbeat_monitoring_enabled,
    exportEnabled: ent.monitor_export_enabled,
    regionChoiceEnabled: false,
  };
}

/**
 * Server-side entitlement resolution. Reads the organization's current billing
 * entitlement snapshot (fast, no Stripe call) and projects it onto the monitor
 * shape. Callers depend only on `MonitorEntitlements`, never on a plan name, so
 * the billing wiring is invisible to them. Organizations without a subscription
 * resolve to the beta grant while billing is pre-launch, or the locked set once
 * billing has launched (see the entitlement engine).
 */
export async function resolveEntitlements(
  organizationId: string,
): Promise<MonitorEntitlements> {
  const ent = await getOrgEntitlements(organizationId);
  return toMonitorEntitlements(ent);
}

/** Count monitors that count against the limit (everything not deleted/archived). */
export async function countActiveMonitors(
  organizationId: string,
): Promise<number> {
  const db = serviceClient();
  const { count, error } = await db
    .from("monitors")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .is("archived_at", null);
  if (error) throw error;
  return count ?? 0;
}
