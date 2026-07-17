import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OpsShell } from "@/components/platform/ops-shell";
import {
  allowInternalPage,
  getPlatformAccess,
} from "@/lib/platform/access";
import { platformDb } from "@/lib/platform/db";
import { PLATFORM_PERMISSIONS } from "@/lib/platform/permissions";
import "@/styles/internal-ops.css";

export const metadata: Metadata = {
  title: {
    default: "Fajita Ops",
    template: "%s · Fajita Ops",
  },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

async function loadShellCounts(): Promise<{
  approvals: number;
  incidents: number;
  providerState: string;
}> {
  try {
    const db = platformDb();
    const [approvals, incidents, providers] = await Promise.all([
      db
        .from("platform_approvals")
        .select("id", { count: "exact", head: true })
        .in("state", ["submitted", "under_review"]),
      db
        .from("platform_incidents")
        .select("id", { count: "exact", head: true })
        .in("state", ["detected", "acknowledged", "investigating", "mitigating"]),
      db.from("platform_provider_health").select("operational_state"),
    ]);
    const states = (providers.data ?? []).map((r: { operational_state: string }) =>
      String(r.operational_state),
    );
    const providerState = states.includes("major_outage")
      ? "outage"
      : states.includes("degraded") || states.includes("partial_outage")
        ? "degraded"
        : states.length
          ? "ok"
          : "unknown";
    return {
      approvals: approvals.count ?? 0,
      incidents: incidents.count ?? 0,
      providerState,
    };
  } catch {
    return { approvals: 0, incidents: 0, providerState: "unknown" };
  }
}

export default async function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const allowed = await allowInternalPage();
  if (!allowed) notFound();

  const access = await getPlatformAccess();
  const counts = await loadShellCounts();
  const environment =
    process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development";
  const version =
    process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ??
    process.env.NEXT_PUBLIC_APP_VERSION ??
    "dev";

  const permissions = access
    ? [...access.permissions]
    : process.env.NODE_ENV !== "production"
      ? [...PLATFORM_PERMISSIONS]
      : [];

  return (
    <OpsShell
      operatorName={access?.profile.display_name ?? access?.profile.primary_email ?? "Operator"}
      operatorRole={access?.roles[0]?.replaceAll("_", " ") ?? "dev access"}
      environment={environment}
      version={version}
      approvalCount={counts.approvals}
      activeIncidents={counts.incidents}
      providerState={counts.providerState}
      permissions={permissions}
    >
      {children}
    </OpsShell>
  );
}
