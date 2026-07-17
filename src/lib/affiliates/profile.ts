import "server-only";

import { serviceClient } from "@/lib/supabase/service";

/**
 * Affiliate profile + email preference reads and writes. Profile fields are the
 * affiliate's own display name, contact email, and channels. Email preferences
 * gate optional notification categories (required messages ignore them). All
 * service-role writes; the caller enforces permission and membership state.
 */

export interface AffiliateProfileView {
  displayName: string | null;
  contactEmail: string | null;
  websiteUrl: string | null;
  promotionMethods: string[];
}

export interface AffiliateEmailPreferences {
  conversionNotifications: boolean;
  commissionNotifications: boolean;
  payoutNotifications: boolean;
  programUpdates: boolean;
  educational: boolean;
}

const DEFAULT_PREFS: AffiliateEmailPreferences = {
  conversionNotifications: true,
  commissionNotifications: true,
  payoutNotifications: true,
  programUpdates: true,
  educational: true,
};

export async function getAffiliateProfile(
  affiliateId: string,
): Promise<AffiliateProfileView> {
  const db = serviceClient();
  const { data } = await db
    .from("affiliate_profiles")
    .select("display_name, contact_email, website_url, promotion_methods")
    .eq("affiliate_id", affiliateId)
    .maybeSingle();
  return {
    displayName: data?.display_name ?? null,
    contactEmail: data?.contact_email ?? null,
    websiteUrl: data?.website_url ?? null,
    promotionMethods: data?.promotion_methods ?? [],
  };
}

export async function updateAffiliateProfile(
  affiliateId: string,
  patch: {
    displayName: string | null;
    contactEmail: string | null;
    websiteUrl: string | null;
  },
): Promise<void> {
  const db = serviceClient();
  await db
    .from("affiliate_profiles")
    .upsert(
      {
        affiliate_id: affiliateId,
        display_name: patch.displayName,
        contact_email: patch.contactEmail,
        website_url: patch.websiteUrl,
      } as never,
      { onConflict: "affiliate_id" },
    );
}

export async function getEmailPreferences(
  affiliateId: string,
): Promise<AffiliateEmailPreferences> {
  const db = serviceClient();
  const { data } = await db
    .from("affiliate_email_preferences")
    .select(
      "conversion_notifications, commission_notifications, payout_notifications, program_updates, educational",
    )
    .eq("affiliate_id", affiliateId)
    .maybeSingle();
  if (!data) return { ...DEFAULT_PREFS };
  return {
    conversionNotifications: data.conversion_notifications,
    commissionNotifications: data.commission_notifications,
    payoutNotifications: data.payout_notifications,
    programUpdates: data.program_updates,
    educational: data.educational,
  };
}

export async function updateEmailPreferences(
  affiliateId: string,
  prefs: AffiliateEmailPreferences,
): Promise<void> {
  const db = serviceClient();
  await db
    .from("affiliate_email_preferences")
    .upsert(
      {
        affiliate_id: affiliateId,
        conversion_notifications: prefs.conversionNotifications,
        commission_notifications: prefs.commissionNotifications,
        payout_notifications: prefs.payoutNotifications,
        program_updates: prefs.programUpdates,
        educational: prefs.educational,
      } as never,
      { onConflict: "affiliate_id" },
    );
}
