/**
 * Operator seed: internal org, Fajita-on-Fajita monitors, published status page.
 *
 * Run against production (requires .env.production.local):
 *   RUN_PRODUCTION_SEED=1 npx vitest run tests/ops/seed-fajita-self-monitoring.test.ts
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { loadEnvConfig } from "@next/env";
import { describe, expect, it } from "vitest";

import { appUrl } from "@/lib/env";
import { createDraftMonitor, activateMonitor } from "@/lib/monitoring/monitors";
import type { MonitorConfig } from "@/lib/monitoring/config";
import { createComponent } from "@/lib/status-pages/components";
import { publishStatusPage } from "@/lib/status-pages/publish";
import { getPublicSnapshotBySlug } from "@/lib/status-pages/projection";
import {
  createStatusPage,
  getStatusPageBySlug,
  updateStatusPage,
} from "@/lib/status-pages/status-pages";
import { serviceClient } from "@/lib/supabase/service";
import {
  FAJITA_SELF_MONITORS,
  FAJITA_STATUS_COMPONENTS,
} from "@/lib/platform/self-monitoring";

const STATUS_SLUG = "platform";
const ORG_SLUG = "fajita-platform";

function loadProductionEnv(): void {
  loadEnvConfig(process.cwd());
  const prodPath = resolve(process.cwd(), ".env.production.local");
  if (!existsSync(prodPath)) return;
  for (const line of readFileSync(prodPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq);
    let val = trimmed.slice(eq + 1);
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}

function baseHttpMonitor(name: string, path: string): MonitorConfig {
  const base = appUrl.replace(/\/$/, "");
  return {
    name,
    description: `Fajita self-monitor: ${path}`,
    monitor_type: "http",
    target_url: `${base}${path}`,
    http_method: "GET",
    check_interval_seconds: 60,
    timeout_ms: 15000,
    retry_count: 1,
    retry_delay_ms: 3000,
    follow_redirects: true,
    max_redirects: 5,
    expected_status_codes: [200],
    body_size_limit_bytes: 1048576,
    assertions: [],
  };
}

const COMPONENT_MONITOR_PATHS: Record<
  (typeof FAJITA_STATUS_COMPONENTS)[number]["key"],
  string
> = {
  website: "/",
  app: "/login",
  monitoring_checks: "/api/health",
  alert_delivery: "/api/health",
  public_status_pages: "/status",
  billing: "/pricing",
  support_chat: "/llms.txt",
};

describe("seed fajita self-monitoring", () => {
  it.skipIf(process.env.RUN_PRODUCTION_SEED !== "1")(
    "creates internal org, monitors, and published platform status page",
    async () => {
      loadProductionEnv();
      const db = serviceClient();

      const { data: profile, error: pErr } = await db
        .from("user_profiles")
        .select("id, external_id, primary_email, display_name")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      expect(pErr).toBeNull();
      expect(profile?.id).toBeTruthy();
      const actorId = profile!.id;

      let orgId: string;
      const { data: existingOrg } = await db
        .from("organizations")
        .select("id")
        .eq("slug", ORG_SLUG)
        .maybeSingle();

      if (existingOrg?.id) {
        orgId = existingOrg.id;
        await db
          .from("organizations")
          .update({ is_internal: true, name: "Fajita Platform" })
          .eq("id", orgId);
      } else {
        const { data: org, error: oErr } = await db
          .from("organizations")
          .insert({
            name: "Fajita Platform",
            slug: ORG_SLUG,
            owner_user_id: actorId,
            default_timezone: "America/Denver",
            is_internal: true,
            status: "active",
          })
          .select("id")
          .single();
        expect(oErr).toBeNull();
        orgId = org!.id;

        const { error: mErr } = await db.from("organization_members").insert({
          organization_id: orgId,
          user_id: actorId,
          role: "owner",
          status: "active",
        });
        expect(mErr).toBeNull();

        await db.from("organization_onboarding").insert({
          organization_id: orgId,
          steps: {},
        });
      }

      const monitorIds = new Map<string, string>();

      const pathsToSeed = [
        ...FAJITA_SELF_MONITORS.map((m) => ({ key: m.key, path: m.path })),
        { key: "login", path: "/login" },
      ];

      for (const item of pathsToSeed) {
        const monitorName = `Fajita ${item.key.replace(/_/g, " ")}`;
        const { data: existing } = await db
          .from("monitors")
          .select("id, status")
          .eq("organization_id", orgId)
          .eq("name", monitorName)
          .maybeSingle();

        if (existing?.id) {
          monitorIds.set(item.key, existing.id);
          if (existing.status !== "active") {
            await activateMonitor({
              organizationId: orgId,
              actorProfileId: actorId,
              monitorId: existing.id,
            });
          }
          continue;
        }

        const { monitorId } = await createDraftMonitor({
          organizationId: orgId,
          actorProfileId: actorId,
          config: baseHttpMonitor(monitorName, item.path),
        });
        await activateMonitor({
          organizationId: orgId,
          actorProfileId: actorId,
          monitorId,
        });
        monitorIds.set(item.key, monitorId);
      }

      let statusPageId: string;
      const existingPage = await getStatusPageBySlug(STATUS_SLUG);
      if (existingPage) {
        statusPageId = existingPage.id;
        expect(existingPage.organizationId).toBe(orgId);
      } else {
        statusPageId = await createStatusPage({
          organizationId: orgId,
          actorProfileId: actorId,
          name: "Fajita",
          slug: STATUS_SLUG,
          timezone: "America/Denver",
        });
      }

      await updateStatusPage(orgId, statusPageId, actorId, {
        title: "Fajita Service Status",
        description:
          "Current availability for Fajita's production services. Each component reflects live monitoring.",
        headline: "All systems, accounted for.",
        supportUrl: `${appUrl}/contact?topic=support`,
        websiteUrl: appUrl,
        visibility: "public",
        showSubscriberForm: false,
        poweredByVisible: false,
        showUptimeHistory: true,
        showResponseTime: false,
        searchIndexingEnabled: true,
      });

      const pathKeyForComponent = (key: string): string => {
        if (key === "website") return "homepage";
        if (key === "app") return "login";
        if (key === "monitoring_checks" || key === "alert_delivery") return "health_app";
        if (key === "public_status_pages") return "status_surface";
        if (key === "billing") return "pricing";
        if (key === "support_chat") return "llms";
        return key;
      };

      for (const [index, component] of FAJITA_STATUS_COMPONENTS.entries()) {
        const monitorKey = pathKeyForComponent(component.key);
        const monitorId = monitorIds.get(monitorKey);
        expect(monitorId, `missing monitor for ${component.key}`).toBeTruthy();

        const { data: existingComponent } = await db
          .from("status_page_components")
          .select("id")
          .eq("status_page_id", statusPageId)
          .eq("name", component.name)
          .is("deleted_at", null)
          .maybeSingle();

        if (existingComponent?.id) continue;

        await createComponent({
          organizationId: orgId,
          statusPageId,
          name: component.name,
          description: component.description,
          monitorIds: [monitorId!],
          showUptime: true,
          showResponseTime: false,
          calculationMode: "any_critical",
        });

        void index;
        void COMPONENT_MONITOR_PATHS[component.key];
      }

      const published = await publishStatusPage({
        organizationId: orgId,
        statusPageId,
        actorProfileId: actorId,
      });
      expect(published.ok, JSON.stringify(published)).toBe(true);

      const snapshot = await getPublicSnapshotBySlug(STATUS_SLUG);
      expect(snapshot?.visibility).toBe("public");
      const componentCount =
        (snapshot?.data.ungrouped.length ?? 0) +
        (snapshot?.data.groups.reduce((n, g) => n + g.components.length, 0) ?? 0);
      expect(componentCount).toBeGreaterThanOrEqual(7);

      console.log(
        JSON.stringify({
          ok: true,
          organizationId: orgId,
          statusPageId,
          slug: STATUS_SLUG,
          monitorCount: monitorIds.size,
          setEnv: `FAJITA_SERVICE_STATUS_SLUG=${STATUS_SLUG}`,
        }),
      );
    },
    120_000,
  );
});
