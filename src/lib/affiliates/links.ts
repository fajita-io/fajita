import "server-only";

import { appUrl } from "@/lib/env";
import { serviceClient } from "@/lib/supabase/service";
import type { Database } from "@/lib/supabase/types";
import { Conflict, NotFound } from "@/lib/auth/errors";

import { codeRejectionMessage, normalizeCode, validateCode } from "./code";
import { DEFAULT_DESTINATION, resolveDestination } from "./destinations";

export type CodeRow = Database["public"]["Tables"]["affiliate_codes"]["Row"];
export type CampaignRow = Database["public"]["Tables"]["affiliate_campaigns"]["Row"];
export type LinkRow = Database["public"]["Tables"]["affiliate_links"]["Row"];

/**
 * Build a shareable referral URL. These point at real marketing routes with a
 * `?ref=` (and optional `?fjc=` campaign) query. Middleware captures the ref on
 * document navigations and hands off to /api/ref for cookie + click recording.
 */
export function buildReferralUrl(options: {
  code: string;
  destination?: string | null;
  campaignSlug?: string | null;
}): string {
  const destination =
    resolveDestination(options.destination ?? "/") ?? DEFAULT_DESTINATION;
  const url = new URL(destination, appUrl);
  url.searchParams.set("ref", options.code);
  if (options.campaignSlug) url.searchParams.set("fjc", options.campaignSlug);
  return url.toString();
}

/* ------------------------------------------------------------------ */
/* Codes                                                               */
/* ------------------------------------------------------------------ */

export async function listCodes(affiliateId: string): Promise<CodeRow[]> {
  const db = serviceClient();
  const { data } = await db
    .from("affiliate_codes")
    .select("*")
    .eq("affiliate_id", affiliateId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });
  return data ?? [];
}

export async function getDefaultCode(
  affiliateId: string,
): Promise<CodeRow | null> {
  const db = serviceClient();
  const { data } = await db
    .from("affiliate_codes")
    .select("*")
    .eq("affiliate_id", affiliateId)
    .eq("is_default", true)
    .eq("status", "active")
    .maybeSingle();
  return data ?? null;
}

/** Create an additional (non-default) code after validation + uniqueness. */
export async function createCode(
  affiliateId: string,
  rawCode: string,
): Promise<CodeRow> {
  const check = validateCode(rawCode);
  if (!check.ok && check.reason) throw Conflict(codeRejectionMessage(check.reason));
  const normalized = normalizeCode(rawCode);

  const db = serviceClient();
  const { data: existing } = await db
    .from("affiliate_codes")
    .select("id")
    .eq("normalized_code", normalized)
    .maybeSingle();
  if (existing) throw Conflict("That code is already taken. Try another.");

  const { data, error } = await db
    .from("affiliate_codes")
    .insert({
      affiliate_id: affiliateId,
      code: rawCode.trim(),
      normalized_code: normalized,
      is_default: false,
      status: "active",
    })
    .select("*")
    .single();
  if (error) {
    if (error.code === "23505") {
      throw Conflict("That code is already taken. Try another.");
    }
    throw error;
  }
  return data;
}

/* ------------------------------------------------------------------ */
/* Campaigns                                                           */
/* ------------------------------------------------------------------ */

export async function listCampaigns(
  affiliateId: string,
): Promise<CampaignRow[]> {
  const db = serviceClient();
  const { data } = await db
    .from("affiliate_campaigns")
    .select("*")
    .eq("affiliate_id", affiliateId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export async function createCampaign(
  affiliateId: string,
  input: {
    name: string;
    destination?: string | null;
    source?: string | null;
    medium?: string | null;
    contentLabel?: string | null;
  },
): Promise<CampaignRow> {
  const name = input.name.trim();
  if (name.length < 2) throw Conflict("Give the campaign a name.");
  const slug = slugify(name) || `campaign-${Date.now()}`;
  const destination =
    resolveDestination(input.destination ?? "/") ?? DEFAULT_DESTINATION;

  const db = serviceClient();
  const { data, error } = await db
    .from("affiliate_campaigns")
    .insert({
      affiliate_id: affiliateId,
      name,
      slug,
      destination,
      source: input.source?.trim() || null,
      medium: input.medium?.trim() || null,
      content_label: input.contentLabel?.trim() || null,
      status: "active",
    })
    .select("*")
    .single();
  if (error) {
    if (error.code === "23505") {
      throw Conflict("You already have a campaign with that name.");
    }
    throw error;
  }
  return data;
}

export async function archiveCampaign(
  affiliateId: string,
  campaignId: string,
): Promise<void> {
  const db = serviceClient();
  const { data } = await db
    .from("affiliate_campaigns")
    .update({ status: "archived", archived_at: new Date().toISOString() })
    .eq("id", campaignId)
    .eq("affiliate_id", affiliateId)
    .select("id")
    .maybeSingle();
  if (!data) throw NotFound("We could not find that campaign.");
}

/* ------------------------------------------------------------------ */
/* Links                                                               */
/* ------------------------------------------------------------------ */

export interface LinkView {
  id: string;
  destination: string;
  campaignId: string | null;
  campaignSlug: string | null;
  code: string;
  url: string;
  createdAt: string;
}

export async function listLinks(affiliateId: string): Promise<LinkView[]> {
  const db = serviceClient();
  const { data } = await db
    .from("affiliate_links")
    .select(
      "id, destination, campaign_id, created_at, affiliate_codes ( code ), affiliate_campaigns ( slug )",
    )
    .eq("affiliate_id", affiliateId)
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  return (data ?? []).map((row) => {
    const code =
      (row.affiliate_codes as { code: string } | null)?.code ?? "";
    const campaignSlug =
      (row.affiliate_campaigns as { slug: string } | null)?.slug ?? null;
    return {
      id: row.id,
      destination: row.destination,
      campaignId: row.campaign_id,
      campaignSlug,
      code,
      url: buildReferralUrl({
        code,
        destination: row.destination,
        campaignSlug,
      }),
      createdAt: row.created_at,
    };
  });
}

export async function createLink(
  affiliateId: string,
  input: {
    codeId: string;
    destination?: string | null;
    campaignId?: string | null;
    source?: string | null;
    medium?: string | null;
    contentLabel?: string | null;
  },
): Promise<LinkRow> {
  const db = serviceClient();

  const { data: code } = await db
    .from("affiliate_codes")
    .select("id")
    .eq("id", input.codeId)
    .eq("affiliate_id", affiliateId)
    .eq("status", "active")
    .maybeSingle();
  if (!code) throw NotFound("We could not find that code.");

  if (input.campaignId) {
    const { data: campaign } = await db
      .from("affiliate_campaigns")
      .select("id")
      .eq("id", input.campaignId)
      .eq("affiliate_id", affiliateId)
      .maybeSingle();
    if (!campaign) throw NotFound("We could not find that campaign.");
  }

  const destination =
    resolveDestination(input.destination ?? "/") ?? DEFAULT_DESTINATION;
  const { data, error } = await db
    .from("affiliate_links")
    .insert({
      affiliate_id: affiliateId,
      code_id: input.codeId,
      campaign_id: input.campaignId ?? null,
      destination,
      source: input.source?.trim() || null,
      medium: input.medium?.trim() || null,
      content_label: input.contentLabel?.trim() || null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
