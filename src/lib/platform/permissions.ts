/**
 * Platform permissions for the founder command center.
 * Entirely separate from organization roles in src/lib/auth/roles.ts.
 */

export const PLATFORM_ROLES = [
  "platform_owner",
  "platform_administrator",
  "operations",
  "support",
  "billing_operations",
  "security",
  "privacy",
  "content_editor",
  "content_publisher",
  "affiliate_operations",
  "read_only_analyst",
  "auditor",
] as const;

export type PlatformRole = (typeof PLATFORM_ROLES)[number];

export const PLATFORM_PERMISSIONS = [
  // Overview
  "platform.overview.read",
  "platform.scorecards.read",
  // Customers
  "platform.customers.read",
  "platform.customers.notes.create",
  "platform.customers.export",
  "platform.customers.restrict",
  "platform.customers.restore",
  // Users
  "platform.users.read",
  // Monitoring
  "platform.monitoring.read",
  "platform.monitoring.workers.read",
  "platform.monitoring.workers.drain",
  "platform.monitoring.leases.reconcile",
  "platform.monitoring.checks.replay",
  "platform.monitoring.security.read",
  // Incidents
  "platform.incidents.read",
  "platform.incidents.reconcile",
  "platform.incidents.override",
  "platform.incidents.simulate",
  // Alerts
  "platform.alerts.read",
  "platform.alerts.retry",
  "platform.alerts.dead_letters.manage",
  "platform.providers.read",
  // Status / domains / subscribers
  "platform.status_pages.read",
  "platform.domains.read",
  "platform.domains.recheck",
  "platform.subscribers.read",
  // Revenue
  "platform.revenue.read",
  "platform.subscriptions.read",
  "platform.billing.reconcile",
  "platform.billing.restrict",
  "platform.billing.refund_review",
  "platform.billing.export",
  // Affiliates (aligned with Phase 12 logical names)
  "affiliate.application.review",
  "affiliate.fraud.review",
  "affiliate.reconciliation.run",
  "affiliate.payout.approve",
  "affiliate.directory.read",
  // Support
  "platform.support.read",
  "platform.support.conversations.read",
  "platform.support.restricted.read",
  // Content / SEO
  "platform.content.read",
  "platform.content.publish",
  "platform.seo.read",
  // Product
  "platform.product.read",
  "platform.claims.read",
  "platform.claims.manage",
  "platform.entitlements.read",
  "platform.entitlements.rebuild",
  // Security / privacy / audit
  "platform.security.read",
  "platform.security.review",
  "platform.security.restrict",
  "platform.security.events.resolve",
  "platform.privacy.read",
  "platform.privacy.requests.manage",
  "platform.privacy.exports.manage",
  "platform.privacy.deletions.manage",
  "platform.audit.read",
  "platform.audit.export",
  // Flags / approvals
  "platform.flags.read",
  "platform.flags.create",
  "platform.flags.update",
  "platform.flags.rollout",
  "platform.flags.rollback",
  "platform.approvals.read",
  "platform.approvals.review",
  "platform.approvals.approve",
  "platform.approvals.reject",
  // Infra / costs / reconciliation / reports
  "platform.releases.read",
  "platform.infrastructure.read",
  "platform.costs.read",
  "platform.reconciliation.read",
  "platform.reconciliation.run",
  "platform.reports.read",
  "platform.reports.generate",
  "platform.reports.export",
  "platform.calendar.read",
  "platform.calendar.manage",
  "platform.settings.read",
  "platform.settings.manage",
  "platform.roles.manage",
  "platform.acquisition.export",
  // Phase 20 controlled scale (marketing operators must not get infrastructure control)
  "scale.overview.read",
  "scale.readiness.read",
  "scale.readiness.manage",
  "scale.channels.read",
  "scale.channels.manage",
  "scale.campaigns.read",
  "scale.campaigns.create",
  "scale.campaigns.approve",
  "scale.campaigns.pause",
  "scale.partners.read",
  "scale.partners.manage",
  "scale.referrals.read",
  "scale.referrals.manage",
  "scale.forecast.read",
  "scale.forecast.manage",
  "scale.capacity.read",
  "scale.capacity.manage",
  "scale.hiring.read",
  "scale.hiring.manage",
  "scale.exports.create",
  "scale.admin",
] as const;

export type PlatformPermission = (typeof PLATFORM_PERMISSIONS)[number];

const ALL = PLATFORM_PERMISSIONS as unknown as PlatformPermission[];

const READ_CORE: PlatformPermission[] = [
  "platform.overview.read",
  "platform.scorecards.read",
  "platform.customers.read",
  "platform.users.read",
  "platform.monitoring.read",
  "platform.monitoring.workers.read",
  "platform.incidents.read",
  "platform.alerts.read",
  "platform.providers.read",
  "platform.status_pages.read",
  "platform.domains.read",
  "platform.subscribers.read",
  "platform.revenue.read",
  "platform.subscriptions.read",
  "platform.product.read",
  "platform.claims.read",
  "platform.entitlements.read",
  "platform.support.read",
  "platform.content.read",
  "platform.seo.read",
  "platform.security.read",
  "platform.privacy.read",
  "platform.audit.read",
  "platform.flags.read",
  "platform.approvals.read",
  "platform.releases.read",
  "platform.infrastructure.read",
  "platform.costs.read",
  "platform.reconciliation.read",
  "platform.reports.read",
  "platform.calendar.read",
  "platform.settings.read",
  "affiliate.directory.read",
  "scale.overview.read",
  "scale.readiness.read",
  "scale.channels.read",
  "scale.campaigns.read",
  "scale.partners.read",
  "scale.referrals.read",
  "scale.forecast.read",
  "scale.capacity.read",
  "scale.hiring.read",
];

