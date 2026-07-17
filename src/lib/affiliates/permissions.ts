/**
 * Affiliate permission model.
 *
 * Deliberately separate from the organization role model (src/lib/auth/roles.ts).
 * An affiliate is a person in a program, not a member of an organization, and
 * platform affiliate operations must never be reachable through ordinary
 * organization-admin roles.
 *
 * Two permission sets:
 *   - Affiliate-facing: what an approved affiliate may do in their dashboard,
 *     gated additionally by membership state (suspended/terminated affiliates
 *     lose write and payout permissions but may retain read where policy allows).
 *   - Platform-admin: program operations, gated by requirePlatformAdmin() and,
 *     for sensitive actions, step-up authentication.
 *
 * Pure and dependency-light so it can be imported by server actions and tested.
 */

import type { MembershipState } from "./states";

export const AFFILIATE_PERMISSIONS = [
  "affiliate.dashboard.read",
  "affiliate.links.manage",
  "affiliate.campaigns.manage",
  "affiliate.analytics.read",
  "affiliate.commissions.read",
  "affiliate.payouts.read",
  "affiliate.creatives.read",
  "affiliate.profile.update",
  "affiliate.tax.manage",
  "affiliate.payout_profile.manage",
  "affiliate.export",
] as const;
export type AffiliatePermission = (typeof AFFILIATE_PERMISSIONS)[number];

export const AFFILIATE_ADMIN_PERMISSIONS = [
  "affiliate.application.review",
  "affiliate.approve",
  "affiliate.suspend",
  "affiliate.terminate",
  "affiliate.fraud.review",
  "affiliate.commission.adjust",
  "affiliate.payout.create",
  "affiliate.payout.approve",
  "affiliate.program.manage",
  "affiliate.creative.manage",
  "affiliate.reconciliation.run",
] as const;
export type AffiliateAdminPermission =
  (typeof AFFILIATE_ADMIN_PERMISSIONS)[number];

/** Read-only permissions preserved for suspended affiliates. */
const READ_PERMISSIONS: readonly AffiliatePermission[] = [
  "affiliate.dashboard.read",
  "affiliate.analytics.read",
  "affiliate.commissions.read",
  "affiliate.payouts.read",
  "affiliate.creatives.read",
];

/**
 * Which affiliate-facing permissions the given membership state grants.
 *
 * - active: everything.
 * - paused: everything except payout profile / payout actions (tracking and
 *   dashboards continue; payouts are frozen). Links/campaigns still editable.
 * - suspended: read only. No new links, no payout or tax changes.
 * - terminated / closed: read only, and only where legally required; the caller
 *   still enforces route-level access. Returns the read set so statements and
 *   history stay viewable.
 */
export function affiliatePermissionsFor(
  state: MembershipState,
): ReadonlySet<AffiliatePermission> {
  switch (state) {
    case "active":
      return new Set(AFFILIATE_PERMISSIONS);
    case "paused":
      return new Set(
        AFFILIATE_PERMISSIONS.filter(
          (p) =>
            p !== "affiliate.payout_profile.manage" &&
            p !== "affiliate.tax.manage",
        ),
      );
    case "suspended":
    case "terminated":
    case "closed":
      return new Set(READ_PERMISSIONS);
    default:
      return new Set<AffiliatePermission>();
  }
}

export function affiliateCan(
  state: MembershipState,
  permission: AffiliatePermission,
): boolean {
  return affiliatePermissionsFor(state).has(permission);
}
