import Link from "next/link";
import { notFound } from "next/navigation";

import { BrandIcon } from "@/components/design-system/icons";
import { AppSection } from "@/components/app/ui";
import { OperationalBadge } from "@/components/app/incidents/incident-bits";
import { IncidentAlertSummary } from "@/components/app/alerts/incident-alert-summary";
import { IncidentRecapPanel } from "@/components/app/incidents/incident-recap-panel";
import { requireIncidentPage, loadIncidentDetail } from "@/lib/app/incident-page";
import { listIncidentEvents, listIncidentUpdates } from "@/lib/incidents/queries";
import { getIncidentRecap, listFollowUpActions } from "@/lib/reports/queries";
import {
  OPERATIONAL_STATE_COPY,
  PUBLIC_UPDATE_SAVED_NOTICE,
  SEVERITY_COPY,
  UPDATE_TYPE_LABEL,
  eventTitle,
} from "@/lib/incidents/copy";
import { relativeTime } from "@/lib/incidents/duration";

export default async function IncidentOverviewPage({
  params,
}: {
  params: Promise<{ incidentId: string }>;
}) {
  const { incidentId } = await params;
  const ctx = await requireIncidentPage("incidents");
  const incident = await loadIncidentDetail(ctx.organizationId, incidentId);
  if (!incident) notFound();

  const [events, updates, recap] = await Promise.all([
    listIncidentEvents(ctx.organizationId, incidentId, { limit: 6 }),
    listIncidentUpdates(ctx.organizationId, incidentId),
    incident.lifecycleStatus === "resolved"
      ? getIncidentRecap(ctx.organizationId, incidentId)
      : Promise.resolve(null),
  ]);
  const followUps = recap
    ? await listFollowUpActions(ctx.organizationId, incidentId)
    : [];
  const latestPublicUpdate = updates.find((u) => u.visibility === "public_ready");

  return (
    <div className="fj-inc-overview">
      <div className="fj-inc-overview__main">
        <AppSection title="Current state">
          <div className="fj-inc-state">
            <OperationalBadge state={incident.operationalStatus} />
            <p className="fj-inc-state__copy">{OPERATIONAL_STATE_COPY[incident.operationalStatus]}</p>
          </div>
          {incident.internalSummary ? (
            <p className="fj-inc-summary">{incident.internalSummary}</p>
          ) : (
            <p className="fj-inc-summary fj-inc-summary--muted">
              No internal summary yet. {SEVERITY_COPY[incident.severity]}
            </p>
          )}
          {incident.resolutionSummary ? (
            <div className="fj-inc-resolution">
              <h3>Resolution</h3>
              <p>{incident.resolutionSummary}</p>
            </div>
          ) : null}
          {incident.cancellationReason ? (
            <div className="fj-inc-resolution">
              <h3>Cancellation reason</h3>
              <p>{incident.cancellationReason}</p>
            </div>
          ) : null}
        </AppSection>

        <AppSection
          title="Affected monitors"
          description="Each monitor keeps its own evidence and current state."
        >
          {incident.monitors.length === 0 ? (
            <p className="fj-inc-empty-line">No monitors attached. This is a standalone incident.</p>
          ) : (
            <ul className="fj-inc-monitors" role="list">
              {incident.monitors.map((m) => (
                <li key={m.monitorId} className="fj-inc-monitor">
                  <Link href={`/app/monitors/${m.monitorId}`} className="fj-inc-monitor__name">
                    <BrandIcon name="monitor-http" size={14} />
                    {m.monitorName ?? "Monitor"}
                  </Link>
                  <span className="fj-inc-monitor__side">
                    {m.relationship === "primary" ? <span className="fj-tag-pill">Primary</span> : null}
                    {m.currentState ? <OperationalBadge state={m.currentState} /> : null}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </AppSection>

        {recap ? (
          <AppSection
            title="Incident recap"
            description="A fixed factual snapshot generated after recovery held. Timestamps and counts do not change; only the root cause and follow-ups are editable."
          >
            <IncidentRecapPanel
              organizationId={ctx.organizationId}
              recap={recap}
              followUps={followUps}
              canManage={ctx.canManageIncidents}
            />
          </AppSection>
        ) : null}

        <AppSection
          title="Recent timeline"
          footer={
            <Link className="fj-link-button" href={`/app/incidents/${incidentId}/timeline`}>
              View full timeline
            </Link>
          }
        >
          {events.length === 0 ? (
            <p className="fj-inc-empty-line">No timeline events yet.</p>
          ) : (
            <ol className="fj-inc-timeline fj-inc-timeline--compact" role="list">
              {events.map((e) => (
                <li key={e.id} className="fj-inc-tl-item">
                  <div className="fj-inc-tl-item__dot" data-kind={e.actorKind} aria-hidden />
                  <div className="fj-inc-tl-item__body">
                    <div className="fj-inc-tl-item__title">{eventTitle(e.eventType, e.title)}</div>
                    <div className="fj-inc-tl-item__time" title={e.occurredAt}>
                      {e.actorName ? `${e.actorName} · ` : e.actorKind === "system" ? "Fajita · " : ""}
                      {relativeTime(e.occurredAt)}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </AppSection>
      </div>

      <aside className="fj-inc-overview__side">
        <AppSection title="Public update preview">
          {latestPublicUpdate ? (
            <div className="fj-inc-public-preview">
              <span className="fj-update-type">{UPDATE_TYPE_LABEL[latestPublicUpdate.updateType as keyof typeof UPDATE_TYPE_LABEL] ?? latestPublicUpdate.updateType}</span>
              <p>{latestPublicUpdate.body}</p>
              <p className="fj-inc-notice">
                <BrandIcon name="status-page" size={13} /> {PUBLIC_UPDATE_SAVED_NOTICE}
              </p>
            </div>
          ) : (
            <p className="fj-inc-empty-line">
              No public-ready update yet. Draft one on the Updates tab.
            </p>
          )}
        </AppSection>

        <AppSection
          title="Alert delivery"
          footer={
            <Link className="fj-link-button" href={`/app/integrations/deliveries?incident=${incidentId}`}>
              View delivery log
            </Link>
          }
        >
          <IncidentAlertSummary organizationId={ctx.organizationId} incidentId={incidentId} />
        </AppSection>
      </aside>
    </div>
  );
}
