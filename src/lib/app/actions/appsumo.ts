"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireOrganizationPermission } from "@/lib/auth/context";
import { redeemAppsumoLicense } from "@/lib/appsumo/redeem";
import { AppAuthError } from "@/lib/auth/errors";
import { DataFastGoals, trackServerGoal } from "@/lib/analytics";
import { toActionError, type ActionResult } from "@/lib/app/actions/shared";

const redeemSchema = z.object({
  organizationId: z.string().uuid(),
  licenseKey: z.string().uuid(),
});

export async function redeemAppsumoLicenseAction(
  organizationId: string,
  licenseKey: string,
): Promise<ActionResult<{ licenseKey: string }>> {
  try {
    const parsed = redeemSchema.parse({ organizationId, licenseKey });
    const { profile } = await requireOrganizationPermission(
      parsed.organizationId,
      "billing:manage",
    );

    const result = await redeemAppsumoLicense({
      licenseKey: parsed.licenseKey,
      organizationId: parsed.organizationId,
      userId: profile.id,
    });

    await trackServerGoal({
      name: DataFastGoals.appsumoLicenseRedeemed,
      metadata: { source: "appsumo" },
    });

    revalidatePath("/app/settings/billing");
    revalidatePath("/app/onboarding");

    return { ok: true, data: { licenseKey: result.licenseKey } };
  } catch (error) {
    if (error instanceof AppAuthError) {
      return { ok: false, error: error.message };
    }
    return toActionError(error);
  }
}

export async function redeemAppsumoLicenseAndContinueAction(
  organizationId: string,
  licenseKey: string,
): Promise<void> {
  const result = await redeemAppsumoLicenseAction(organizationId, licenseKey);
  if (!result.ok) {
    redirect(
      `/app/start/appsumo?license_key=${encodeURIComponent(licenseKey)}&error=${encodeURIComponent(result.error)}`,
    );
  }
  redirect("/app/onboarding");
}