const ROLE_PERMISSIONS: Record<PlatformRole, readonly PlatformPermission[]> = {
  platform_owner: ALL,
  platform_administrator: ALL.filter((p) => p !== "platform.roles.manage"),
  operations: [
    ...READ_CORE,
    "platform.monitoring.workers.drain",
    "platform.monitoring.leases.reconcile",
    "platform.monitoring.checks.replay",
    "platform.monitoring.security.read",
    "platform.incidents.reconcile",
    "platform.alerts.retry",
    "platform.alerts.dead_letters.manage",
    "platform.domains.recheck",
    "platform.reconciliation.run",
    "platform.reports.generate",
    "platform.calendar.manage",
    "platform.customers.notes.create",
    "scale.overview.read",
    "scale.readiness.read",
    "scale.channels.read",
    "scale.campaigns.read",
    "scale.campaigns.pause",
    "scale.capacity.read",
    "scale.capacity.manage",
    "scale.hiring.read",
  ],
  support: [
    "platform.overview.read",
    "platform.customers.read",
    "platform.customers.notes.create",
    "platform.users.read",
    "platform.support.read",
    "platform.support.conversations.read",
    "platform.product.read",
    "platform.content.read",
    "platform.incidents.read",
    "platform.status_pages.read",
    "platform.domains.read",
    "platform.calendar.read",
    "platform.approvals.read",
  ],
  billing_operations: [
    "platform.overview.read",
    "platform.scorecards.read",
    "platform.customers.read",
    "platform.customers.notes.create",
    "platform.revenue.read",
    "platform.subscriptions.read",
    "platform.billing.reconcile",
    "platform.billing.restrict",
    "platform.billing.refund_review",
    "platform.billing.export",
    "platform.entitlements.read",
    "platform.entitlements.rebuild",
    "platform.reports.read",
    "platform.reports.generate",
    "platform.reports.export",
    "platform.approvals.read",
    "platform.approvals.review",
    "platform.approvals.approve",
    "platform.approvals.reject",
    "affiliate.directory.read",
  ],
  security: [
    ...READ_CORE,
    "platform.security.review",
    "platform.security.restrict",
    "platform.security.events.resolve",
    "platform.monitoring.security.read",
    "platform.support.restricted.read",
    "platform.customers.restrict",
    "platform.approvals.review",
    "platform.approvals.approve",
    "platform.approvals.reject",
    "platform.audit.export",
  ],
  privacy: [
    "platform.overview.read",
    "platform.customers.read",
    "platform.privacy.read",
    "platform.privacy.requests.manage",
    "platform.privacy.exports.manage",
    "platform.privacy.deletions.manage",
    "platform.audit.read",
    "platform.approvals.read",
    "platform.approvals.review",
    "platform.approvals.approve",
    "platform.approvals.reject",
  ],
  content_editor: [
    "platform.overview.read",
    "platform.content.read",
    "platform.seo.read",
    "platform.claims.read",
    "platform.product.read",
    "platform.calendar.read",
  ],
  content_publisher: [
    "platform.overview.read",
    "platform.content.read",
    "platform.content.publish",
    "platform.seo.read",
    "platform.claims.read",
    "platform.claims.manage",
    "platform.product.read",
    "platform.calendar.read",
    "platform.approvals.read",
    "platform.approvals.review",
  ],
  affiliate_operations: [
    "platform.overview.read",
    "platform.revenue.read",
    "affiliate.application.review",
    "affiliate.fraud.review",
    "affiliate.reconciliation.run",
    "affiliate.payout.approve",
    "affiliate.directory.read",
    "platform.approvals.read",
    "platform.approvals.review",
    "platform.approvals.approve",
    "platform.approvals.reject",
    "platform.reports.read",
    "scale.overview.read",
    "scale.channels.read",
    "scale.referrals.read",
    "scale.partners.read",
  ],
  read_only_analyst: READ_CORE,
  auditor: [
    ...READ_CORE,
    "platform.audit.export",
    "platform.reports.export",
  ],
};

export function platformCan(
  roles: readonly PlatformRole[],
  permission: PlatformPermission,
): boolean {
  for (const role of roles) {
    const granted = ROLE_PERMISSIONS[role];
    if (granted?.includes(permission)) return true;
  }
  return false;
}

export function permissionsForRoles(
  roles: readonly PlatformRole[],
): Set<PlatformPermission> {
  const out = new Set<PlatformPermission>();
  for (const role of roles) {
    for (const p of ROLE_PERMISSIONS[role] ?? []) out.add(p);
  }
  return out;
}

export function isPlatformRole(value: string): value is PlatformRole {
  return (PLATFORM_ROLES as readonly string[]).includes(value);
}

/** Actions that require recent step-up authentication. */
export const STEP_UP_ACTIONS = [
  "customer.restrict",
  "customer.restore",
  "monitoring.check.replay",
  "monitoring.worker.drain",
  "alerts.dead_letter.retry",
  "billing.restrict",
  "billing.refund.approve",
  "flags.rollout",
  "flags.rollback",
  "affiliate.suspend",
  "affiliate.terminate",
  "affiliate.payout.approve",
  "support.restricted.access",
  "export.sensitive",
  "privacy.deletion.approve",
  "reconciliation.repair",
  "acquisition.export",
  "roles.change",
  "scale.stage.change",
  "scale.campaign.launch",
  "scale.capacity.stop",
  "scale.hiring.approve",
] as const;

export type StepUpAction = (typeof STEP_UP_ACTIONS)[number];
