import "server-only";

import { requireActiveContext } from "@/lib/app/page-context";
import { forbiddenRedirect } from "@/lib/app/guards";
import { can, roleAtLeast } from "@/lib/auth/roles";
import type { ProfileRow } from "@/lib/auth/provisioning";
import type { Membership } from "@/lib/app/organizations";
import { computeOrgBillingState, type OrgBillingState } from "@/lib/billing/engine";
import { getUsageSnapshot, type UsageSnapshot } from "@/lib/billing/usage";

export interface BillingPageData {
  profile: ProfileRow;
  membership: Membership;
  organizationId: string;
  state: OrgBillingState;
  usage: UsageSnapshot;
  /** True when the caller may mutate billing (owner). */
  canManage: boolean;
}

/**
 * Context for every billing settings page. Requires at least admin to read
 * (RLS mirrors this); mutations require the billing permission (owner). Reaching
 * a billing route without read access shows not-found, never a leak.
 */
export async function requireBillingContext(): Promise<BillingPageData> {
  const { profile, membership } = await requireActiveContext();
  if (!roleAtLeast(membership.role, "admin")) forbiddenRedirect();

  const organizationId = membership.organization.id;
  const [state, usage] = await Promise.all([
    computeOrgBillingState(organizationId),
    getUsageSnapshot(organizationId),
  ]);

  return {
    profile,
    membership,
    organizationId,
    state,
    usage,
    canManage: can(membership.role, "billing:manage"),
  };
}
