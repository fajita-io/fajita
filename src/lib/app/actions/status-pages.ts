"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { DataFastGoals } from "@/lib/analytics/goals";
import { trackGoal } from "@/lib/analytics/server";
import { recordAuditEvent, type AuditAction } from "@/lib/app/audit";
import { type ActionResult, toActionError } from "@/lib/app/actions/shared";
import { isFeatureEnabled } from "@/lib/app/feature-flags.server";
import {
  isPlatformAdmin,
  requireOrganizationPermission,
  type OrgAccess,
} from "@/lib/auth/context";
import { Forbidden, RateLimited } from "@/lib/auth/errors";
import { rateLimit } from "@/lib/site/rate-limit";
import {
  COMPONENT_CALCULATION_MODES,
  PUBLIC_COMPONENT_STATES,
  STATUS_PAGE_THEMES,
} from "@/lib/status-pages/constants";
import { validateSubdomain } from "@/lib/status-pages/slug";
import { validateAppearance } from "@/lib/status-pages/appearance";
import {
  createStatusPage,
  getStatusPage,
  isSlugAvailable,
  softDeleteStatusPage,
  updateStatusPage,
} from "@/lib/status-pages/status-pages";
import {
  createComponent,
  createComponentGroup,
  deleteComponent,
  deleteComponentGroup,
  reorderComponents,
  setComponentMonitors,
  updateComponent,
  updateComponentGroup,
} from "@/lib/status-pages/components";
import { publishStatusPage, rollbackToVersion, unpublishStatusPage } from "@/lib/status-pages/publish";
import { refreshSnapshot } from "@/lib/status-pages/projection";
import {
  addCustomDomain,
  removeDomain,
  rotateDomainToken,
  setPrimaryDomain,
  verifyDomain,
} from "@/lib/status-pages/domains";
import type { DnsInstructions } from "@/lib/status-pages/domain-util";
import {
  createManualMessage,
  publishIncidentToStatusPage,
  publishMaintenanceToStatusPage,
  unpublishIncidentFromStatusPage,
  unpublishMaintenanceFromStatusPage,
} from "@/lib/status-pages/publication";

/**
 * Server actions for the status-page product. Every action verifies a status
 * page permission, confirms the feature is available, rate-limits by actor, and
 * audits. Public output only changes through the projection: any action that
 * affects a published page rebuilds its snapshot.
 */

async function requireManage(organizationId: string): Promise<OrgAccess> {
  const access = await requireOrganizationPermission(organizationId, "status_pages:manage");
  const admin = await isPlatformAdmin();
  const enabled = await isFeatureEnabled("statusPages", organizationId);
  if (!admin && !enabled) throw Forbidden("Status pages are not available yet.");
  return access;
}

async function requirePublish(organizationId: string): Promise<OrgAccess> {
  const access = await requireOrganizationPermission(organizationId, "status_pages:publish");
  const admin = await isPlatformAdmin();
  const enabled = await isFeatureEnabled("statusPages", organizationId);
  if (!admin && !enabled) throw Forbidden("Status pages are not available yet.");
  return access;
}

function limitOrThrow(profileId: string, bucket: string, perMinute: number) {
  if (!rateLimit(`status_page:${bucket}:${profileId}`, { limit: perMinute, windowMs: 60_000 })) {
    throw RateLimited();
  }
}

async function audit(
  organizationId: string,
  actorUserId: string,
  action: AuditAction,
  targetId: string | undefined,
  summary: string,
  metadata?: Record<string, unknown>,
) {
  await recordAuditEvent({
    organizationId,
    actorUserId,
    action,
    targetType: "status_page",
    targetId,
    summary,
    metadata,
  });
}

/** Rebuild the public snapshot when the page is live. Safe no-op for drafts. */
async function refreshIfPublished(organizationId: string, statusPageId: string) {
  const page = await getStatusPage(organizationId, statusPageId);
  if (page?.status === "published") {
    await refreshSnapshot(organizationId, statusPageId).catch((e) =>
      console.error("[status-page] snapshot refresh failed", e),
    );
  }
  revalidatePath(`/status/${page?.slug ?? ""}`);
}

/* ------------------------------------------------------------------ */
/* Create                                                              */
/* ------------------------------------------------------------------ */

