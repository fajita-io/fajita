import type { Metadata } from "next";
import Link from "next/link";

import { BrandButtonLink } from "@/components/design-system/primitives";
import { BrandIcon } from "@/components/design-system/icons";
import { AppSection, EmptyState, PageHeader } from "@/components/app/ui";
import { requireIncidentPage } from "@/lib/app/incident-page";
import { listMaintenanceWindows } from "@/lib/incidents/maintenance";
import { formatTimestamp, relativeTime } from "@/lib/incidents/duration";

export const metadata: Metadata = {
  title: "Maintenance",
  robots: { index: false, follow: false },
};

const STATUS_LABEL: Record<string, string> = {
  scheduled: "Scheduled",
  active: "Active",
  completed: "Completed",
  canceled: "Canceled",
};

export default async function MaintenancePage() {
  const ctx = await requireIncidentPage("maintenance");
  const windows = await listMaintenanceWindows(ctx.organizationId);

  const upcoming = windows.filter((w) => w.status === "scheduled");
  const active = windows.filter((w) => w.status === "active");
  const past = windows.filter((w) => w.status === "completed" || w.status === "canceled");

  return (
    <div>
      <PageHeader
        title="Maintenance"
        description="Planned windows where expected failures should not become incidents. Monitoring keeps running so you still have evidence."
        actions={
          ctx.canManageMaintenance ? (
            <BrandButtonLink href="/app/maintenance/new">
              <BrandIcon name="plus" size={16} /> Schedule maintenance
            </BrandButtonLink>
          ) : undefined
        }
      />

      {windows.length === 0 ? (
        <AppSection>
          <EmptyState
            icon="maintenance"
            title="No maintenance scheduled"
            description="Schedule a window before planned work so a deploy or migration does not page your team. Checks continue; incidents pause for the monitors you choose."
            action={
              ctx.canManageMaintenance ? (
                <BrandButtonLink href="/app/maintenance/new">Schedule maintenance</BrandButtonLink>
              ) : undefined
            }
          />
        </AppSection>
      ) : (
        <>
          {active.length > 0 ? (
            <MaintenanceGroup title="Active now" windows={active} timezone={ctx.timezone} statusLabel={STATUS_LABEL} />
          ) : null}
          {upcoming.length > 0 ? (
            <MaintenanceGroup title="Upcoming" windows={upcoming} timezone={ctx.timezone} statusLabel={STATUS_LABEL} />
          ) : null}
          {past.length > 0 ? (
            <MaintenanceGroup title="Past" windows={past} timezone={ctx.timezone} statusLabel={STATUS_LABEL} />
          ) : null}
        </>
      )}
    </div>
  );
}

function MaintenanceGroup({
  title,
  windows,
  timezone,
  statusLabel,
}: {
  title: string;
  windows: Awaited<ReturnType<typeof listMaintenanceWindows>>;
  timezone: string;
  statusLabel: Record<string, string>;
}) {
  return (
    <AppSection title={title}>
      <ul className="fj-mw-list" role="list">
        {windows.map((w) => (
          <li key={w.id} className="fj-mw-row">
            <Link href={`/app/maintenance/${w.id}`} className="fj-mw-row__link">
              <div className="fj-mw-row__main">
                <span className={`fj-mw-status fj-mw-status--${w.status}`}>{statusLabel[w.status]}</span>
                <span className="fj-mw-row__name">{w.name}</span>
              </div>
              <div className="fj-mw-row__meta">
                <span title={w.startsAt}>
                  <BrandIcon name="maintenance" size={13} /> {formatTimestamp(w.startsAt, timezone)}
                </span>
                <span>
                  {w.monitorCount} {w.monitorCount === 1 ? "monitor" : "monitors"}
                </span>
                <span>{w.status === "scheduled" ? `Starts ${relativeTime(w.startsAt)}` : ""}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </AppSection>
  );
}
