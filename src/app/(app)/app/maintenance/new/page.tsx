import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BrandIcon } from "@/components/design-system/icons";
import { AppSection, PageHeader } from "@/components/app/ui";
import { MaintenanceForm } from "@/components/app/maintenance/maintenance-form";
import { requireIncidentPage } from "@/lib/app/incident-page";
import { listMonitorsForSelect } from "@/lib/incidents/queries";

export const metadata: Metadata = {
  title: "Schedule maintenance",
  robots: { index: false, follow: false },
};

export default async function NewMaintenancePage() {
  const ctx = await requireIncidentPage("maintenance");
  if (!ctx.canManageMaintenance) notFound();

  const monitors = await listMonitorsForSelect(ctx.organizationId);

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
        title="Schedule maintenance"
        description="Fajita keeps checking during the window. For the monitors you choose, expected failures will not open an incident."
      />

      <AppSection>
        <MaintenanceForm
          organizationId={ctx.organizationId}
          monitors={monitors}
          defaultTimezone={ctx.timezone}
        />
      </AppSection>
    </div>
  );
}
