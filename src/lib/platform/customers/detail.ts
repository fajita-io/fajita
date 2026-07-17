import "server-only";

import { subscriptionMrrCents, formatUsdCents } from "@/lib/billing/mrr";
import { serviceClient } from "@/lib/supabase/service";
import { platformDb } from "../db";

export async function loadCustomer360(organizationId: string) {
  const db = serviceClient();

  const { data: org, error } = await db
    .from("organizations")
    .select("id, name, slug, created_at, status, owner_user_id, is_internal")
    .eq("id", organizationId)
    .maybeSingle();

  if (error || !org) return null;

  const [
    sub,
    lifecycle,
    monitors,
    incidents,
    statusPages,
    notes,
    health,
    members,
  ] = await Promise.all([
    db
      .from("billing_subscriptions")
      .select("*")
      .eq("organization_id", organizationId)
      .maybeSingle(),
    db
      .from("lifecycle_states")
      .select("*")
      .eq("organization_id", organizationId)
      .maybeSingle(),
    db
      .from("monitors")
      .select("id, name, monitor_type, status, check_interval_seconds, created_at")
      .eq("organization_id", organizationId)
      .limit(100),
    db
      .from("incidents")
      .select("id, title, lifecycle_status, severity, opened_at, resolved_at")
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .order("opened_at", { ascending: false })
      .limit(20),
    db
      .from("status_pages")
      .select("id, name, status, created_at")
      .eq("organization_id", organizationId)
      .limit(20),
    (async () => {
      try {
        return await platformDb()
          .from("platform_customer_notes")
          .select("id, category, body, created_at, author_user_id")
          .eq("organization_id", organizationId)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(50);
      } catch {
        return { data: [] };
      }
    })(),
    (async () => {
      try {
        return await platformDb()
          .from("platform_org_health_snapshots")
          .select("*")
          .eq("organization_id", organizationId)
          .maybeSingle();
      } catch {
        return { data: null };
      }
    })(),
    db
      .from("organization_members")
      .select("id, role, status, user_id")
      .eq("organization_id", organizationId)
      .eq("status", "active")
      .limit(100),
  ]);

  const mrrCents = sub.data
    ? subscriptionMrrCents({
        status: sub.data.status as never,
        interval: (sub.data.billing_interval ?? "month") as "month" | "year",
        recurringAmountCents: sub.data.recurring_amount_cents ?? 0,
      })
    : 0;

  return {
    organization: org,
    subscription: sub.data,
    lifecycle: lifecycle.data,
    health: health.data,
    monitors: monitors.data ?? [],
    incidents: incidents.data ?? [],
    statusPages: statusPages.data ?? [],
    notes: notes.data ?? [],
    memberCount: members.data?.length ?? 0,
    mrrLabel: formatUsdCents(mrrCents),
    mrrCents,
  };
}
