import "server-only";

import { platformDb } from "../db";
import { logPlatformAdminAction } from "../logging";
import type { PlatformAccess } from "../access";

/**
 * Bounded export requests. No arbitrary table export.
 * Formula-injection prevention applied to string cells on generation.
 */

export const EXPORT_TYPES = [
  "customers",
  "revenue",
  "subscriptions",
  "mrr_movement",
  "incidents",
  "alert_delivery",
  "affiliate_ledger",
  "support_metrics",
  "content_inventory",
  "security_events",
  "privacy_requests",
  "audit_events",
  "infrastructure",
  "acquisition_diligence",
] as const;

export type ExportType = (typeof EXPORT_TYPES)[number];

const COLUMN_ALLOWLISTS: Record<ExportType, string[]> = {
  customers: [
    "organization_id",
    "name",
    "slug",
    "plan_key",
    "billing_state",
    "health_state",
    "mrr_cents",
    "created_at",
  ],
  revenue: ["metric_key", "value_cents", "basis", "period_start", "period_end"],
  subscriptions: [
    "organization_id",
    "plan_key",
    "status",
    "billing_interval",
    "mrr_cents",
  ],
  mrr_movement: [
    "organization_id",
    "movement_type",
    "effective_date",
    "difference_cents",
  ],
  incidents: ["incident_id", "organization_id", "lifecycle_status", "severity", "opened_at"],
  alert_delivery: ["delivery_id", "organization_id", "channel", "status", "failure_category"],
  affiliate_ledger: ["affiliate_id", "entry_type", "amount_cents", "status", "created_at"],
  support_metrics: ["day", "conversations", "handoffs", "feedback_positive", "feedback_negative"],
  content_inventory: ["content_type", "slug", "status", "updated_at"],
  security_events: ["event_id", "event_type", "severity", "status", "detection_time"],
  privacy_requests: ["request_id", "request_type", "state", "deadline_at"],
  audit_events: ["event_id", "action", "actor_type", "created_at", "target_type"],
  infrastructure: ["service_key", "environment", "provider", "health", "owner"],
  acquisition_diligence: ["section", "metric_key", "value", "period", "limitations"],
};

/** Prefix cells that Excel could treat as formulas. */
export function sanitizeExportCell(value: unknown): string {
  const s = value == null ? "" : String(value);
  if (/^[=+\-@]/.test(s)) return `'${s}`;
  return s;
}

export async function requestExport(
  access: PlatformAccess,
  input: {
    exportType: ExportType;
    filters?: Record<string, unknown>;
    approvalId?: string;
  },
): Promise<{ id: string } | { error: string }> {
  if (!EXPORT_TYPES.includes(input.exportType)) {
    return { error: "invalid_export_type" };
  }

  const db = platformDb();
  const { data, error } = await db
    .from("platform_exports")
    .insert({
      export_type: input.exportType,
      state: "queued",
      filters: input.filters ?? {},
      column_allowlist: COLUMN_ALLOWLISTS[input.exportType],
      requested_by: access.profile.id,
      approval_id: input.approvalId ?? null,
      watermark: `fajita-ops:${access.profile.id.slice(0, 8)}:${new Date().toISOString().slice(0, 10)}`,
      expires_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "insert_failed" };

  await logPlatformAdminAction({
    action: "platform.export.requested",
    actorUserId: access.profile.id,
    resourceType: "platform_export",
    resourceId: (data as { id: string }).id,
    approvalId: input.approvalId,
    summary: `Export requested: ${input.exportType}`,
  });

  return { id: (data as { id: string }).id };
}

export function columnsForExport(type: ExportType): string[] {
  return COLUMN_ALLOWLISTS[type];
}
