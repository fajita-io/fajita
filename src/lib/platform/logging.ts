import "server-only";

import { recordAuditEvent, type AuditAction } from "@/lib/app/audit";
import { platformDb } from "./db";

export interface PlatformAdminLogInput {
  action: AuditAction | string;
  actorUserId: string;
  organizationId?: string | null;
  resourceType?: string;
  resourceId?: string;
  reason?: string;
  approvalId?: string;
  result?: "success" | "failure" | "denied";
  correlationId?: string;
  metadata?: Record<string, unknown>;
  summary?: string;
}

/**
 * Centralized administrative logging. Never include secrets, payment methods,
 * tax data, full support messages, or provider credentials.
 */
export async function logPlatformAdminAction(
  input: PlatformAdminLogInput,
): Promise<void> {
  const safeMeta: Record<string, unknown> = {
    ...(input.metadata ?? {}),
    result: input.result ?? "success",
    approval_id: input.approvalId ?? null,
    reason: input.reason ?? null,
  };

  await recordAuditEvent({
    organizationId: input.organizationId ?? null,
    actorUserId: input.actorUserId,
    actorType: "platform_admin",
    action: input.action as AuditAction,
    targetType: input.resourceType,
    targetId: input.resourceId,
    summary: input.summary,
    metadata: safeMeta,
    correlationId: input.correlationId,
  });

  try {
    const db = platformDb();
    await db.from("platform_internal_page_events").insert({
      event_name: "sensitive_action_completed",
      operator_user_id: input.actorUserId,
      path: input.resourceType ?? null,
      metadata: {
        action: input.action,
        result: input.result ?? "success",
      },
    });
  } catch {
    // Non-blocking
  }
}

export async function trackInternalPageEvent(input: {
  eventName: string;
  operatorUserId?: string | null;
  path?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const db = platformDb();
    await db.from("platform_internal_page_events").insert({
      event_name: input.eventName,
      operator_user_id: input.operatorUserId ?? null,
      path: input.path ?? null,
      metadata: input.metadata ?? {},
    });
  } catch {
    // Non-blocking
  }
}
