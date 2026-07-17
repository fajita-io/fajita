import type { Metadata } from "next";
import Link from "next/link";

import { BrandButtonLink } from "@/components/design-system/primitives";
import { BrandIcon } from "@/components/design-system/icons";
import { AppSection, EmptyState, PageHeader } from "@/components/app/ui";
import { IncidentsList } from "@/components/app/incidents/incidents-list";
import { requireIncidentPage } from "@/lib/app/incident-page";
import { getIncidentOverview, listIncidents } from "@/lib/incidents/queries";
import { SEVERITIES, INCIDENT_ORIGINS } from "@/lib/incidents/constants";
import type { IncidentOrigin, Severity } from "@/lib/incidents/constants";

export const metadata: Metadata = {
  title: "Incidents",
  robots: { index: false, follow: false },
};

type View = "active" | "history" | "canceled" | "all";

interface SearchParams {
  view?: string;
  severity?: string;
  origin?: string;
}

const VIEWS: { id: View; label: string }[] = [
  { id: "active", label: "Active" },
  { id: "history", label: "History" },
  { id: "canceled", label: "Canceled" },
  { id: "all", label: "All" },
];

export default async function IncidentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const ctx = await requireIncidentPage("incidents");
  const sp = await searchParams;
  const view: View = (VIEWS.find((v) => v.id === sp.view)?.id ?? "active") as View;
  const severity = SEVERITIES.includes(sp.severity as Severity)
    ? (sp.severity as Severity)
    : undefined;
  const origin = INCIDENT_ORIGINS.includes(sp.origin as IncidentOrigin)
    ? (sp.origin as IncidentOrigin)
    : undefined;

  const statusFilter =
    view === "active"
      ? "active"
      : view === "history"
        ? "resolved"
        : view === "canceled"
          ? "canceled"
          : "all";

  const [overview, incidents] = await Promise.all([
    getIncidentOverview(ctx.organizationId),
    listIncidents(ctx.organizationId, { status: statusFilter, severity, origin, limit: 100 }),
  ]);

  const anyEver = overview.activeIncidents > 0 || incidents.length > 0;

  return (
    <div>
      <PageHeader
        title="Incidents"
        description="One bad request is noise. A confirmed outage is a signal. This is where Fajita keeps the sequence straight."
        actions={
          ctx.canManageIncidents ? (
            <BrandButtonLink href="/app/incidents/new">
              <BrandIcon name="plus" size={16} /> New incident
            </BrandButtonLink>
          ) : undefined
        }
      />

      <div className="fj-inc-metrics" role="group" aria-label="Incident status">
        <CommandMetric label="Active" value={overview.activeIncidents} icon="incident" />
        <CommandMetric
          label="Unacknowledged"
          value={overview.unacknowledged}
          icon="bell"
          tone={overview.unacknowledged > 0 ? "attention" : undefined}
        />
        <CommandMetric
          label="Critical"
          value={overview.criticalActive}
          icon="alert"
          tone={overview.criticalActive > 0 ? "down" : undefined}
        />
        <CommandMetric label="Recovering" value={overview.recovering} icon="recovery" />
        <CommandMetric
          label="Flapping"
          value={overview.flappingMonitors}
          icon="warning"
          tone={overview.flappingMonitors > 0 ? "attention" : undefined}
        />
        <CommandMetric label="Maintenance" value={overview.activeMaintenance} icon="maintenance" />
      </div>

      <nav className="fj-tabs" aria-label="Incident views">
        {VIEWS.map((v) => (
          <Link
            key={v.id}
            href={v.id === "active" ? "/app/incidents" : `/app/incidents?view=${v.id}`}
            className="fj-tab"
            aria-current={v.id === view ? "page" : undefined}
          >
            {v.label}
          </Link>
        ))}
      </nav>

      {!anyEver ? (
        <AppSection>
          <EmptyState
            icon="incident"
            title="No incidents. That is the goal."
            description="When a monitor fails its confirmation checks, Fajita opens an incident here with the evidence attached. You can also open one by hand for issues found outside Fajita."
            action={
              ctx.canManageIncidents ? (
                <BrandButtonLink href="/app/incidents/new">Open a manual incident</BrandButtonLink>
              ) : undefined
            }
          />
        </AppSection>
      ) : incidents.length === 0 ? (
        <AppSection>
          <EmptyState
            icon="search"
            title="Nothing in this view"
            description={
              view === "active"
                ? "No active incidents right now."
                : "No incidents match this filter."
            }
            action={<Link className="fj-link-button" href="/app/incidents">Back to active</Link>}
          />
        </AppSection>
      ) : (
        <IncidentsList items={incidents} />
      )}
    </div>
  );
}

function CommandMetric({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: Parameters<typeof BrandIcon>[0]["name"];
  tone?: "attention" | "down";
}) {
  return (
    <div className="fj-inc-metric" data-tone={value > 0 ? tone : undefined}>
      <div className="fj-inc-metric__label">
        <BrandIcon name={icon} size={14} /> {label}
      </div>
      <div className="fj-inc-metric__value fj-numeric">{value}</div>
    </div>
  );
}
