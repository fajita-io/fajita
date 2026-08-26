import "server-only";

import { serviceClient } from "@/lib/supabase/service";
import type { PlanId } from "@/lib/stripe/plans";

export interface PromoGrantRow {
  id: string;
  organization_id: string;
  redeemed_by_user_id: string | null;
  plan_key: PlanId;
  code: string;
  redeemed_at: string;
}

export async function loadPromoGrantForOrg(
  organizationId: string,
): Promise<PromoGrantRow | null> {
  const db = serviceClient();
  const { data, error } = await db
    .from("promo_grants")
    .select("*")
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (error) throw error;
  return data as PromoGrantRow | null;
}

export async function insertPromoGrant(args: {
  organizationId: string;
  userId: string;
  planKey: PlanId;
  code: string;
}): Promise<void> {
  const db = serviceClient();
  const { error } = await db.from("promo_grants").insert({
    organization_id: args.organizationId,
    redeemed_by_user_id: args.userId,
    plan_key: args.planKey,
    code: args.code,
  });
  if (error) throw error;
}
