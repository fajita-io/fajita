import type { Metadata } from "next";

import { ComponentsEditor } from "@/components/app/status-pages/components-editor";
import { requireStatusPage } from "@/lib/app/status-page-context";
import { listComponentGroups, listComponents } from "@/lib/status-pages/components";
import { listMonitors } from "@/lib/monitoring/monitors";

export const metadata: Metadata = {
  title: "Status page components",
  robots: { index: false, follow: false },
};

export default async function ComponentsPage({
  params,
}: {
  params: Promise<{ statusPageId: string }>;
}) {
  const { statusPageId } = await params;
  const ctx = await requireStatusPage(statusPageId);

  const [components, groups, monitors] = await Promise.all([
    listComponents(statusPageId, { includeArchived: false }),
    listComponentGroups(statusPageId),
    listMonitors(ctx.organizationId, 200),
  ]);

  return (
    <ComponentsEditor
      organizationId={ctx.organizationId}
      statusPageId={statusPageId}
      components={components}
      groups={groups}
      monitors={monitors.map((m) => ({ id: m.id, name: m.name }))}
      canManage={ctx.canManage}
    />
  );
}
