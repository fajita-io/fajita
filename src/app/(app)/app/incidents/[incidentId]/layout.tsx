import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BrandIcon } from "@/components/design-system/icons";
import {
  LifecycleChip,
  OperationalBadge,
  OriginChip,
  SeverityBadge,
} from "@/components/app/incidents/incident-bits";
import { IncidentTabs } from "@/components/app/incidents/incident-tabs";
import { IncidentHeaderActions } from "@/components/app/incidents/incident-header-actions";
import { requireIncidentPage, loadIncidentDetail } from "@/lib/app/incident-page";
import { listOrgMembersForSelect } from "@/lib/incidents/queries";
import { incidentDuration, relativeTime } from "@/lib/incidents/duration";
import { isActiveLifecycle } from "@/lib/incidents/display";

export default async function IncidentDetailLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ incidentId: string }>;
}) {
  const { incidentId } = await params;
  const ctx = await requireIncidentPage("incidents");
  const incident = await loadIncidentDetail(ctx.organizationId, incidentId);
  if (!incident) notFound();

  const active = isActiveLifecycle(incident.lifecycleStatus);
  const members = ctx.canManageIncidents
    ? await listOrgMembersForSelect(ctx.organizationId)
    : [];

  return (
    <div>
      <Link
        className="fj-link-button"
        href="/app/incidents"
        style={{ marginBottom: "var(--space-4)", display: "inline-flex" }}
      >
        <BrandIcon name="chevron-right" size={14} className="fj-flip-up" />
        All incidents
      </Link>

      <header className="fj-inc-detailhead">
        <div className="fj-inc-detailhead__top">
          <div className="fj-inc-detailhead__lead">
            <div className="fj-inc-detailhead__badges">
              <OperationalBadge state={incident.operationalStatus} />
              <SeverityBadge severity={incident.severity} />
              <LifecycleChip status={incident.lifecycleStatus} />
              <OriginChip origin={incident.origin} />
            </div>
            <h1 className="fj-inc-detailhead__title">
              {incident.referenceCode ? (
                <span className="fj-inc-detailhead__ref">{incident.referenceCode}</span>
              ) : null}
              {incident.title}
            </h1>
            <div className="fj-inc-detailhead__meta">
              <span title={`Opened ${incident.openedAt}`}>Opened {relativeTime(incident.openedAt)}</span>
              <span>
                {active
                  ? `Open for ${incidentDuration(incident.openedAt, null)}`
                  : `${incidentDuration(incident.openedAt, incident.resolvedAt)} total`}
              </span>
              {incident.affectedMonitorCount > 0 ? (
                <span>
                  <BrandIcon name="monitor-http" size={13} /> {incident.affectedMonitorCount}{" "}
                  {incident.affectedMonitorCount === 1 ? "monitor" : "monitors"}
                </span>
              ) : null}
              <span>
                {incident.acknowledgedAt ? (
                  <>
                    <BrandIcon name="check" size={13} /> Acknowledged
                  </>
                ) : active ? (
                  "Unacknowledged"
                ) : null}
              </span>
              {incident.assigneeName ? (
                <span>
                  <BrandIcon name="team" size={13} /> {incident.assigneeName}
                </span>
              ) : null}
            </div>
          </div>

          {ctx.canManageIncidents ? (
            <IncidentHeaderActions
              organizationId={ctx.organizationId}
              incidentId={incident.id}
              isActive={active}
              isAcknowledged={Boolean(incident.acknowledgedAt)}
              currentSeverity={incident.severity}
              currentAssigneeId={null}
              members={members}
            />
          ) : null}
        </div>
      </header>

      <IncidentTabs incidentId={incident.id} />

      {children}
    </div>
  );
}
