import type { Metadata } from "next";

import { MaintenanceManager } from "@/components/app/status-pages/maintenance-manager";
import { requireStatusPage } from "@/lib/app/status-page-context";
import { listPublishableMaintenance } from "@/lib/status-pages/publication";

export const metadata: Metadata = {
  title: "Status page maintenance",
  robots: { index: false, follow: false },
};

export default async function MaintenancePage({
  params,
}: {
  params: Promise<{ statusPageId: string }>;
}) {
  const { statusPageId } = await params;
  const ctx = await requireStatusPage(statusPageId);
  const windows = await listPublishableMaintenance(ctx.organizationId, statusPageId, 50);

  return (
    <MaintenanceManager
      organizationId={ctx.organizationId}
      statusPageId={statusPageId}
      windows={windows}
      timezone={ctx.statusPage.timezone}
      locale={ctx.statusPage.locale}
      canPublish={ctx.canPublish}
    />
  );
}
