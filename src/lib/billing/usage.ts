import "server-only";

import { serviceClient } from "@/lib/supabase/service";

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
  };
}
