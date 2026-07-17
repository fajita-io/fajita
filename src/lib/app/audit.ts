import "server-only";

import { serviceClient } from "@/lib/supabase/service";

export type AuditAction =
  | "member.joined"
  | "member.left"
  | "member.removed"
  | "member.role_changed"
  | "invitation.created"
  | "invitation.resent"
  | "invitation.revoked"
  | "invitation.accepted"
  | "organization.created"
  | "organization.name_changed"
  | "organization.slug_changed"
  | "organization.logo_changed"
  | "organization.timezone_changed"
  | "security.setting_changed"
  | "session.revoked"
  | "export.requested"
  | "deletion.requested"
  | "deletion.canceled"
  | "ownership.transfer_initiated"
  | "monitor.created"
  | "monitor.tested"
  | "monitor.activated"
  | "monitor.paused"
  | "monitor.resumed"
  | "monitor.updated"
  | "monitor.version_created"
  | "monitor.secret_added"
  | "monitor.secret_rotated"
  | "monitor.deleted"
  | "monitor.heartbeat_token_created"
  | "monitor.heartbeat_token_rotated"
  | "monitor.heartbeat_token_revoked"
  | "monitor.check_blocked"
  | "monitor.archived"
  | "monitor.restored"
  | "monitor.duplicated"
  | "monitor.manual_check_requested"
  | "monitor.group_changed"
  | "monitor.tags_changed"
  | "monitor.bulk_action"
  | "monitor.secret_deleted"
  | "monitor.exported"
  | "monitor_group.created"
  | "monitor_group.updated"
  | "monitor_group.deleted"
  | "monitor_tag.created"
  | "monitor_tag.deleted"
  | "worker.marked_draining"
  | "incident.created"
  | "incident.acknowledged"
  | "incident.unacknowledged"
  | "incident.assigned"
  | "incident.reassigned"
  | "incident.severity_changed"
  | "incident.monitor_attached"
  | "incident.monitor_removed"
  | "incident.note_added"
  | "incident.note_corrected"
  | "incident.public_update_added"
  | "incident.resolved"
  | "incident.canceled"
  | "incident.reopened"
  | "incident.exported"
  | "incident.suppression_changed"
  | "maintenance.created"
  | "maintenance.updated"
  | "maintenance.canceled"
  | "maintenance.started"
  | "maintenance.ended"
  | "alert_channel.created"
  | "alert_channel.tested"
  | "alert_channel.activated"
  | "alert_channel.paused"
  | "alert_channel.resumed"
  | "alert_channel.deleted"
  | "alert_channel.set_default"
  | "alert_channel.credential_rotated"
  | "alert_channel.signing_key_rotated"
  | "alert_rule.created"
  | "alert_rule.updated"
  | "alert_rule.toggled"
  | "alert_rule.deleted"
  | "alert_delivery.dead_letter_retried"
  | "alert_delivery.dead_letter_dismissed"
  | "alert_delivery.exported"
  | "status_page.created"
  | "status_page.updated"
  | "status_page.appearance_updated"
  | "status_page.published"
  | "status_page.unpublished"
  | "status_page.deleted"
  | "status_page.version_rolled_back"
  | "status_page.component_created"
  | "status_page.component_updated"
  | "status_page.component_deleted"
  | "status_page.group_created"
  | "status_page.group_updated"
  | "status_page.group_deleted"
  | "status_page.domain_added"
  | "status_page.domain_verified"
  | "status_page.domain_primary_changed"
  | "status_page.domain_removed"
  | "status_page.incident_published"
  | "status_page.incident_unpublished"
  | "status_page.maintenance_published"
  | "status_page.notice_created"
  | "status_page.visibility_changed"
  | "subscriber.form_enabled"
  | "subscriber.form_disabled"
  | "subscriber.settings_changed"
  | "subscriber.preferences_changed_by_operator"
  | "subscriber.unsubscribed_by_operator"
  | "subscriber.suppressed"
  | "subscriber.suppression_removed"
  | "subscriber.deletion_requested"
  | "subscriber.deleted"
  | "subscriber.confirmation_resent"
  | "subscriber.import_started"
  | "subscriber.import_completed"
  | "subscriber.import_failed"
  | "subscriber.export_requested"
  | "subscriber.export_completed"
  | "subscriber.manual_redelivery"
  | "subscriber.reply_to_changed"
  | "billing.checkout_started"
  | "billing.subscription_activated"
  | "billing.plan_upgraded"
  | "billing.downgrade_scheduled"
  | "billing.downgrade_canceled"
  | "billing.interval_changed"
  | "billing.portal_opened"
  | "billing.payment_failed"
  | "billing.grace_period_started"
  | "billing.restriction_started"
  | "billing.payment_recovered"
  | "billing.cancellation_scheduled"
  | "billing.subscription_reactivated"
  | "billing.subscription_canceled"
  | "billing.refund_issued"
  | "billing.contact_changed"
  | "billing.admin_override_added"
  | "billing.admin_override_removed"
  | "onboarding.step_skipped"
  | "onboarding.checklist_dismissed"
  | "onboarding.checklist_reopened"
  | "onboarding.reconciled"
  | "lifecycle.preferences_changed"
  | "lifecycle.resend_requested"
  | "lifecycle.rule_toggled"
  | "lifecycle.template_paused"
  | "lifecycle.template_resumed"
  | "lifecycle.reconciled"
  | "report.settings_changed"
  | "report.recipient_added"
  | "report.recipient_removed"
  | "report.regenerated"
  | "report.exported"
  | "incident_recap.root_cause_updated"
  | "incident_recap.reviewed"
  | "incident_recap.regenerated"
  | "incident_recap.follow_up_created"
  | "incident_recap.follow_up_updated"
  | "incident_recap.follow_up_deleted"
  | "cancellation.feedback_recorded"
  // Affiliate program (Phase 12). Never store customer identity, tax ids, bank
  // data, or raw fraud evidence in audit metadata; use affiliate ids, anon refs,
  // and coarse enums only.
  | "affiliate.application_submitted"
  | "affiliate.application_reviewed"
  | "affiliate.approved"
  | "affiliate.rejected"
  | "affiliate.waitlisted"
  | "affiliate.information_requested"
  | "affiliate.blocked"
  | "affiliate.paused"
  | "affiliate.suspended"
  | "affiliate.reactivated"
  | "affiliate.terminated"
  | "affiliate.closure_requested"
  | "affiliate.closed"
  | "affiliate.profile_updated"
  | "affiliate.email_preferences_updated"
  | "affiliate.code_changed"
  | "affiliate.link_created"
  | "affiliate.campaign_created"
  | "affiliate.terms_accepted"
  | "affiliate.terms_reaccepted"
  | "affiliate.payout_setup_changed"
  | "affiliate.tax_status_changed"
  | "affiliate.conversion_confirmed"
  | "affiliate.commission_adjusted"
  | "affiliate.commission_held"
  | "affiliate.commission_released"
  | "affiliate.commission_reversed"
  | "affiliate.payout_batch_created"
  | "affiliate.payout_batch_approved"
  | "affiliate.payout_processed"
  | "affiliate.payout_failed"
  | "affiliate.fraud_review_opened"
  | "affiliate.fraud_review_resolved"
  | "affiliate.reconciliation_run"
  | "affiliate.export_requested"
  // Platform operations (Phase 17). Metadata must stay non-sensitive.
  | "platform.approval.submitted"
  | "platform.approval.approved"
  | "platform.approval.rejected"
  | "platform.approval.executed"
  | "platform.feature_flag.changed"
  | "platform.reconciliation.run"
  | "platform.reconciliation.repaired"
  | "platform.export.requested"
  | "platform.export.downloaded"
  | "platform.report.generated"
  | "platform.customer.note_created"
  | "platform.customer.restricted"
  | "platform.customer.restored"
  | "platform.security.event_resolved"
  | "platform.privacy.request_updated"
  | "platform.worker.drained"
  | "platform.check.replayed"
  | "platform.alert.dead_letter_retried"
  | "platform.role.granted"
  | "platform.role.revoked"
  | "platform.incident.updated"
  | "platform.acquisition.exported"
  | "platform.search.performed"
  | "platform.step_up.verified";

