import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import type { PlanId } from "@/lib/stripe/plans";

import type { AppsumoLicenseStatus } from "./types";

export interface AppsumoLicenseRow {
  license_key: string;
  prev_license_key: string | null;
  parent_license_key: string | null;
  organization_id: string | null;
  redeemed_by_user_id: string | null;
  plan_key: PlanId;
  tier: number;
  status: AppsumoLicenseStatus;
  partner_plan_name: string | null;
  unit_quantity: number | null;
  deactivated_at: string | null;
  created_at: string;
  updated_at: string;
}

type AppsumoLicenseQuery = {
  select: (columns: string) => AppsumoLicenseQuery;
  eq: (column: string, value: string) => AppsumoLicenseQuery;
  is: (column: string, value: null) => AppsumoLicenseQuery;
  order: (
    column: string,
    options: { ascending: boolean },
  ) => AppsumoLicenseQuery;
  limit: (count: number) => AppsumoLicenseQuery;
  maybeSingle: () => Promise<{
    data: AppsumoLicenseRow | null;
    error: Error | null;
  }>;
};

function appsumoLicensesTable(db: ReturnType<typeof serviceClient>) {
  return db.from("appsumo_licenses" as never) as unknown as AppsumoLicenseQuery;
}

export async function loadLicenseByKey(
  licenseKey: string,
): Promise<AppsumoLicenseRow | null> {
  const db = serviceClient();
  const { data, error } = await appsumoLicensesTable(db)
    .select("*")
    .eq("license_key", licenseKey)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function loadActiveLicenseForOrg(
  organizationId: string,
): Promise<AppsumoLicenseRow | null> {
  const db = serviceClient();
  const { data, error } = await appsumoLicensesTable(db)
    .select("*")
    .eq("organization_id", organizationId)
    .eq("status", "active")
    .is("parent_license_key", null)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertLicense(args: {
  licenseKey: string;
  prevLicenseKey?: string | null;
  parentLicenseKey?: string | null;
  planKey: PlanId;
  tier: number;
  status: AppsumoLicenseStatus;
  partnerPlanName?: string | null;
  unitQuantity?: number | null;
}): Promise<void> {
  const db = serviceClient();
  const row = {
    license_key: args.licenseKey,
    prev_license_key: args.prevLicenseKey ?? null,
    parent_license_key: args.parentLicenseKey ?? null,
    plan_key: args.planKey,
    tier: args.tier,
    status: args.status,
    partner_plan_name: args.partnerPlanName ?? null,
    unit_quantity: args.unitQuantity ?? null,
    deactivated_at: args.status === "deactivated" ? new Date().toISOString() : null,
  };

  await db.from("appsumo_licenses").upsert(row as never, {
    onConflict: "license_key",
  });
}

export async function deactivateLicense(licenseKey: string): Promise<string | null> {
  const db = serviceClient();
  const existing = await loadLicenseByKey(licenseKey);
  if (!existing) return null;

  await db
    .from("appsumo_licenses")
    .update({
      status: "deactivated",
      deactivated_at: new Date().toISOString(),
    } as never)
    .eq("license_key", licenseKey);

  return existing.organization_id;
}

export async function bindLicenseToOrg(args: {
  licenseKey: string;
  organizationId: string;
  userId: string;
}): Promise<void> {
  const db = serviceClient();
  const { error } = await db
    .from("appsumo_licenses")
    .update({
      organization_id: args.organizationId,
      redeemed_by_user_id: args.userId,
      status: "active",
    } as never)
    .eq("license_key", args.licenseKey);
  if (error) throw error;
}
