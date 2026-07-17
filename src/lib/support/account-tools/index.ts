import "server-only";

import type { Permission } from "@/lib/auth/roles";
import { can, type OrgRole } from "@/lib/auth/roles";
import { serviceClient } from "@/lib/supabase/service";

import type { DiagnosticCard } from "../types";

export type AccountToolName =
  | "get_current_organization_summary"
  | "get_user_permissions"
  | "get_current_plan_summary"
  | "get_usage_summary"
  | "get_monitor_summary"
  | "get_monitor_latest_result"
  | "get_incident_summary"
  | "get_alert_channel_health"
  | "get_status_page_summary"
  | "get_billing_access_state"
  | "get_onboarding_progress";

export const ACCOUNT_TOOL_ALLOWLIST: readonly AccountToolName[] = [
  "get_current_organization_summary",
  "get_user_permissions",
  "get_current_plan_summary",
  "get_usage_summary",
  "get_monitor_summary",
  "get_monitor_latest_result",
  "get_incident_summary",
  "get_alert_channel_health",
  "get_status_page_summary",
  "get_billing_access_state",
  "get_onboarding_progress",
] as const;

export interface AccountToolContext {
  userId: string;
  organizationId: string;
  role: OrgRole;
  permissions: Permission[];
}

export type AccountToolResult =
  | { ok: true; tool: AccountToolName; cards: DiagnosticCard[]; summary: string }
  | {
      ok: false;
      tool: AccountToolName;
      code: "permission_denied" | "not_found" | "error";
      message: string;
    };

function requirePerm(
  ctx: AccountToolContext,
  permission: Permission,
): boolean {
  return can(ctx.role, permission) || ctx.permissions.includes(permission);
}

