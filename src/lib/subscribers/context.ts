import "server-only";

import { appUrl } from "@/lib/env";
import { serviceClient } from "@/lib/supabase/service";

/**
 * Branding + link context for subscriber email and public pages. Pulled from
 * the status page's approved, bounded appearance (never arbitrary HTML/CSS).
 * One loader so every template renders consistent, safe branding.
 */
export interface StatusPageEmailContext {
  statusPageId: string;
  organizationId: string;
  name: string;
  slug: string;
  accentColor: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  supportUrl: string | null;
  privacyUrl: string | null;
  poweredByRemoved: boolean;
  replyTo: string | null;
  timezone: string;
  /** Absolute public URL of the status page. */
  statusPageUrl: string;
}

interface AppearanceShape {
  accent_color?: string;
}

export async function loadStatusPageEmailContext(
  statusPageId: string,
): Promise<StatusPageEmailContext | null> {
  const db = serviceClient();
  const { data } = await db
    .from("status_pages")
    .select(
      "id, organization_id, name, slug, title, appearance, website_url, support_url, timezone, subscriber_privacy_url, subscriber_powered_by_removed, subscriber_reply_to, subscriber_reply_to_verified, logo_asset_id",
    )
    .eq("id", statusPageId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!data) return null;

  let logoUrl: string | null = null;
  if (data.logo_asset_id) {
    const { data: asset } = await db
      .from("status_page_brand_assets")
      .select("public_url")
      .eq("id", data.logo_asset_id)
      .is("deleted_at", null)
      .maybeSingle();
    logoUrl = asset?.public_url ?? null;
  }

  const appearance = (data.appearance ?? {}) as AppearanceShape;
  return {
    statusPageId: data.id,
    organizationId: data.organization_id,
    name: data.title || data.name,
    slug: data.slug,
    accentColor: appearance.accent_color ?? null,
    logoUrl,
    websiteUrl: data.website_url,
    supportUrl: data.support_url,
    privacyUrl: data.subscriber_privacy_url,
    poweredByRemoved: data.subscriber_powered_by_removed,
    replyTo: data.subscriber_reply_to_verified ? data.subscriber_reply_to : null,
    timezone: data.timezone || "UTC",
    statusPageUrl: `${appUrl}/status/${data.slug}`,
  };
}

/** Public confirm link for a raw (unhashed) confirmation token. */
export function confirmationUrl(token: string): string {
  return `${appUrl}/status-subscriptions/confirm?token=${encodeURIComponent(token)}`;
}

/** Public preference-center link for a raw preference token. */
export function preferenceUrl(token: string): string {
  return `${appUrl}/status-subscriptions/preferences?token=${encodeURIComponent(token)}`;
}

/** Public unsubscribe link for a raw preference/unsubscribe token. */
export function unsubscribeUrl(token: string): string {
  return `${appUrl}/status-subscriptions/unsubscribe?token=${encodeURIComponent(token)}`;
}

/** One-click (RFC 8058) unsubscribe POST endpoint for a raw token. */
export function oneClickUnsubscribeUrl(token: string): string {
  return `${appUrl}/api/status-subscriptions/one-click-unsubscribe?token=${encodeURIComponent(token)}`;
}
