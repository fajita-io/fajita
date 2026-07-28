import "server-only";

import { writeEntitlementSnapshot } from "@/lib/billing/engine";
import { Conflict, NotFound } from "@/lib/auth/errors";

import { bindLicenseToOrg, loadLicenseByKey } from "./licenses";
import type { AppsumoLicenseStatus } from "./types";

export interface RedeemAppsumoLicenseResult {
  licenseKey: string;
  status: AppsumoLicenseStatus;
  organizationId: string;
}

/**
 * Bind an AppSumo license key to an organization after OAuth.
 * Idempotent when the same org already owns the license.
 */
export async function redeemAppsumoLicense(args: {
  licenseKey: string;
  organizationId: string;
  userId: string;
}): Promise<RedeemAppsumoLicenseResult> {
  const license = await loadLicenseByKey(args.licenseKey);
  if (!license) {
    throw NotFound("That license key was not found. Check AppSumo and try again.");
  }

  if (license.status === "deactivated") {
    throw Conflict(
      "That AppSumo license is no longer active. Contact support if you think this is a mistake.",
    );
  }

  if (
    license.organization_id &&
    license.organization_id !== args.organizationId
  ) {
    throw Conflict(
      "That license is already linked to another organization. Contact support with your license key.",
    );
  }

  if (!license.organization_id) {
    await bindLicenseToOrg({
      licenseKey: args.licenseKey,
      organizationId: args.organizationId,
      userId: args.userId,
    });
  }

  await writeEntitlementSnapshot(args.organizationId, "appsumo");

  return {
    licenseKey: args.licenseKey,
    status: "active",
    organizationId: args.organizationId,
  };
}