export async function checkSubdomainAction(
  organizationId: string,
  candidate: string,
): Promise<ActionResult<{ slug: string; available: boolean }>> {
  try {
    await requireManage(organizationId);
    const validation = validateSubdomain(candidate);
    if (!validation.ok) return { ok: false, error: validation.reason };
    const available = await isSlugAvailable(validation.slug);
    return { ok: true, data: { slug: validation.slug, available } };
  } catch (error) {
    return toActionError(error);
  }
}

const createSchema = z.object({
  name: z.string().trim().min(1).max(120),
  subdomain: z.string().trim().min(3).max(40),
  timezone: z.string().trim().min(1).max(64).default("UTC"),
});

export async function createStatusPageAction(
  organizationId: string,
  input: unknown,
): Promise<ActionResult<{ statusPageId: string; slug: string }>> {
  try {
    const access = await requireManage(organizationId);
    limitOrThrow(access.profile.id, "create", 10);
    const data = createSchema.parse(input);

    const validation = validateSubdomain(data.subdomain);
    if (!validation.ok) return { ok: false, error: validation.reason };
    if (!(await isSlugAvailable(validation.slug))) {
      return { ok: false, error: "That subdomain is taken. Try another." };
    }

    const statusPageId = await createStatusPage({
      organizationId,
      actorProfileId: access.profile.id,
      name: data.name,
      slug: validation.slug,
      timezone: data.timezone,
    });

    await audit(organizationId, access.profile.id, "status_page.created", statusPageId, `Created status page "${data.name}"`);
    await trackGoal({ name: DataFastGoals.statusPageCreated }).catch(() => {});

    revalidatePath("/app/status-pages");
    return { ok: true, data: { statusPageId, slug: validation.slug } };
  } catch (error) {
    return toActionError(error);
  }
}

/* ------------------------------------------------------------------ */
/* Settings / appearance / display / seo                               */
/* ------------------------------------------------------------------ */

const settingsSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  title: z.string().trim().max(120).nullish(),
  description: z.string().trim().max(2000).nullish(),
  headline: z.string().trim().max(200).nullish(),
  supportUrl: z.string().trim().url().max(2000).nullish().or(z.literal("")),
  websiteUrl: z.string().trim().url().max(2000).nullish().or(z.literal("")),
  timezone: z.string().trim().min(1).max(64).optional(),
});

