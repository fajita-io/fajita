import "server-only";

import { redirect } from "next/navigation";

import { requireAuthenticatedUser } from "@/lib/auth/context";
import type { ProfileRow } from "@/lib/auth/provisioning";
import { readActiveOrgId } from "./active-org";
import { resolveActiveOrg, type Membership } from "./organizations";

export interface ActiveContext {
  profile: ProfileRow;
  membership: Membership;
}

/**
 * Server-side context for any shell page that requires an active organization.
 * Re-derives the caller from the session (never trusts the client) and resolves
 * the active org from the cookie, falling back to a real membership. Sends
 * users with no organization into the first-organization flow.
 */
export async function requireActiveContext(): Promise<ActiveContext> {
  const profile = await requireAuthenticatedUser();
  const requested = await readActiveOrgId();
  const active = await resolveActiveOrg(profile.id, requested);
  if (!active) redirect("/app/new-organization");
  return { profile, membership: active };
}