interface AuditInput {
  organizationId: string | null;
  actorUserId: string | null;
  actorType?: "user" | "system" | "platform_admin" | "service";
  action: AuditAction;
  targetType?: string;
  targetId?: string;
  summary?: string;
  metadata?: Record<string, unknown>;
  correlationId?: string;
}

/**
 * Append a tenant-scoped audit event. Never store secrets, tokens, invitation
 * tokens, or full request bodies. Metadata should be small, structured, and
 * non-sensitive. Failure to write audit must not break the primary action, so
 * errors are logged and swallowed.
 */
export async function recordAuditEvent(input: AuditInput): Promise<void> {
  try {
    const db = serviceClient();
    await db.from("audit_events").insert({
      organization_id: input.organizationId,
      actor_user_id: input.actorUserId,
      actor_type: input.actorType ?? "user",
      action: input.action,
      target_type: input.targetType ?? null,
      target_id: input.targetId ?? null,
      summary: input.summary ?? null,
      metadata: (input.metadata ?? {}) as never,
      correlation_id: input.correlationId ?? null,
    });
  } catch (error) {
    console.error("[audit] failed to record event", input.action, error);
  }
}

export interface AuditEventView {
  id: string;
  action: string;
  summary: string | null;
  actorName: string | null;
  actorType: string;
  targetType: string | null;
  createdAt: string;
  metadata: Record<string, unknown>;
}

/**
 * List recent audit events for one organization, newest first. Tenant-scoped by
 * organization_id; callers must have already verified `audit:read`. Joins the
 * actor's display name for presentation only.
 */
export async function listAuditEvents(
  organizationId: string,
  limit = 50,
): Promise<AuditEventView[]> {
  const db = serviceClient();
  const { data, error } = await db
    .from("audit_events")
    .select(
      "id, action, summary, actor_type, target_type, created_at, metadata, actor:user_profiles!audit_events_actor_user_id_fkey(display_name)",
    )
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;

  return (data ?? []).map((row) => {
    const actor = row.actor as unknown as { display_name: string | null } | null;
    return {
      id: row.id,
      action: row.action,
      summary: row.summary,
      actorName: actor?.display_name ?? null,
      actorType: row.actor_type,
      targetType: row.target_type,
      createdAt: row.created_at,
      metadata: (row.metadata ?? {}) as Record<string, unknown>,
    };
  });
}
