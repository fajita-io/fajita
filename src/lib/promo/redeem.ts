import "server-only";

import { randomUUID } from "crypto";

import { redeemAppsumoLicense } from "@/lib/appsumo/redeem";
import { upsertLicense } from "@/lib/appsumo/licenses";
import { Conflict } from "@/lib/auth/errors";

import { isValidPromoCode, normalizePromoCode } from "./codes";

export async function redeemPromoCode(args: {
  code: string;
  organizationId: string;
  userId: string;
}): Promise<{ planKey: "starter" }> {
  if (!isValidPromoCode(args.code)) {
    throw Conflict("That code is not valid.");
  }

  const code = normalizePromoCode(args.code);
  const licenseKey = randomUUID();

  await upsertLicense({
    licenseKey,
    planKey: "starter",
    tier: 1,
    status: "inactive",
    partnerPlanName: `promo:${code}`,
  });

  await redeemAppsumoLicense({
    licenseKey,
    organizationId: args.organizationId,
    userId: args.userId,
  });

  return { planKey: "starter" };
}
