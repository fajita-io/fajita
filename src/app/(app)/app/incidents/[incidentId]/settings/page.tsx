import { notFound } from "next/navigation";

import { AppSection } from "@/components/app/ui";
import { IncidentMonitorManager } from "@/components/app/incidents/incident-monitor-manager";
import { requireIncidentPage } from "@/lib/app/incident-page";
import { getIncidentDetail, listMonitorsForSelect } from "@/lib/incidents/queries";
import { ORIGIN_LABEL } from "@/lib/incidents/display";
import { formatTimestamp } from "@/lib/incidents/duration";

export default async function IncidentSettingsPage({
  params,
}: {
  params: Promise<{ incidentId: string }>;
}) {
  const { incidentId } = await params;
  const ctx = await requireIncidentPage("incidents");
  const incident = await getIncidentDetail(ctx.organizationId, incidentId);
  if (!incident) notFound();

  const options = ctx.canManageIncidents ? await listMonitorsForSelect(ctx.organizationId) : [];

  return (
    <div>
      <AppSection title="Affected monitors" description="Attach or remove monitors from this incident. Cross-organization monitors are never available here.">
        {ctx.canManageIncidents ? (
          <IncidentMonitorManager
            organizationId={ctx.organizationId}
            incidentId={incidentId}
            attached={incident.monitors.map((m) => ({
              monitorId: m.monitorId,
              monitorName: m.monitorName,
              relationship: m.relationship,
            }))}
            options={options}
          />
        ) : (
          <p className="fj-inc-empty-line">You do not have permission to change monitor links.</p>
        )}
      </AppSection>

      <AppSection title="Details">
        <dl className="fj-inc-detaillist">
          <div>
            <dt>Reference</dt>
            <dd>{incident.referenceCode ?? "-"}</dd>
          </div>
          <div>
            <dt>Origin</dt>
            <dd>{ORIGIN_LABEL[incident.origin]}</dd>
          </div>
          <div>
            <dt>Correlation key</dt>
            <dd>
              <code>{incident.correlationKey}</code>
            </dd>
          </div>
          <div>
            <dt>Public visibility</dt>
            <dd>{incident.publicVisibility}</dd>
          </div>
          <div>
            <dt>Opened</dt>
            <dd>{formatTimestamp(incident.openedAt, ctx.timezone)}</dd>
          </div>
          {incident.createdByName ? (
            <div>
              <dt>Created by</dt>
              <dd>{incident.createdByName}</dd>
            </div>
          ) : null}
        </dl>
      </AppSection>
    </div>
  );
}
