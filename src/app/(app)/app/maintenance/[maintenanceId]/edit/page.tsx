import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BrandIcon } from "@/components/design-system/icons";
import { AppSection, PageHeader } from "@/components/app/ui";
import { MaintenanceForm } from "@/components/app/maintenance/maintenance-form";
import { requireIncidentPage } from "@/lib/app/incident-page";
import { getMaintenanceWindow } from "@/lib/incidents/maintenance";
import { listMonitorsForSelect } from "@/lib/incidents/queries";
import type { SuppressionPolicy } from "@/lib/incidents/constants";

export const metadata: Metadata = {
  title: "Edit maintenance",
  robots: { index: false, follow: false },
};

/** Format a UTC ISO instant as a "YYYY-MM-DDTHH:mm" wall clock in `timeZone`. */
function toLocalInput(iso: string, timeZone: string): string {
  const dtf = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  const parts: Record<string, string> = {};
  for (const p of dtf.formatToParts(new Date(iso))) parts[p.type] = p.value;
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export default async function EditMaintenancePage({
  params,
}: {
  params: Promise<{ maintenanceId: string }>;
}) {
  const { maintenanceId } = await params;
  const ctx = await requireIncidentPage("maintenance");
  if (!ctx.canManageMaintenance) notFound();

  const [win, monitors] = await Promise.all([
    getMaintenanceWindow(ctx.organizationId, maintenanceId),
    listMonitorsForSelect(ctx.organizationId),
  ]);
  if (!win) notFound();

  return (
    <div className="fj-form-page">
      <Link className="fj-back-link" href={`/app/maintenance/${win.id}`}>
        <BrandIcon name="chevron-right" size={14} className="fj-flip-up" />
        Back to window
      </Link>

      <PageHeader title="Edit maintenance" description="Update the window details, times, or affected monitors." />

      <AppSection className="fj-app-section--form">
        <MaintenanceForm
          organizationId={ctx.organizationId}
          monitors={monitors}
          defaultTimezone={ctx.timezone}
          initial={{
            windowId: win.id,
            name: win.name,
            description: win.description,
            publicSummary: win.publicSummary,
            internalNotes: win.internalNotes,
            timezone: win.timezone,
            startsLocal: toLocalInput(win.startsAt, win.timezone),
            endsLocal: toLocalInput(win.endsAt, win.timezone),
            suppressionPolicy: win.suppressionPolicy as SuppressionPolicy,
            monitorIds: win.monitors.map((m) => m.id),
          }}
        />
      </AppSection>
    </div>
  );
}
