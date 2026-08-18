"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireOrganizationPermission } from "@/lib/auth/context";
import { AppAuthError } from "@/lib/auth/errors";
import { toActionError, type ActionResult } from "@/lib/app/actions/shared";
import { redeemPromoCode } from "@/lib/promo/redeem";

const redeemSchema = z.object({
  organizationId: z.string().uuid(),
  code: z.string().min(4).max(64),
});

export async function redeemPromoCodeAction(
  organizationId: string,
  code: string,
): Promise<ActionResult<{ planKey: "starter" }>> {
  try {
    const parsed = redeemSchema.parse({ organizationId, code });
    const { profile } = await requireOrganizationPermission(
      parsed.organizationId,
      "billing:manage",
    );

    const result = await redeemPromoCode({
      code: parsed.code,
      organizationId: parsed.organizationId,
      userId: profile.id,
    });

    revalidatePath("/app/settings/billing");
    revalidatePath("/app/onboarding");
    revalidatePath("/app/start/payment");

    return { ok: true, data: result };
  } catch (error) {
    if (error instanceof AppAuthError) {
      return { ok: false, error: error.message };
    }
    return toActionError(error);
  }
}