export async function updateStatusPageSettingsAction(
  organizationId: string,
  statusPageId: string,
  input: unknown,
): Promise<ActionResult> {
  try {
    const access = await requireManage(organizationId);
    limitOrThrow(access.profile.id, "update", 60);
    const data = settingsSchema.parse(input);
    await updateStatusPage(organizationId, statusPageId, access.profile.id, {
      ...data,
      supportUrl: data.supportUrl === "" ? null : data.supportUrl,
      websiteUrl: data.websiteUrl === "" ? null : data.websiteUrl,
    });
    await audit(organizationId, access.profile.id, "status_page.updated", statusPageId, "Updated status page settings");
    await refreshIfPublished(organizationId, statusPageId);
    revalidatePath(`/app/status-pages/${statusPageId}`);
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

const appearanceSchema = z.object({
  themeKey: z.enum(STATUS_PAGE_THEMES),
  accentColor: z.string().trim().max(9),
  density: z.enum(["comfortable", "compact"]),
  radius: z.enum(["sharp", "soft", "round"]),
  headerStyle: z.enum(["minimal", "bordered"]),
});

export async function updateAppearanceAction(
  organizationId: string,
  statusPageId: string,
  input: unknown,
): Promise<ActionResult> {
  try {
    const access = await requireManage(organizationId);
    limitOrThrow(access.profile.id, "appearance", 60);
    const data = appearanceSchema.parse(input);
    const validated = validateAppearance(
      { accentColor: data.accentColor, density: data.density, radius: data.radius, headerStyle: data.headerStyle },
      data.themeKey,
    );
    if (!validated.ok) return { ok: false, error: validated.reason };

    await updateStatusPage(organizationId, statusPageId, access.profile.id, {
      themeKey: data.themeKey,
      appearance: validated.appearance,
    });
    await audit(organizationId, access.profile.id, "status_page.appearance_updated", statusPageId, "Updated appearance");
    await trackGoal({ name: DataFastGoals.statusPageThemeSelected, metadata: { theme: data.themeKey } }).catch(() => {});
    await refreshIfPublished(organizationId, statusPageId);
    revalidatePath(`/app/status-pages/${statusPageId}/appearance`);
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

const displaySchema = z.object({
  showUptimeHistory: z.boolean().optional(),
  showResponseTime: z.boolean().optional(),
  showIncidentHistory: z.boolean().optional(),
  showScheduledMaintenance: z.boolean().optional(),
  showComponentDescriptions: z.boolean().optional(),
  showSubscriberForm: z.boolean().optional(),
  poweredByVisible: z.boolean().optional(),
  uptimeHistoryDays: z.union([z.literal(7), z.literal(30), z.literal(90)]).optional(),
  incidentHistoryWindow: z.enum(["seven_days", "thirty_days", "ninety_days", "twelve_months", "full"]).optional(),
  autoPublishIncidents: z.enum(["never", "draft_only", "major_critical", "all"]).optional(),
  publicStateDelaySeconds: z.number().int().min(0).max(900).optional(),
});

export async function updateDisplayAction(
  organizationId: string,
  statusPageId: string,
  input: unknown,
): Promise<ActionResult> {
  try {
    const access = await requireManage(organizationId);
    limitOrThrow(access.profile.id, "display", 60);
    const data = displaySchema.parse(input);
    // Powered-by removal requires the entitlement (billing not yet live).
    if (data.poweredByVisible === false) {
      const admin = await isPlatformAdmin();
      if (!admin) {
        return {
          ok: false,
          error: "Removing the Powered by Fajita attribution is not available on your plan yet.",
        };
      }
    }
    await updateStatusPage(organizationId, statusPageId, access.profile.id, data);
    await audit(organizationId, access.profile.id, "status_page.updated", statusPageId, "Updated display settings");
    await refreshIfPublished(organizationId, statusPageId);
    revalidatePath(`/app/status-pages/${statusPageId}/settings`);
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

const seoSchema = z.object({
  searchIndexingEnabled: z.boolean().optional(),
  indexIncidentArchive: z.boolean().optional(),
  indexIndividualIncidents: z.boolean().optional(),
});

export async function updateSeoAction(
  organizationId: string,
  statusPageId: string,
  input: unknown,
): Promise<ActionResult> {
  try {
    const access = await requireManage(organizationId);
    limitOrThrow(access.profile.id, "seo", 60);
    const data = seoSchema.parse(input);
    await updateStatusPage(organizationId, statusPageId, access.profile.id, data);
    await audit(organizationId, access.profile.id, "status_page.updated", statusPageId, "Updated SEO settings");
    await trackGoal({ name: DataFastGoals.statusPageSeoSettingChanged }).catch(() => {});
    await refreshIfPublished(organizationId, statusPageId);
    revalidatePath(`/app/status-pages/${statusPageId}/seo`);
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

/* ------------------------------------------------------------------ */
/* Components + groups                                                  */
/* ------------------------------------------------------------------ */

const componentSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(2000).nullish(),
  groupId: z.string().uuid().nullish(),
  calculationMode: z.enum(COMPONENT_CALCULATION_MODES).default("any_critical"),
  monitorIds: z.array(z.string().uuid()).max(50).default([]),
  showUptime: z.boolean().default(true),
  showResponseTime: z.boolean().default(false),
});

export async function createComponentAction(
  organizationId: string,
  statusPageId: string,
  input: unknown,
): Promise<ActionResult<{ componentId: string }>> {
  try {
    const access = await requireManage(organizationId);
    limitOrThrow(access.profile.id, "component", 60);
    const data = componentSchema.parse(input);
    const componentId = await createComponent({
      organizationId,
      statusPageId,
      name: data.name,
      description: data.description ?? null,
      groupId: data.groupId ?? null,
      calculationMode: data.calculationMode,
      monitorIds: data.monitorIds,
      showUptime: data.showUptime,
      showResponseTime: data.showResponseTime,
    });
    await audit(organizationId, access.profile.id, "status_page.component_created", statusPageId, `Added component "${data.name}"`);
    await trackGoal({ name: DataFastGoals.statusPageComponentCreated }).catch(() => {});
    if (data.monitorIds.length > 0) {
      await trackGoal({ name: DataFastGoals.statusPageMonitorMapped }).catch(() => {});
    }
    await refreshIfPublished(organizationId, statusPageId);
    revalidatePath(`/app/status-pages/${statusPageId}/components`);
    return { ok: true, data: { componentId } };
  } catch (error) {
    return toActionError(error);
  }
}

const componentPatchSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  description: z.string().trim().max(2000).nullish(),
  groupId: z.string().uuid().nullish(),
  calculationMode: z.enum(COMPONENT_CALCULATION_MODES).optional(),
  visibility: z.enum(["visible", "hidden"]).optional(),
  showUptime: z.boolean().optional(),
  showResponseTime: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  manualStatus: z.enum(PUBLIC_COMPONENT_STATES).nullish(),
  manualStatusReason: z.string().trim().max(500).nullish(),
  manualStatusUntil: z.string().datetime({ offset: true }).nullish(),
  monitorIds: z.array(z.string().uuid()).max(50).optional(),
});

export async function updateComponentAction(
  organizationId: string,
  statusPageId: string,
  componentId: string,
  input: unknown,
): Promise<ActionResult> {
  try {
    const access = await requireManage(organizationId);
    limitOrThrow(access.profile.id, "component", 120);
    const data = componentPatchSchema.parse(input);
    const { monitorIds, ...patch } = data;
    await updateComponent({ organizationId, statusPageId, componentId, patch });
    if (monitorIds !== undefined) {
      await setComponentMonitors({ organizationId, statusPageId, componentId, monitorIds });
    }
    await audit(organizationId, access.profile.id, "status_page.component_updated", statusPageId, "Updated a component");
    await refreshIfPublished(organizationId, statusPageId);
    revalidatePath(`/app/status-pages/${statusPageId}/components`);
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteComponentAction(
  organizationId: string,
  statusPageId: string,
  componentId: string,
): Promise<ActionResult> {
  try {
    const access = await requireManage(organizationId);
    limitOrThrow(access.profile.id, "component", 60);
    await deleteComponent({ organizationId, statusPageId, componentId });
    await audit(organizationId, access.profile.id, "status_page.component_deleted", statusPageId, "Removed a component");
    await refreshIfPublished(organizationId, statusPageId);
    revalidatePath(`/app/status-pages/${statusPageId}/components`);
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function reorderComponentsAction(
  organizationId: string,
  statusPageId: string,
  orderedIds: string[],
): Promise<ActionResult> {
  try {
    const access = await requireManage(organizationId);
    limitOrThrow(access.profile.id, "component", 120);
    const ids = z.array(z.string().uuid()).max(200).parse(orderedIds);
    await reorderComponents({ organizationId, statusPageId, orderedIds: ids });
    await refreshIfPublished(organizationId, statusPageId);
    revalidatePath(`/app/status-pages/${statusPageId}/components`);
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

const groupSchema = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(2000).nullish(),
});

export async function createGroupAction(
  organizationId: string,
  statusPageId: string,
  input: unknown,
): Promise<ActionResult<{ groupId: string }>> {
  try {
    const access = await requireManage(organizationId);
    limitOrThrow(access.profile.id, "group", 60);
    const data = groupSchema.parse(input);
    const groupId = await createComponentGroup({
      organizationId,
      statusPageId,
      name: data.name,
      description: data.description ?? null,
    });
    await audit(organizationId, access.profile.id, "status_page.group_created", statusPageId, `Added group "${data.name}"`);
    await refreshIfPublished(organizationId, statusPageId);
    revalidatePath(`/app/status-pages/${statusPageId}/components`);
    return { ok: true, data: { groupId } };
  } catch (error) {
    return toActionError(error);
  }
}

export async function updateGroupAction(
  organizationId: string,
  statusPageId: string,
  groupId: string,
  input: unknown,
): Promise<ActionResult> {
  try {
    const access = await requireManage(organizationId);
    limitOrThrow(access.profile.id, "group", 60);
    const data = z
      .object({
        name: z.string().trim().min(1).max(80).optional(),
        description: z.string().trim().max(2000).nullish(),
        collapsedByDefault: z.boolean().optional(),
        isHidden: z.boolean().optional(),
      })
      .parse(input);
    await updateComponentGroup({ organizationId, groupId, patch: data });
    await audit(organizationId, access.profile.id, "status_page.group_updated", statusPageId, "Updated a group");
    await refreshIfPublished(organizationId, statusPageId);
    revalidatePath(`/app/status-pages/${statusPageId}/components`);
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteGroupAction(
  organizationId: string,
  statusPageId: string,
  groupId: string,
): Promise<ActionResult> {
  try {
    const access = await requireManage(organizationId);
    limitOrThrow(access.profile.id, "group", 60);
    await deleteComponentGroup({ organizationId, statusPageId, groupId });
    await audit(organizationId, access.profile.id, "status_page.group_deleted", statusPageId, "Removed a group");
    await refreshIfPublished(organizationId, statusPageId);
    revalidatePath(`/app/status-pages/${statusPageId}/components`);
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

/* ------------------------------------------------------------------ */
/* Publish / unpublish / rollback / delete                             */
/* ------------------------------------------------------------------ */

export async function publishStatusPageAction(
  organizationId: string,
  statusPageId: string,
): Promise<ActionResult<{ versionNumber: number }>> {
  try {
    const access = await requirePublish(organizationId);
    limitOrThrow(access.profile.id, "publish", 20);
    await trackGoal({ name: DataFastGoals.statusPagePublishAttempted }).catch(() => {});
    const result = await publishStatusPage({ organizationId, statusPageId, actorProfileId: access.profile.id });
    if (!result.ok) {
      await trackGoal({ name: DataFastGoals.statusPagePublishFailed }).catch(() => {});
      return { ok: false, error: result.issues.map((i) => i.message).join(" ") };
    }
    await audit(organizationId, access.profile.id, "status_page.published", statusPageId, "Published status page", {
      version: result.versionNumber,
    });
    await trackGoal({ name: DataFastGoals.statusPagePublishSucceeded }).catch(() => {});
    await trackGoal({ name: DataFastGoals.statusPagePublished }).catch(() => {});
    revalidatePath(`/app/status-pages/${statusPageId}`);
    return { ok: true, data: { versionNumber: result.versionNumber } };
  } catch (error) {
    return toActionError(error);
  }
}

export async function unpublishStatusPageAction(
  organizationId: string,
  statusPageId: string,
): Promise<ActionResult> {
  try {
    const access = await requirePublish(organizationId);
    limitOrThrow(access.profile.id, "publish", 20);
    await unpublishStatusPage({ organizationId, statusPageId });
    await audit(organizationId, access.profile.id, "status_page.unpublished", statusPageId, "Unpublished status page");
    await trackGoal({ name: DataFastGoals.statusPageUnpublished }).catch(() => {});
    revalidatePath(`/app/status-pages/${statusPageId}`);
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function rollbackStatusPageAction(
  organizationId: string,
  statusPageId: string,
  versionId: string,
): Promise<ActionResult> {
  try {
    const access = await requirePublish(organizationId);
    limitOrThrow(access.profile.id, "publish", 20);
    await trackGoal({ name: DataFastGoals.statusPageVersionRollbackStarted }).catch(() => {});
    const result = await rollbackToVersion({ organizationId, statusPageId, actorProfileId: access.profile.id, versionId });
    if (!result.ok) return { ok: false, error: result.issues.map((i) => i.message).join(" ") };
    await audit(organizationId, access.profile.id, "status_page.version_rolled_back", statusPageId, "Rolled back to a previous version");
    await trackGoal({ name: DataFastGoals.statusPageVersionRollbackCompleted }).catch(() => {});
    revalidatePath(`/app/status-pages/${statusPageId}`);
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function deleteStatusPageAction(
  organizationId: string,
  statusPageId: string,
): Promise<ActionResult> {
  try {
    const access = await requirePublish(organizationId);
    limitOrThrow(access.profile.id, "delete", 10);
    await softDeleteStatusPage(organizationId, statusPageId);
    await audit(organizationId, access.profile.id, "status_page.deleted", statusPageId, "Deleted status page");
    revalidatePath("/app/status-pages");
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

/* ------------------------------------------------------------------ */
/* Domains                                                             */
/* ------------------------------------------------------------------ */

export async function addDomainAction(
  organizationId: string,
  statusPageId: string,
  domain: string,
): Promise<ActionResult<{ domainId: string; instructions: DnsInstructions }>> {
  try {
    const access = await requirePublish(organizationId);
    limitOrThrow(access.profile.id, "domain", 20);
    await trackGoal({ name: DataFastGoals.statusPageCustomDomainStarted }).catch(() => {});
    const result = await addCustomDomain({
      organizationId,
      statusPageId,
      actorProfileId: access.profile.id,
      domain,
    });
    if (!result.ok) return { ok: false, error: result.reason };
    await audit(organizationId, access.profile.id, "status_page.domain_added", statusPageId, "Added a custom domain");
    revalidatePath(`/app/status-pages/${statusPageId}/domain`);
    return { ok: true, data: { domainId: result.domainId, instructions: result.instructions } };
  } catch (error) {
    return toActionError(error);
  }
}

export async function verifyDomainAction(
  organizationId: string,
  statusPageId: string,
  domainId: string,
): Promise<ActionResult<{ status: string; reason?: string }>> {
  try {
    const access = await requirePublish(organizationId);
    limitOrThrow(access.profile.id, "domain_verify", 30);
    const result = await verifyDomain({ organizationId, domainId });
    if (result.status === "verified") {
      await audit(organizationId, access.profile.id, "status_page.domain_verified", statusPageId, "Verified a custom domain");
      await trackGoal({ name: DataFastGoals.statusPageDomainVerified }).catch(() => {});
    }
    revalidatePath(`/app/status-pages/${statusPageId}/domain`);
    return { ok: true, data: result };
  } catch (error) {
    return toActionError(error);
  }
}

export async function rotateDomainTokenAction(
  organizationId: string,
  statusPageId: string,
  domainId: string,
): Promise<ActionResult<{ instructions: DnsInstructions }>> {
  try {
    const access = await requirePublish(organizationId);
    limitOrThrow(access.profile.id, "domain", 20);
    const result = await rotateDomainToken({ organizationId, domainId });
    if (!result.ok) return { ok: false, error: result.reason };
    revalidatePath(`/app/status-pages/${statusPageId}/domain`);
    return { ok: true, data: { instructions: result.instructions } };
  } catch (error) {
    return toActionError(error);
  }
}

export async function setPrimaryDomainAction(
  organizationId: string,
  statusPageId: string,
  domainId: string,
): Promise<ActionResult> {
  try {
    const access = await requirePublish(organizationId);
    limitOrThrow(access.profile.id, "domain", 20);
    const result = await setPrimaryDomain({ organizationId, statusPageId, domainId });
    if (!result.ok) return { ok: false, error: result.reason ?? "Could not set primary domain." };
    await audit(organizationId, access.profile.id, "status_page.domain_primary_changed", statusPageId, "Changed the primary domain");
    revalidatePath(`/app/status-pages/${statusPageId}/domain`);
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function removeDomainAction(
  organizationId: string,
  statusPageId: string,
  domainId: string,
): Promise<ActionResult> {
  try {
    const access = await requirePublish(organizationId);
    limitOrThrow(access.profile.id, "domain", 20);
    const result = await removeDomain({ organizationId, statusPageId, domainId });
    if (!result.ok) return { ok: false, error: result.reason ?? "Could not remove domain." };
    await audit(organizationId, access.profile.id, "status_page.domain_removed", statusPageId, "Removed a custom domain");
    revalidatePath(`/app/status-pages/${statusPageId}/domain`);
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

/* ------------------------------------------------------------------ */
/* Incident / maintenance / notice publication                         */
/* ------------------------------------------------------------------ */

const publishIncidentSchema = z.object({
  incidentId: z.string().uuid(),
  publicTitle: z.string().trim().max(200).optional(),
  publicSummary: z.string().trim().max(2000).optional(),
});

export async function publishIncidentAction(
  organizationId: string,
  statusPageId: string,
  input: unknown,
): Promise<ActionResult> {
  try {
    const access = await requirePublish(organizationId);
    limitOrThrow(access.profile.id, "incident_publish", 40);
    const data = publishIncidentSchema.parse(input);
    const result = await publishIncidentToStatusPage({
      organizationId,
      statusPageId,
      incidentId: data.incidentId,
      actorProfileId: access.profile.id,
      publicTitle: data.publicTitle,
      publicSummary: data.publicSummary,
    });
    if (!result.ok) return { ok: false, error: result.reason };
    await audit(organizationId, access.profile.id, "status_page.incident_published", statusPageId, "Published an incident");
    await trackGoal({ name: DataFastGoals.statusPageIncidentPublished }).catch(() => {});
    await refreshIfPublished(organizationId, statusPageId);
    revalidatePath(`/app/status-pages/${statusPageId}/incidents`);
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function unpublishIncidentAction(
  organizationId: string,
  statusPageId: string,
  incidentId: string,
): Promise<ActionResult> {
  try {
    const access = await requirePublish(organizationId);
    limitOrThrow(access.profile.id, "incident_publish", 40);
    await unpublishIncidentFromStatusPage({ organizationId, statusPageId, incidentId });
    await audit(organizationId, access.profile.id, "status_page.incident_unpublished", statusPageId, "Unpublished an incident");
    await refreshIfPublished(organizationId, statusPageId);
    revalidatePath(`/app/status-pages/${statusPageId}/incidents`);
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function publishMaintenanceAction(
  organizationId: string,
  statusPageId: string,
  maintenanceWindowId: string,
): Promise<ActionResult> {
  try {
    const access = await requirePublish(organizationId);
    limitOrThrow(access.profile.id, "maintenance_publish", 40);
    const result = await publishMaintenanceToStatusPage({
      organizationId,
      statusPageId,
      maintenanceWindowId,
      actorProfileId: access.profile.id,
    });
    if (!result.ok) return { ok: false, error: result.reason };
    await audit(organizationId, access.profile.id, "status_page.maintenance_published", statusPageId, "Published maintenance");
    await trackGoal({ name: DataFastGoals.statusPageMaintenancePublished }).catch(() => {});
    await refreshIfPublished(organizationId, statusPageId);
    revalidatePath(`/app/status-pages/${statusPageId}/maintenance`);
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

export async function unpublishMaintenanceAction(
  organizationId: string,
  statusPageId: string,
  maintenanceWindowId: string,
): Promise<ActionResult> {
  try {
    const access = await requirePublish(organizationId);
    limitOrThrow(access.profile.id, "maintenance_publish", 40);
    await unpublishMaintenanceFromStatusPage({ organizationId, statusPageId, maintenanceWindowId });
    await audit(organizationId, access.profile.id, "status_page.maintenance_published", statusPageId, "Unpublished maintenance");
    await refreshIfPublished(organizationId, statusPageId);
    revalidatePath(`/app/status-pages/${statusPageId}/maintenance`);
    return { ok: true };
  } catch (error) {
    return toActionError(error);
  }
}

const noticeSchema = z.object({
  title: z.string().trim().min(1).max(160),
  body: z.string().trim().min(1).max(4000),
  noticeType: z.enum(["notice", "investigating", "identified", "monitoring", "resolved"]).default("notice"),
  startsAt: z.string().datetime({ offset: true }).optional(),
  endsAt: z.string().datetime({ offset: true }).nullish(),
  publish: z.boolean().default(true),
});

export async function createNoticeAction(
  organizationId: string,
  statusPageId: string,
  input: unknown,
): Promise<ActionResult<{ noticeId: string }>> {
  try {
    const access = await requirePublish(organizationId);
    limitOrThrow(access.profile.id, "notice", 40);
    const data = noticeSchema.parse(input);
    const noticeId = await createManualMessage({
      organizationId,
      statusPageId,
      actorProfileId: access.profile.id,
      title: data.title,
      body: data.body,
      noticeType: data.noticeType,
      startsAt: data.startsAt,
      endsAt: data.endsAt ?? null,
      publish: data.publish,
    });
    await audit(organizationId, access.profile.id, "status_page.notice_created", statusPageId, "Posted a status notice");
    await refreshIfPublished(organizationId, statusPageId);
    revalidatePath(`/app/status-pages/${statusPageId}/incidents`);
    return { ok: true, data: { noticeId } };
  } catch (error) {
    return toActionError(error);
  }
}
