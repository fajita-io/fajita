import type { Metadata } from "next";

import { IncidentsManager } from "@/components/app/status-pages/incidents-manager";
import { requireStatusPage } from "@/lib/app/status-page-context";
import { listPublishableIncidents } from "@/lib/status-pages/publication";

export const metadata: Metadata = {
  title: "Status page incidents",
  robots: { index: false, follow: false },
};

export default async function IncidentsPage({
  params,
}: {
  params: Promise<{ statusPageId: string }>;
}) {
  const { statusPageId } = await params;
  const ctx = await requireStatusPage(statusPageId);
  const incidents = await listPublishableIncidents(ctx.organizationId, statusPageId, 50);

  return (
    <IncidentsManager
      organizationId={ctx.organizationId}
      statusPageId={statusPageId}
      incidents={incidents}
      canPublish={ctx.canPublish}
    />
  );
}
