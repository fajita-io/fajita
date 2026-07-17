import Link from "next/link";
import { notFound } from "next/navigation";

import { BrandIcon } from "@/components/design-system/icons";
import { AppSection, PageHeader } from "@/components/app/ui";
import { MaintenanceCancelButton } from "@/components/app/maintenance/maintenance-cancel-button";
import { requireIncidentPage } from "@/lib/app/incident-page";
import { getMaintenanceWindow } from "@/lib/incidents/maintenance";
import { formatTimestamp } from "@/lib/incidents/duration";

const STATUS_LABEL: Record<string, string> = {
  scheduled: "Scheduled",
  active: "Active",
  completed: "Completed",
  canceled: "Canceled",
};

const SUPPRESSION_LABEL: Record<string, string> = {
  suppress_incidents: "Keep checking, do not open incidents",
  annotate_only: "Keep checking, record failures in this window",
  do_not_suppress: "Do not suppress",
};

export default async function MaintenanceDetailPage({
  params,
}: {
  params: Promise<{ maintenanceId: string }>;
}) {
  const { maintenanceId } = await params;
  const ctx = await requireIncidentPage("maintenance");
  const win = await getMaintenanceWindow(ctx.organizationId, maintenanceId);
  if (!win) notFound();

  const canEdit =
    ctx.canManageMaintenance && (win.status === "scheduled" || win.status === "active");

  return (
    <div>
      <Link
        className="fj-link-button"
        href="/app/maintenance"
        style={{ marginBottom: "var(--space-4)", display: "inline-flex" }}
      >
        <BrandIcon name="chevron-right" size={14} className="fj-flip-up" />
        All maintenance
      </Link>

      <PageHeader
        title={win.name}
        description={win.description ?? undefined}
        actions={
          canEdit ? (
            <div className="fj-inc-actions">
              <Link className="fj-button fj-button--secondary" href={`/app/maintenance/${win.id}/edit`}>
                Edit
              </Link>
              <MaintenanceCancelButton organizationId={ctx.organizationId} windowId={win.id} />
            </div>
          ) : undefined
        }
      />

      <AppSection>
        <dl className="fj-inc-detaillist">
          <div>
            <dt>Status</dt>
            <dd>
              <span className={`fj-mw-status fj-mw-status--${win.status}`}>
                {STATUS_LABEL[win.status]}
              </span>
            </dd>
          </div>
          <div>
            <dt>Starts</dt>
            <dd>{formatTimestamp(win.startsAt, win.timezone)}</dd>
          </div>
          <div>
            <dt>Ends</dt>
            <dd>{formatTimestamp(win.endsAt, win.timezone)}</dd>
          </div>
          <div>
            <dt>Timezone</dt>
            <dd>{win.timezone}</dd>
          </div>
          <div>
            <dt>Suppression</dt>
            <dd>{SUPPRESSION_LABEL[win.suppressionPolicy] ?? win.suppressionPolicy}</dd>
          </div>
        </dl>
      </AppSection>

      <AppSection title="Affected monitors">
        {win.monitors.length === 0 ? (
          <p className="fj-inc-empty-line">No monitors linked to this window.</p>
        ) : (
          <ul className="fj-inc-monitors" role="list">
            {win.monitors.map((m) => (
              <li key={m.id} className="fj-inc-monitor">
                <Link href={`/app/monitors/${m.id}`} className="fj-inc-monitor__name">
                  <BrandIcon name="monitor-http" size={14} />
                  {m.name ?? "Monitor"}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </AppSection>

      {win.publicSummary ? (
        <AppSection title="Public summary">
          <p>{win.publicSummary}</p>
          <p className="fj-inc-notice">
            <BrandIcon name="status-page" size={13} /> Saved for a future status page. Nothing is
            published yet.
          </p>
        </AppSection>
      ) : null}
    </div>
  );
}
