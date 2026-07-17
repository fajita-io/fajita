import "server-only";

import type { SecurityEventType } from "@contracts/contract";

import { serviceClient } from "@/lib/supabase/service";

/**
 * Monitoring security-event recorder. Events capture SSRF blocks, abuse, and
 * rate-limit enforcement for platform-admin investigation. They are org-scoped
 * where a monitor is involved and never contain secrets or full sensitive URLs.
 */

export async function recordSecurityEvent(params: {
  organizationId: string | null;
  monitorId?: string | null;
  eventType: SecurityEventType;
  severity?: "info" | "warning" | "critical";
  safeSummary: string;
  metadata?: Record<string, unknown> | null;
  correlationId?: string | null;
}): Promise<void> {
  try {
    const db = serviceClient();
    await db.from("monitor_security_events").insert({
      organization_id: params.organizationId,
      monitor_id: params.monitorId ?? null,
      event_type: params.eventType,
      severity: params.severity ?? "info",
      safe_summary: params.safeSummary,
      metadata: (params.metadata ?? null) as never,
      correlation_id: params.correlationId ?? null,
    });
  } catch (error) {
    console.error("[monitoring] failed to record security event", error);
  }
}

export interface SecurityEventView {
  id: string;
  eventType: string;
  severity: string;
  safeSummary: string;
  createdAt: string;
}

/** Recent security events for platform-admin review (optionally org-scoped). */
export async function listSecurityEvents(
  organizationId: string | null,
  limit = 50,
): Promise<SecurityEventView[]> {
  const db = serviceClient();
  let query = db
    .from("monitor_security_events")
    .select("id, event_type, severity, safe_summary, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (organizationId) query = query.eq("organization_id", organizationId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    eventType: r.event_type,
    severity: r.severity,
    safeSummary: r.safe_summary,
    createdAt: r.created_at,
  }));
}
