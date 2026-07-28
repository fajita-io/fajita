import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BrandIcon } from "@/components/design-system/icons";
import { LifecyclePill, ResultBadge, TagChips, TypeGlyph } from "@/components/app/monitors/monitor-bits";
import { MonitorTabs } from "@/components/app/monitors/monitor-tabs";
import { MonitorHeaderActions } from "@/components/app/monitors/monitor-header-actions";
import { requireMonitorPage, loadMonitorDetail } from "@/lib/app/monitor-page";
import { intervalLabel } from "@/lib/monitoring/entitlements";
import { relativeTime, typeLabel } from "@/lib/monitoring/display";

export default async function MonitorDetailLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ monitorId: string }>;
}) {
  const { monitorId } = await params;
  const ctx = await requireMonitorPage();
  const monitor = await loadMonitorDetail(ctx.organizationId, monitorId);
  if (!monitor) notFound();

  const isHeartbeat = monitor.monitorType === "heartbeat";

  return (
    <div>
      <Link className="fj-back-link" href="/app/monitors">
        <BrandIcon name="chevron-right" size={14} className="fj-flip-up" />
        All monitors
      </Link>

      <header className="fj-mon-detailhead">
        <div className="fj-mon-detailhead__top">
          <div>
            <h1 className="fj-mon-detailhead__title">
              <TypeGlyph monitorType={monitor.monitorType} />
              {monitor.name}
              <LifecyclePill status={monitor.status} />
            </h1>
            <div className="fj-mon-detailhead__meta">
              <span><ResultBadge result={monitor.latestResult?.status ?? null} size="sm" /></span>
              <span>{typeLabel(monitor.monitorType)}</span>
              {!isHeartbeat ? <span><code>{monitor.safeDestination}</code></span> : null}
              {monitor.groupName ? <span><BrandIcon name="overview" size={13} /> {monitor.groupName}</span> : null}
              {!isHeartbeat ? <span><BrandIcon name="response-time" size={13} /> {intervalLabel(monitor.checkIntervalSeconds)}</span> : null}
              <span>Last checked {relativeTime(monitor.lastCheckAt)}</span>
              {monitor.status === "active" && !isHeartbeat ? (
                <span>Next check {relativeTime(monitor.nextCheckAt)}</span>
              ) : null}
              <span>{monitor.region}</span>
              {monitor.tags.length > 0 ? <span><TagChips tags={monitor.tags} /></span> : null}
            </div>
          </div>
          {ctx.canManage ? (
            <MonitorHeaderActions
              organizationId={ctx.organizationId}
              monitorId={monitor.id}
              monitorName={monitor.name}
              status={monitor.status}
              monitorType={monitor.monitorType}
            />
          ) : null}
        </div>
      </header>

      <MonitorTabs monitorId={monitor.id} monitorType={monitor.monitorType} />

      {children}
    </div>
  );
}
