import "server-only";

import { platformDb } from "../db";
import { logPlatformAdminAction } from "../logging";
import type { PlatformAccess } from "../access";

export type ApprovalState =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "expired"
  | "executing"
  | "completed"
  | "failed"
  | "rolled_back"
  | "canceled";

export interface ApprovalRow {
  id: string;
  approval_type: string;
  state: ApprovalState;
  requester_user_id: string;
  approver_user_id: string | null;
  reason: string;
  impact_summary: string | null;
  risk_classification: string;
  expires_at: string | null;
  cooling_off_until: string | null;
  created_at: string;
  updated_at: string;
}

export async function listApprovals(states?: ApprovalState[]): Promise<ApprovalRow[]> {
  const db = platformDb();
  let q = db
    .from("platform_approvals")
    .select(
      "id, approval_type, state, requester_user_id, approver_user_id, reason, impact_summary, risk_classification, expires_at, cooling_off_until, created_at, updated_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);
  if (states?.length) q = q.in("state", states);
  const { data, error } = await q;
  if (error) return [];
  return (data ?? []) as ApprovalRow[];
}

export async function submitApproval(
  access: PlatformAccess,
  input: {
    approvalType: string;
    reason: string;
    impactSummary?: string;
    risk: "low" | "medium" | "high" | "critical";
    scope?: Record<string, unknown>;
    expiresInHours?: number;
    coolingOffMinutes?: number;
  },
): Promise<{ id: string } | { error: string }> {
  const db = platformDb();
  const expires = new Date(
    Date.now() + (input.expiresInHours ?? 72) * 3600 * 1000,
  ).toISOString();
  const cooling =
    input.risk === "critical" || input.risk === "high"
      ? new Date(Date.now() + (input.coolingOffMinutes ?? 15) * 60 * 1000).toISOString()
      : null;

  const { data, error } = await db
    .from("platform_approvals")
    .insert({
      approval_type: input.approvalType,
      state: "submitted",
      requester_user_id: access.profile.id,
      reason: input.reason,
      impact_summary: input.impactSummary ?? null,
      risk_classification: input.risk,
      scope: input.scope ?? {},
      expires_at: expires,
      cooling_off_until: cooling,
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "insert_failed" };

  await logPlatformAdminAction({
    action: "platform.approval.submitted",
    actorUserId: access.profile.id,
    resourceType: "platform_approval",
    resourceId: (data as { id: string }).id,
    reason: input.reason,
    summary: `Approval submitted: ${input.approvalType}`,
    metadata: { risk: input.risk },
  });

  return { id: (data as { id: string }).id };
}

/**
 * Approve an approval request. Requester cannot approve their own high/critical
 * request when another platform role exists; solo founder uses step-up + cooling-off.
 */
export async function decideApproval(
  access: PlatformAccess,
  approvalId: string,
  decision: "approved" | "rejected",
  decisionReason: string,
): Promise<{ ok: true } | { error: string }> {
  const db = platformDb();
  const { data: row, error } = await db
    .from("platform_approvals")
    .select("*")
    .eq("id", approvalId)
    .maybeSingle();
  if (error || !row) return { error: "not_found" };

  const approval = row as ApprovalRow & {
    requester_user_id: string;
    risk_classification: string;
    expires_at: string | null;
  };

  if (!["submitted", "under_review"].includes(approval.state)) {
    return { error: "invalid_state" };
  }
  if (approval.expires_at && new Date(approval.expires_at) < new Date()) {
    await db.from("platform_approvals").update({ state: "expired" }).eq("id", approvalId);
    return { error: "expired" };
  }

  const highRisk =
    approval.risk_classification === "high" ||
    approval.risk_classification === "critical";
  if (
    highRisk &&
    decision === "approved" &&
    approval.requester_user_id === access.profile.id &&
    access.roles.length > 1 &&
    !access.roles.includes("platform_owner")
  ) {
    return { error: "self_approval_prohibited" };
  }

  await db
    .from("platform_approvals")
    .update({
      state: decision,
      approver_user_id: access.profile.id,
      decision_reason: decisionReason,
    })
    .eq("id", approvalId);

  await logPlatformAdminAction({
    action:
      decision === "approved"
        ? "platform.approval.approved"
        : "platform.approval.rejected",
    actorUserId: access.profile.id,
    resourceType: "platform_approval",
    resourceId: approvalId,
    reason: decisionReason,
    approvalId,
    summary: `Approval ${decision}`,
  });

  return { ok: true };
}

/**
 * Execute an approved action after revalidation. Does not mean the side effect
 * succeeded until state becomes completed.
 */
export async function beginApprovalExecution(
  access: PlatformAccess,
  approvalId: string,
): Promise<{ ok: true } | { error: string }> {
  const db = platformDb();
  const { data: row } = await db
    .from("platform_approvals")
    .select("*")
    .eq("id", approvalId)
    .maybeSingle();
  if (!row) return { error: "not_found" };

  const approval = row as ApprovalRow & {
    cooling_off_until: string | null;
    expires_at: string | null;
  };

  if (approval.state !== "approved") return { error: "not_approved" };
  if (approval.expires_at && new Date(approval.expires_at) < new Date()) {
    await db.from("platform_approvals").update({ state: "expired" }).eq("id", approvalId);
    return { error: "expired" };
  }
  if (
    approval.cooling_off_until &&
    new Date(approval.cooling_off_until) > new Date()
  ) {
    return { error: "cooling_off" };
  }

  await db
    .from("platform_approvals")
    .update({ state: "executing", executed_at: new Date().toISOString() })
    .eq("id", approvalId);

  await logPlatformAdminAction({
    action: "platform.approval.executed",
    actorUserId: access.profile.id,
    resourceType: "platform_approval",
    resourceId: approvalId,
    approvalId,
    summary: "Approval execution started",
  });

  return { ok: true };
}
