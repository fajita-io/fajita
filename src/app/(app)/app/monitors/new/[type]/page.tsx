import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/app/ui";
import { MonitorWizard } from "@/components/app/monitors/monitor-wizard";
import { requireMonitorPage } from "@/lib/app/monitor-page";
import { listGroups } from "@/lib/monitoring/queries";
import { resolveEntitlements } from "@/lib/monitoring/entitlements.server";
import { availableIntervals } from "@/lib/monitoring/entitlements";
import type { WizardTypeSegment } from "@/lib/monitoring/display";

export const metadata: Metadata = {
  title: "Create monitor",
  robots: { index: false, follow: false },
};

const VALID = ["website", "api", "ssl", "heartbeat"] as const;
const TITLES: Record<WizardTypeSegment, { title: string; desc: string }> = {
  website: { title: "New website monitor", desc: "Point Fajita at a public URL and know the moment it stops answering." },
  api: { title: "New API monitor", desc: "Check status, speed, and the exact values your endpoint returns." },
  ssl: { title: "New SSL monitor", desc: "Track a certificate and get warned well before it expires." },
  heartbeat: { title: "New heartbeat monitor", desc: "Hear about a scheduled job when a run goes missing." },
};

export default async function WizardPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  if (!VALID.includes(type as WizardTypeSegment)) notFound();
  const segment = type as WizardTypeSegment;

  const ctx = await requireMonitorPage();
  if (!ctx.canManage) notFound();

  const [groups, ent] = await Promise.all([
    listGroups(ctx.organizationId),
    resolveEntitlements(ctx.organizationId),
  ]);

  if (segment === "heartbeat" && !ent.heartbeatEnabled) notFound();

  const copy = TITLES[segment];

  return (
    <div>
      <PageHeader title={copy.title} description={copy.desc} />
      <MonitorWizard
        organizationId={ctx.organizationId}
        segment={segment}
        intervals={availableIntervals(ent)}
        groups={groups.map((g) => ({ id: g.id, name: g.name }))}
        maxAssertions={ent.maxAssertionsPerMonitor}
        retentionDays={ent.resultRetentionDays}
      />
    </div>
  );
}
