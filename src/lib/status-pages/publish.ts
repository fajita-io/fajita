import "server-only";

import { validateAppearance } from "./appearance";
import { listComponents } from "./components";
import { createVersion, buildVersionSnapshot } from "./versions";
import {
  getStatusPage,
  setStatusPageStatus,
  updateStatusPage,
} from "./status-pages";
import { refreshSnapshot, removeSnapshot } from "./projection";

/**
 * Publish, unpublish, and rollback orchestration. Publishing validates the
 * draft, snapshots an immutable version, flips the page to published, and
 * rebuilds the public projection atomically from the app's point of view.
 */

export interface ValidationIssue {
  field: string;
  message: string;
}

/** Validate that a page is safe to publish. Returns a list of blocking issues. */
export async function validateForPublish(
  organizationId: string,
  statusPageId: string,
): Promise<ValidationIssue[]> {
  const issues: ValidationIssue[] = [];
  const page = await getStatusPage(organizationId, statusPageId);
  if (!page) return [{ field: "page", message: "Status page not found." }];

  if (!page.name.trim()) issues.push({ field: "name", message: "Add a page name." });
  if (!/^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])?$/.test(page.slug)) {
    issues.push({ field: "slug", message: "The subdomain is invalid." });
  }
  const appearance = validateAppearance(page.appearance, page.themeKey);
  if (!appearance.ok) {
    issues.push({ field: "appearance", message: appearance.reason });
  }

  const components = await listComponents(statusPageId, { includeArchived: false });
  const visible = components.filter((c) => c.visibility === "visible");
  if (visible.length === 0) {
    issues.push({
      field: "components",
      message: "Add at least one visible component before publishing.",
    });
  }
  const seen = new Set<string>();
  for (const c of visible) {
    if (seen.has(c.slug)) {
      issues.push({ field: "components", message: `Duplicate component slug "${c.slug}".` });
    }
    seen.add(c.slug);
  }
  return issues;
}

export async function publishStatusPage(input: {
  organizationId: string;
  statusPageId: string;
  actorProfileId: string;
}): Promise<{ ok: true; versionNumber: number } | { ok: false; issues: ValidationIssue[] }> {
  const issues = await validateForPublish(input.organizationId, input.statusPageId);
  if (issues.length > 0) return { ok: false, issues };

  // publishing -> version -> published -> snapshot. If snapshot fails, the
  // page is still marked published with the version; the reconciliation job
  // rebuilds any missing snapshot.
  await setStatusPageStatus(input.organizationId, input.statusPageId, "publishing");
  const snapshot = await buildVersionSnapshot(input.organizationId, input.statusPageId);
  const version = await createVersion({
    organizationId: input.organizationId,
    statusPageId: input.statusPageId,
    actorProfileId: input.actorProfileId,
    snapshot,
  });
  await setStatusPageStatus(input.organizationId, input.statusPageId, "published", {
    publishedAt: new Date().toISOString(),
    publishedVersionId: version.id,
  });
  await refreshSnapshot(input.organizationId, input.statusPageId);
  return { ok: true, versionNumber: version.versionNumber };
}

export async function unpublishStatusPage(input: {
  organizationId: string;
  statusPageId: string;
}): Promise<void> {
  await setStatusPageStatus(input.organizationId, input.statusPageId, "unpublished");
  await removeSnapshot(input.statusPageId);
}

/**
 * Restore a previous version's configuration. Applies the old snapshot to the
 * live configuration, then publishes as a new version (the old immutable
 * version is never reactivated in place).
 */
export async function rollbackToVersion(input: {
  organizationId: string;
  statusPageId: string;
  actorProfileId: string;
  versionId: string;
}): Promise<{ ok: true; versionNumber: number } | { ok: false; issues: ValidationIssue[] }> {
  const { getVersion } = await import("./versions");
  const version = await getVersion(input.organizationId, input.statusPageId, input.versionId);
  if (!version) return { ok: false, issues: [{ field: "version", message: "Version not found." }] };

  const p = version.snapshot.page as Record<string, unknown>;
  // Restore page-level settings (never restore secrets or slug ownership).
  await updateStatusPage(input.organizationId, input.statusPageId, input.actorProfileId, {
    title: (p.title as string | null) ?? null,
    description: (p.description as string | null) ?? null,
    headline: (p.headline as string | null) ?? null,
    supportUrl: (p.supportUrl as string | null) ?? null,
    websiteUrl: (p.websiteUrl as string | null) ?? null,
    themeKey: p.themeKey as never,
    appearance: p.appearance as never,
    showUptimeHistory: p.showUptimeHistory as boolean,
    showResponseTime: p.showResponseTime as boolean,
    showIncidentHistory: p.showIncidentHistory as boolean,
    showScheduledMaintenance: p.showScheduledMaintenance as boolean,
    showComponentDescriptions: p.showComponentDescriptions as boolean,
    poweredByVisible: p.poweredByVisible as boolean,
    searchIndexingEnabled: p.searchIndexingEnabled as boolean,
    uptimeHistoryDays: p.uptimeHistoryDays as number,
  });

  return publishStatusPage(input);
}
