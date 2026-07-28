import "server-only";

import { writeEntitlementSnapshot } from "@/lib/billing/engine";
import { resolveWebhookInboxAction } from "@/lib/billing/webhook-inbox";
import { serviceClient } from "@/lib/supabase/service";

import {
  deactivateLicense,
  loadLicenseByKey,
  upsertLicense,
} from "./licenses";
import { planKeyFromAppsumoTier } from "./tiers";
import type {
  AppsumoWebhookPayload,
  AppsumoWebhookProcessStatus,
} from "./types";

function inboxKey(payload: AppsumoWebhookPayload): string {
  return `${payload.license_key}:${payload.event}:${payload.event_timestamp}`;
}

function isParentDeal(payload: AppsumoWebhookPayload): boolean {
  return !payload.parent_license_key;
}

async function recordInbox(args: {
  payload: AppsumoWebhookPayload;
  organizationId?: string | null;
}): Promise<{ action: "process_new" | "duplicate" | "retry"; attempts: number }> {
  const db = serviceClient();
  const key = inboxKey(args.payload);

  const { data: existing } = await db
    .from("appsumo_webhook_events")
    .select("status, attempts")
    .eq("idempotency_key", key)
    .maybeSingle();

  const priorStatus = existing?.status ?? null;
  const attempts = (existing?.attempts ?? 0) + 1;

  if (!existing) {
    await db.from("appsumo_webhook_events").insert({
      idempotency_key: key,
      license_key: args.payload.license_key,
      event_type: args.payload.event,
      event_timestamp: args.payload.event_timestamp,
      status: "processing",
      attempts: 1,
      payload: args.payload as never,
      organization_id: args.organizationId ?? null,
    } as never);
    return { action: "process_new", attempts: 1 };
  }

  await db
    .from("appsumo_webhook_events")
    .update({
      status: "processing",
      attempts,
      payload: args.payload as never,
    } as never)
    .eq("idempotency_key", key);

  return {
    action: resolveWebhookInboxAction({ inserted: false, priorStatus }),
    attempts,
  };
}

async function markInbox(
  key: string,
  status: "processed" | "failed" | "ignored",
  lastError?: string,
): Promise<void> {
  const db = serviceClient();
  await db
    .from("appsumo_webhook_events")
    .update({
      status,
      processed_at: new Date().toISOString(),
      last_error: lastError ?? null,
    } as never)
    .eq("idempotency_key", key);
}

async function handleLicenseEvent(
  payload: AppsumoWebhookPayload,
): Promise<string | null> {
  const planKey = planKeyFromAppsumoTier(payload.tier);
  const tier = payload.tier ?? 1;

  switch (payload.event) {
    case "purchase":
      await upsertLicense({
        licenseKey: payload.license_key,
        parentLicenseKey: payload.parent_license_key ?? null,
        planKey,
        tier,
        status: "inactive",
        partnerPlanName: payload.partner_plan_name ?? null,
        unitQuantity: payload.unit_quantity ?? null,
      });
      return null;

    case "activate":
      await upsertLicense({
        licenseKey: payload.license_key,
        parentLicenseKey: payload.parent_license_key ?? null,
        planKey,
        tier,
        status: "inactive",
        partnerPlanName: payload.partner_plan_name ?? null,
        unitQuantity: payload.unit_quantity ?? null,
      });
      return null;

    case "upgrade":
    case "downgrade": {
      const prevKey = payload.prev_license_key;
      const prev = prevKey ? await loadLicenseByKey(prevKey) : null;
      const orgId = prev?.organization_id ?? null;
      const userId = prev?.redeemed_by_user_id ?? null;

      await upsertLicense({
        licenseKey: payload.license_key,
        prevLicenseKey: prevKey ?? null,
        parentLicenseKey: payload.parent_license_key ?? null,
        planKey,
        tier,
        status: orgId ? "active" : "inactive",
        partnerPlanName: payload.partner_plan_name ?? null,
        unitQuantity: payload.unit_quantity ?? null,
      });

      if (orgId) {
        const db = serviceClient();
        await db
          .from("appsumo_licenses")
          .update({
            organization_id: orgId,
            redeemed_by_user_id: userId,
            status: "active",
          } as never)
          .eq("license_key", payload.license_key);
      }

      if (prevKey) {
        await deactivateLicense(prevKey);
      }

      return orgId;
    }

    case "migrate": {
      const license = await loadLicenseByKey(payload.license_key);
      if (!license) {
        await upsertLicense({
          licenseKey: payload.license_key,
          parentLicenseKey: payload.parent_license_key ?? null,
          planKey,
          tier,
          status: "active",
          partnerPlanName: payload.partner_plan_name ?? null,
          unitQuantity: payload.unit_quantity ?? null,
        });
      } else {
        const db = serviceClient();
        await db
          .from("appsumo_licenses")
          .update({
            parent_license_key: payload.parent_license_key ?? null,
            unit_quantity: payload.unit_quantity ?? license.unit_quantity,
            partner_plan_name:
              payload.partner_plan_name ?? license.partner_plan_name,
          } as never)
          .eq("license_key", payload.license_key);
      }
      return license?.organization_id ?? null;
    }

    case "deactivate": {
      const orgId = await deactivateLicense(payload.license_key);
      return orgId;
    }

    default:
      return null;
  }
}

/**
 * Process an AppSumo webhook payload. Test events are acknowledged without
 * mutating product state. Returns status for HTTP response selection.
 */
export async function handleAppsumoWebhook(
  payload: AppsumoWebhookPayload,
): Promise<AppsumoWebhookProcessStatus> {
  const key = inboxKey(payload);

  if (payload.test) {
    await recordInbox({ payload });
    await markInbox(key, "processed");
    return "processed";
  }

  // Add-on licenses update parent entitlements indirectly; skip standalone add-ons
  // that are not the primary deal license for now (seats/white-label tracked on row).
  const { action } = await recordInbox({ payload });

  if (action === "duplicate") {
    return "duplicate";
  }

  try {
    const organizationId = await handleLicenseEvent(payload);

    if (organizationId && isParentDeal(payload)) {
      await writeEntitlementSnapshot(organizationId, "appsumo");
    }

    await markInbox(key, "processed");
    return "processed";
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await markInbox(key, "failed", message);
    return "failed";
  }
}
