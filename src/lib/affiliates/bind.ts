import "server-only";

import { cookies } from "next/headers";

import { REFERRAL_COOKIE_NAME, decodeReferralCookie } from "./cookie";
import {
  attachOrganizationAttribution,
  attachUserToReferralSession,
} from "./tracking";

/**
 * Bind affiliate attribution at the durable organization-creation moment.
 *
 * Reads the signed first-party referral cookie from the request, attaches the
 * signed-in user to the session, and binds (or replaces per last-touch) the
 * organization's attribution. Best-effort: attribution must never block or slow
 * organization creation, and failures are swallowed. The server-side attribution
 * record it writes is what the conversion engine (12D) later reads at
 * Stripe-verified payment time, never the browser cookie.
 */
export async function bindReferralOnOrgCreation(
  organizationId: string,
  userProfileId: string,
): Promise<void> {
  try {
    const store = await cookies();
    const raw = store.get(REFERRAL_COOKIE_NAME)?.value;
    const decoded = decodeReferralCookie(raw);
    if (!decoded) return;
    await attachUserToReferralSession(decoded.sessionId, userProfileId);
    await attachOrganizationAttribution(
      decoded.sessionId,
      organizationId,
      "organization_created",
    );
  } catch {
    // Never let attribution binding break organization creation.
  }
}
