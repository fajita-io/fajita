import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BrandIcon } from "@/components/design-system/icons";
import { AppSection, PageHeader } from "@/components/app/ui";
import { ManualIncidentForm } from "@/components/app/incidents/manual-incident-form";
import { requireIncidentPage } from "@/lib/app/incident-page";
import { listMonitorsForSelect, listOrgMembersForSelect } from "@/lib/incidents/queries";

export const metadata: Metadata = {
  title: "New incident",
  robots: { index: false, follow: false },
};

export default async function NewIncidentPage() {
  const ctx = await requireIncidentPage("incidents");
  if (!ctx.canManageIncidents) notFound();

  const [monitors, members] = await Promise.all([
    listMonitorsForSelect(ctx.organizationId),
    listOrgMembersForSelect(ctx.organizationId),
  ]);

  return (
    <div className="fj-form-page">
      <Link className="fj-back-link" href="/app/incidents">
        <BrandIcon name="chevron-right" size={14} className="fj-flip-up" />
        All incidents
      </Link>

      <PageHeader
        title="Open a manual incident"
        description="For issues you found outside Fajita, or a heads-up you want tracked before a monitor confirms it. Manual incidents never forge check history."
      />

      <AppSection className="fj-app-section--form">
        <ManualIncidentForm
          organizationId={ctx.organizationId}
          monitors={monitors}
          members={members}
        />
      </AppSection>
    </div>
  );
}
