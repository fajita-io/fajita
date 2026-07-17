import type { Metadata } from "next";
import Link from "next/link";

import { BrandButtonLink } from "@/components/design-system/primitives";
import { BrandIcon } from "@/components/design-system/icons";
import { AppSection, EmptyState } from "@/components/app/ui";
import { PageHeader } from "@/components/app/ui";
import { MonitorsToolbar } from "@/components/app/monitors/monitors-toolbar";
import { MonitorsList } from "@/components/app/monitors/monitors-list";
import { requireMonitorPage } from "@/lib/app/monitor-page";
import {
  getMonitorMetrics,
  listGroups,
  listMonitorViews,
  listTags,
} from "@/lib/monitoring/queries";
import { formatResponseTime } from "@/lib/monitoring/uptime";
import { availableIntervals, intervalLabel } from "@/lib/monitoring/entitlements";

export const metadata: Metadata = {
  title: "Monitors",
  robots: { index: false, follow: false },
};

interface SearchParams {
  q?: string;
  type?: string;
  status?: string;
  result?: string;
  group?: string;
  tag?: string;
  interval?: string;
  sort?: string;
  page?: string;
}

export default async function MonitorsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const ctx = await requireMonitorPage();
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const [metrics, result, groups, tags] = await Promise.all([
    getMonitorMetrics(ctx.organizationId),
    listMonitorViews(ctx.organizationId, {
      search: sp.q,
      type: sp.type,
      status: sp.status,
      result: sp.result,
      groupId: sp.group,
      tagId: sp.tag,
      intervalSeconds: sp.interval ? Number(sp.interval) : undefined,
      sort: sp.sort,
      page,
      includeArchived: sp.status === "archived",
    }),
    listGroups(ctx.organizationId),
    listTags(ctx.organizationId),
  ]);

  const hasAnyMonitors = metrics.totalMonitors > 0;
  const filtersActive = Boolean(
    sp.q || sp.type || sp.status || sp.result || sp.group || sp.tag || sp.interval,
  );
  const pageCount = Math.max(1, Math.ceil(result.total / result.pageSize));

  return (
    <div>
      <PageHeader
        title="Monitors"
        description="Everything Fajita is watching for you, with the latest result on each."
        actions={
          ctx.canManage ? (
            <BrandButtonLink href="/app/monitors/new">
              <BrandIcon name="plus" size={16} /> New monitor
            </BrandButtonLink>
          ) : undefined
        }
      />

      {!hasAnyMonitors ? (
        <AppSection>
          <EmptyState
            icon="monitor-http"
            title="Nothing on the burner yet"
            description="Add one monitor and Fajita starts watching it in under three minutes. Websites, APIs, certificates, and scheduled jobs are all fair game."
            action={
              ctx.canManage ? (
                <BrandButtonLink href="/app/monitors/new">Create your first monitor</BrandButtonLink>
              ) : (
                <p className="fj-wiz__hint">Ask an organization admin to add the first monitor.</p>
              )
            }
          />
        </AppSection>
      ) : (
        <>
          <div className="fj-mon-metrics">
            <Metric label="Active monitors" icon="monitor-http" value={String(metrics.activeMonitors)} />
            <Metric label="Checks today" icon="response-time" value={String(metrics.checksToday)} />
            <Metric
              label="Failed today"
              icon="warning"
              value={String(metrics.failedToday)}
              tone={metrics.failedToday > 0 ? "attention" : undefined}
              hint={metrics.failedToday > 0 ? "Open a monitor to see why." : "All clear so far."}
            />
            <Metric
              label="Avg response"
              icon="uptime"
              value={formatResponseTime(metrics.avgResponseMs)}
            />
            <Metric
              label="Certs expiring"
              icon="monitor-ssl"
              value={String(metrics.certsExpiringSoon)}
              tone={metrics.certsExpiringSoon > 0 ? "attention" : undefined}
              hint="Within 30 days"
            />
            {metrics.lateHeartbeats > 0 ? (
              <Metric
                label="Late heartbeats"
                icon="monitor-cron"
                value={String(metrics.lateHeartbeats)}
                tone="attention"
              />
            ) : null}
            {metrics.pausedMonitors > 0 ? (
              <Metric label="Paused" icon="maintenance" value={String(metrics.pausedMonitors)} />
            ) : null}
          </div>

          <MonitorsToolbar
            groups={groups.map((g) => ({ value: g.id, label: `${g.name} (${g.monitorCount})` }))}
            tags={tags.map((t) => ({ value: t.id, label: `${t.name} (${t.monitorCount})` }))}
            intervals={availableIntervals().map((s) => ({
              value: String(s),
              label: intervalLabel(s),
            }))}
          />

          {result.items.length === 0 ? (
            <AppSection>
              <EmptyState
                icon="search"
                title="No monitors match these filters"
                description={
                  filtersActive
                    ? "Try clearing a filter or searching for a different name."
                    : "Nothing to show yet."
                }
                action={<Link className="fj-link-button" href="/app/monitors">Clear filters</Link>}
              />
            </AppSection>
          ) : (
            <MonitorsList
              items={result.items}
              organizationId={ctx.organizationId}
              canManage={ctx.canManage}
              groups={groups.map((g) => ({ id: g.id, name: g.name }))}
              tags={tags.map((t) => ({ id: t.id, name: t.name, colorToken: t.colorToken }))}
            />
          )}

          {pageCount > 1 ? (
            <nav className="fj-pagination" aria-label="Monitor pages">
              <span>
                Page {result.page} of {pageCount} · {result.total} monitors
              </span>
              <div className="fj-pagination__controls">
                {result.page > 1 ? (
                  <Link className="fj-button fj-button--secondary fj-button--sm" href={buildPageHref(sp, result.page - 1)}>
                    Previous
                  </Link>
                ) : null}
                {result.page < pageCount ? (
                  <Link className="fj-button fj-button--secondary fj-button--sm" href={buildPageHref(sp, result.page + 1)}>
                    Next
                  </Link>
                ) : null}
              </div>
            </nav>
          ) : null}
        </>
      )}
    </div>
  );
}

function buildPageHref(sp: SearchParams, page: number): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (v && k !== "page") params.set(k, v);
  }
  params.set("page", String(page));
  return `/app/monitors?${params.toString()}`;
}

function Metric({
  label,
  value,
  icon,
  hint,
  tone,
}: {
  label: string;
  value: string;
  icon: Parameters<typeof BrandIcon>[0]["name"];
  hint?: string;
  tone?: "attention" | "down";
}) {
  return (
    <div className="fj-mon-metric" data-tone={tone}>
      <div className="fj-mon-metric__label">
        <BrandIcon name={icon} size={14} />
        {label}
      </div>
      <div className="fj-mon-metric__value">{value}</div>
      {hint ? <div className="fj-mon-metric__hint">{hint}</div> : null}
    </div>
  );
}
