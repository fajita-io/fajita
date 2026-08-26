import "server-only";

import { writeEntitlementSnapshot } from "@/lib/billing/engine";
import { Conflict } from "@/lib/auth/errors";

import { isValidPromoCode, normalizePromoCode } from "./codes";
import { insertPromoGrant, loadPromoGrantForOrg } from "./grants";

export async function redeemPromoCode(args: {
  code: string;
  organizationId: string;
  userId: string;
}): Promise<{ planKey: "starter" }> {
  if (!isValidPromoCode(args.code)) {
    throw Conflict("That code is not valid.");
  }

  const existing = await loadPromoGrantForOrg(args.organizationId);
  if (existing) {
    throw Conflict("This organization already redeemed a promo code.");
  }

  const code = normalizePromoCode(args.code);

  await insertPromoGrant({
    organizationId: args.organizationId,
    userId: args.userId,
    planKey: "starter",
    code,
  });

  await writeEntitlementSnapshot(args.organizationId, "promo");

  return { planKey: "starter" };
}
