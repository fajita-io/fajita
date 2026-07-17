import { notFound } from "next/navigation";

import { AppSection } from "@/components/app/ui";
import { requireIncidentPage } from "@/lib/app/incident-page";
import { getIncidentDetail, listIncidentEvidence } from "@/lib/incidents/queries";
import { formatTimestamp } from "@/lib/incidents/duration";

export default async function IncidentEvidencePage({
  params,
}: {
  params: Promise<{ incidentId: string }>;
}) {
  const { incidentId } = await params;
  const ctx = await requireIncidentPage("incidents");
  const incident = await getIncidentDetail(ctx.organizationId, incidentId);
  if (!incident) notFound();

  const evidence = await listIncidentEvidence(ctx.organizationId, incidentId);
  const monitorName = new Map(incident.monitors.map((m) => [m.monitorId, m.monitorName]));

  return (
    <AppSection
      title="Evidence"
      description="The exact check results behind each transition. Fajita references the original checks and never stores response bodies or secret URLs here."
    >
      {evidence.length === 0 ? (
        <p className="fj-inc-empty-line">No evidence attached yet.</p>
      ) : (
        <div className="fj-table-scroll">
          <table className="fj-inc-evidence">
            <thead>
              <tr>
                <th scope="col">When</th>
                <th scope="col">Monitor</th>
                <th scope="col">Role</th>
                <th scope="col">Result</th>
                <th scope="col">HTTP</th>
                <th scope="col">Response</th>
                <th scope="col">Region</th>
                <th scope="col">Detail</th>
              </tr>
            </thead>
            <tbody>
              {evidence.map((row) => (
                <tr key={row.id}>
                  <td title={row.checkedAt ?? ""}>
                    {row.checkedAt ? formatTimestamp(row.checkedAt, ctx.timezone) : "-"}
                  </td>
                  <td>{row.monitorId ? (monitorName.get(row.monitorId) ?? "Monitor") : "-"}</td>
                  <td>
                    <span className="fj-tag-pill">{row.role}</span>
                  </td>
                  <td>{row.resultStatus ?? "-"}</td>
                  <td className="fj-numeric">{row.httpStatus ?? "-"}</td>
                  <td className="fj-numeric">
                    {row.responseTimeMs != null ? `${row.responseTimeMs} ms` : "-"}
                  </td>
                  <td>{row.region ?? "-"}</td>
                  <td>{row.safeFailureSummary ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppSection>
  );
}