export async function runAccountTool(
  tool: AccountToolName,
  ctx: AccountToolContext,
  args: { resourceId?: string } = {},
): Promise<AccountToolResult> {
  if (!ACCOUNT_TOOL_ALLOWLIST.includes(tool)) {
    return {
      ok: false,
      tool,
      code: "permission_denied",
      message: "Tool is not allowlisted.",
    };
  }

  const db = serviceClient();

  try {
    switch (tool) {
      case "get_current_organization_summary": {
        if (!requirePerm(ctx, "org:read")) {
          return {
            ok: false,
            tool,
            code: "permission_denied",
            message: "Your current role does not allow access to that information.",
          };
        }
        const { data } = await db
          .from("organizations")
          .select("id, name, slug, created_at")
          .eq("id", ctx.organizationId)
          .maybeSingle();
        if (!data) {
          return { ok: false, tool, code: "not_found", message: "Organization not found." };
        }
        return {
          ok: true,
          tool,
          summary: `Organization ${data.slug} is active.`,
          cards: [
            {
              id: "org",
              label: "Organization",
              state: "active",
              timestamp: data.created_at,
              explanation: `Slug ${data.slug}.`,
              href: "/app",
            },
          ],
        };
      }
      case "get_user_permissions": {
        return {
          ok: true,
          tool,
          summary: `Role ${ctx.role} with ${ctx.permissions.length} permissions.`,
          cards: [
            {
              id: "perms",
              label: "Permissions",
              state: ctx.role,
              explanation: "Server-resolved for this organization only.",
            },
          ],
        };
      }
      case "get_usage_summary":
      case "get_current_plan_summary":
      case "get_billing_access_state": {
        if (tool === "get_billing_access_state" && !requirePerm(ctx, "billing:manage")) {
          return {
            ok: false,
            tool,
            code: "permission_denied",
            message: "Your current role does not allow access to that information.",
          };
        }
        const { data } = await db
          .from("billing_subscriptions")
          .select("status, plan_key, billing_interval, current_period_end, access_state")
          .eq("organization_id", ctx.organizationId)
          .maybeSingle();
        return {
          ok: true,
          tool,
          summary: data
            ? `Plan ${data.plan_key} is ${data.status} (access ${data.access_state}).`
            : "No cached subscription row for this organization.",
          cards: [
            {
              id: "billing",
              label: "Billing access",
              state: data?.access_state ?? data?.status ?? "none",
              timestamp: data?.current_period_end ?? undefined,
              explanation: "Card numbers and payment methods are never shown in chat.",
              href: "/app/settings/billing",
            },
          ],
        };
      }
      case "get_monitor_summary": {
        if (!requirePerm(ctx, "monitors:manage") && !requirePerm(ctx, "org:read")) {
          return {
            ok: false,
            tool,
            code: "permission_denied",
            message: "Your current role does not allow access to that information.",
          };
        }
        let query = db
          .from("monitors")
          .select("id, name, status, monitor_type, updated_at")
          .eq("organization_id", ctx.organizationId)
          .is("deleted_at", null)
          .limit(5);
        if (args.resourceId) query = query.eq("id", args.resourceId);
        const { data } = await query;
        const count = data?.length ?? 0;
        return {
          ok: true,
          tool,
          summary:
            count === 0
              ? "No monitors found for this organization."
              : `Showing ${count} monitor${count === 1 ? "" : "s"} (names only, no destinations).`,
          cards: (data ?? []).map((m) => ({
            id: m.id,
            label: "Monitor",
            state: m.status ?? "unknown",
            timestamp: m.updated_at ?? undefined,
            explanation: `${m.monitor_type ?? "monitor"} · ${m.name ?? "untitled"}`,
            href: `/app/monitors/${m.id}`,
          })),
        };
      }
      case "get_monitor_latest_result": {
        if (!args.resourceId) {
          return {
            ok: false,
            tool,
            code: "not_found",
            message: "A monitor id is required.",
          };
        }
        const { data: monitor } = await db
          .from("monitors")
          .select("id, organization_id, name")
          .eq("id", args.resourceId)
          .eq("organization_id", ctx.organizationId)
          .maybeSingle();
        if (!monitor) {
          return { ok: false, tool, code: "not_found", message: "Monitor not found." };
        }
        const { data: result } = await db
          .from("check_results")
          .select("id, status, failure_category, checked_at, created_at")
          .eq("monitor_id", args.resourceId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        return {
          ok: true,
          tool,
          summary: result
            ? `Latest check status: ${result.status}. ${result.failure_category ? `Category: ${result.failure_category}.` : ""}`
            : "No check results yet for this monitor.",
          cards: [
            {
              id: "latest",
              label: "Latest check",
              state: result?.status ?? "none",
              timestamp: result?.checked_at ?? result?.created_at ?? undefined,
              explanation:
                "Response bodies, secret headers, and worker hosts are never included.",
              href: `/app/monitors/${args.resourceId}`,
            },
          ],
        };
      }
      case "get_incident_summary": {
        const { data } = await db
          .from("incidents")
          .select("id, lifecycle_status, severity, opened_at, updated_at")
          .eq("organization_id", ctx.organizationId)
          .is("deleted_at", null)
          .order("opened_at", { ascending: false })
          .limit(args.resourceId ? 1 : 5);
        const rows = args.resourceId
          ? (data ?? []).filter((i) => i.id === args.resourceId)
          : (data ?? []);
        return {
          ok: true,
          tool,
          summary:
            rows.length === 0
              ? "No incidents found."
              : `${rows.length} recent incident${rows.length === 1 ? "" : "s"}.`,
          cards: rows.map((i) => ({
            id: i.id,
            label: "Incident",
            state: i.lifecycle_status,
            timestamp: i.updated_at ?? i.opened_at,
            explanation: `Severity ${i.severity ?? "unspecified"}. Root cause is not invented in chat.`,
            href: `/app/incidents/${i.id}`,
          })),
        };
      }
      case "get_alert_channel_health": {
        if (!requirePerm(ctx, "integrations:manage") && !requirePerm(ctx, "org:read")) {
          return {
            ok: false,
            tool,
            code: "permission_denied",
            message: "Your current role does not allow access to that information.",
          };
        }
        const { data } = await db
          .from("alert_channels")
          .select("id, provider, status, health_status, updated_at")
          .eq("organization_id", ctx.organizationId)
          .is("deleted_at", null)
          .limit(10);
        return {
          ok: true,
          tool,
          summary: `${data?.length ?? 0} alert channel${(data?.length ?? 0) === 1 ? "" : "s"}. Destinations stay redacted.`,
          cards: (data ?? []).map((c) => ({
            id: c.id,
            label: "Alert channel",
            state: c.health_status ?? c.status ?? "unknown",
            timestamp: c.updated_at ?? undefined,
            explanation: `${c.provider ?? "channel"} health only. Tokens and webhook URLs are hidden.`,
            href: "/app/integrations",
          })),
        };
      }
      case "get_status_page_summary": {
        const { data } = await db
          .from("status_pages")
          .select("id, name, status, updated_at")
          .eq("organization_id", ctx.organizationId)
          .is("deleted_at", null)
          .limit(5);
        return {
          ok: true,
          tool,
          summary: `${data?.length ?? 0} status page${(data?.length ?? 0) === 1 ? "" : "s"}.`,
          cards: (data ?? []).map((p) => ({
            id: p.id,
            label: "Status page",
            state: p.status ?? "unknown",
            timestamp: p.updated_at ?? undefined,
            explanation: p.name ?? "Status page",
            href: `/app/status-pages/${p.id}`,
          })),
        };
      }
      case "get_onboarding_progress": {
        const { data } = await db
          .from("organization_onboarding")
          .select("completed_at, activated_at, updated_at")
          .eq("organization_id", ctx.organizationId)
          .maybeSingle();
        const state = data?.completed_at
          ? "completed"
          : data?.activated_at
            ? "activated"
            : data
              ? "in_progress"
              : "unknown";
        return {
          ok: true,
          tool,
          summary: data
            ? `Onboarding state: ${state}.`
            : "No onboarding row for this organization.",
          cards: [
            {
              id: "onboarding",
              label: "Onboarding",
              state,
              timestamp: data?.updated_at ?? undefined,
              explanation: "Chat cannot complete onboarding steps for you.",
              href: "/app/onboarding",
            },
          ],
        };
      }
      default:
        return {
          ok: false,
          tool,
          code: "error",
          message: "Unsupported tool.",
        };
    }
  } catch {
    return {
      ok: false,
      tool,
      code: "error",
      message: "Account tool failed.",
    };
  }
}
