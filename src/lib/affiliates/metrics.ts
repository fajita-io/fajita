import "server-only";

import { serviceClient } from "@/lib/supabase/service";

/**
 * Affiliate performance metrics. Aggregates the affiliate's own tracking rows
 * into a small, honest funnel: eligible clicks, referred signups, and active
 * conversions. Never exposes customer identity, only the affiliate's counts and
 * a per-campaign breakdown by campaign name.
 */

export interface PerformanceSummary {
  eligibleClicks: number;
  totalClicks: number;
  referredSignups: number;
  activeConversions: number;
  campaigns: {
    campaignId: string | null;
    name: string;
    clicks: number;
  }[];
}

export async function getPerformanceSummary(
  affiliateId: string,
): Promise<PerformanceSummary> {
  const db = serviceClient();

  const { data: clicks } = await db
    .from("affiliate_clicks")
    .select("campaign_id, attribution_eligible")
    .eq("affiliate_id", affiliateId)
    .limit(20000);

  let eligibleClicks = 0;
  const totalClicks = (clicks ?? []).length;
  const byCampaign = new Map<string | null, number>();
  for (const c of clicks ?? []) {
    if (c.attribution_eligible) eligibleClicks += 1;
    byCampaign.set(c.campaign_id, (byCampaign.get(c.campaign_id) ?? 0) + 1);
  }

  // Referred signups: sessions that got attached to a user or organization.
  const { count: signupCount } = await db
    .from("affiliate_sessions")
    .select("id", { count: "exact", head: true })
    .eq("affiliate_id", affiliateId)
    .not("user_id", "is", null);

  // Active conversions: paying referrals still within their eligibility window.
  const { count: conversionCount } = await db
    .from("affiliate_conversions")
    .select("id", { count: "exact", head: true })
    .eq("affiliate_id", affiliateId)
    .in("state", ["active", "holding", "confirmed"]);

  // Resolve campaign names for the breakdown.
  const campaignIds = [...byCampaign.keys()].filter(
    (id): id is string => id !== null,
  );
  const nameById = new Map<string, string>();
  if (campaignIds.length > 0) {
    const { data: campaigns } = await db
      .from("affiliate_campaigns")
      .select("id, name")
      .in("id", campaignIds);
    for (const c of campaigns ?? []) nameById.set(c.id, c.name);
  }

  const campaigns = [...byCampaign.entries()]
    .map(([campaignId, count]) => ({
      campaignId,
      name: campaignId ? nameById.get(campaignId) ?? "Campaign" : "Direct link",
      clicks: count,
    }))
    .sort((a, b) => b.clicks - a.clicks);

  return {
    eligibleClicks,
    totalClicks,
    referredSignups: signupCount ?? 0,
    activeConversions: conversionCount ?? 0,
    campaigns,
  };
}
