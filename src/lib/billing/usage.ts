import "server-only";

import { loadCurrentSubscription } from "@/lib/billing/engine";
import { serviceClient } from "@/lib/supabase/service";

function startOfUtcMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

/** Resolve billing period bounds for check usage (subscription period or calendar month). */
export async function resolveCheckUsagePeriod(
  organizationId: string,
): Promise<{ start: string; end: string }> {
  const subscription = await loadCurrentSubscription(organizationId);
  const now = new Date();

  if (subscription?.current_period_start && subscription?.current_period_end) {
    return {
      start: subscription.current_period_start,
      end: subscription.current_period_end,
    };
  }

  const monthStart = startOfUtcMonth(now);
  const monthEnd = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
  );
  return {
    start: monthStart.toISOString(),
    end: monthEnd.toISOString(),
  };
}

/** Count finalized check results in a time window. */
export async function countChecksInPeriod(
  organizationId: string,
  periodStart: string,
  periodEnd: string,
): Promise<number> {
  const db = serviceClient();
  const { count, error } = await db
    .from("check_results")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .gte("checked_at", periodStart)
    .lt("checked_at", periodEnd);
  if (error) throw error;
  return count ?? 0;
}

export interface UsageSnapshot {
  activeMonitors: number;
  totalMonitors: number;
  teamMembers: number;
  pendingInvitations: number;
  statusPages: number;
  customDomains: number;
  alertChannels: number;
  alertRules: number;
  confirmedSubscribers: number;
  /** Finalized checks in the current billing period, when period bounds are known. */
  checksThisPeriod: number | null;
  checksPeriodStart: string | null;
  checksPeriodEnd: string | null;
}

type CountQuery = () => Promise<number>;

async function safeCount(fn: CountQuery): Promise<number> {
  try {
    return await fn();
  } catch (error) {
    console.error("[usage] count failed", error);
    return 0;
  }
}

/**
 * Rebuild the org's usage counts from source tables. Used to seed / reconcile
 * billing_usage_counters. Uses head+count queries so it never loads rows.
 */
export async function rebuildUsageSnapshot(
  organizationId: string,
): Promise<UsageSnapshot> {
  const db = serviceClient();

  const countWhere = (
    table: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    build: (q: any) => any,
  ): CountQuery => {
    return async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const base = (db as any)
        .from(table)
        .select("id", { count: "exact", head: true });
      const { count, error } = await build(base);
      if (error) throw error;
      return count ?? 0;
    };
  };

  const [
    activeMonitors,
    totalMonitors,
    teamMembers,
    pendingInvitations,
    statusPages,
    customDomains,
    alertChannels,
    alertRules,
    confirmedSubscribers,
  ] = await Promise.all([
    safeCount(
      countWhere("monitors", (q) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (q as any)
          .eq("organization_id", organizationId)
          .is("deleted_at", null)
          .is("archived_at", null),
      ),
    ),
    safeCount(
      countWhere("monitors", (q) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (q as any).eq("organization_id", organizationId).is("deleted_at", null),
      ),
    ),
    safeCount(
      countWhere("organization_members", (q) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (q as any).eq("organization_id", organizationId).eq("status", "active"),
      ),
    ),
    safeCount(
      countWhere("organization_invitations", (q) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (q as any)
          .eq("organization_id", organizationId)
          .is("accepted_at", null)
          .is("revoked_at", null),
      ),
    ),
    safeCount(
      countWhere("status_pages", (q) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (q as any).eq("organization_id", organizationId).neq("status", "deleted"),
      ),
    ),
    safeCount(
      countWhere("status_page_domains", (q) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (q as any).eq("organization_id", organizationId),
      ),
    ),
    safeCount(
      countWhere("alert_channels", (q) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (q as any).eq("organization_id", organizationId).neq("status", "deleted"),
      ),
    ),
    safeCount(
      countWhere("alert_routing_rules", (q) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (q as any).eq("organization_id", organizationId),
      ),
    ),
    safeCount(
      countWhere("status_page_subscribers", (q) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (q as any)
          .eq("organization_id", organizationId)
          .eq("status", "confirmed")
          .is("deleted_at", null),
      ),
    ),
  ]);

  const period = await resolveCheckUsagePeriod(organizationId);
  let checksThisPeriod: number | null = null;
  try {
    checksThisPeriod = await countChecksInPeriod(
      organizationId,
      period.start,
      period.end,
    );
  } catch (error) {
    console.error("[usage] check count failed", error);
  }

  const snapshot: UsageSnapshot = {
    activeMonitors,
    totalMonitors,
    teamMembers,
    pendingInvitations,
    statusPages,
    customDomains,
    alertChannels,
    alertRules,
    confirmedSubscribers,
    checksThisPeriod,
    checksPeriodStart: period.start,
    checksPeriodEnd: period.end,
  };

  await db.from("billing_usage_counters").upsert(
    {
      organization_id: organizationId,
      active_monitors: activeMonitors,
      total_monitors: totalMonitors,
      team_members: teamMembers,
      pending_invitations: pendingInvitations,
      status_pages: statusPages,
      custom_domains: customDomains,
      alert_channels: alertChannels,
      alert_rules: alertRules,
      confirmed_subscribers: confirmedSubscribers,
      rebuilt_at: new Date().toISOString(),
    } as never,
    { onConflict: "organization_id" },
  );

  return snapshot;
}

/** Read counts, rebuilding on first access if none are cached. */
export async function getUsageSnapshot(
  organizationId: string,
): Promise<UsageSnapshot> {
  const db = serviceClient();
  const { data } = await db
    .from("billing_usage_counters")
    .select("*")
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (!data) return rebuildUsageSnapshot(organizationId);

  const period = await resolveCheckUsagePeriod(organizationId);
  let checksThisPeriod: number | null = null;
  try {
    checksThisPeriod = await countChecksInPeriod(
      organizationId,
      period.start,
      period.end,
    );
  } catch (error) {
    console.error("[usage] check count failed", error);
  }

  return {
    activeMonitors: data.active_monitors,
    totalMonitors: data.total_monitors,
    teamMembers: data.team_members,
    pendingInvitations: data.pending_invitations,
    statusPages: data.status_pages,
    customDomains: data.custom_domains,
    alertChannels: data.alert_channels,
    alertRules: data.alert_rules,
    confirmedSubscribers: data.confirmed_subscribers,
    checksThisPeriod,
    checksPeriodStart: period.start,
    checksPeriodEnd: period.end,
  };
}
