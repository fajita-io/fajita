import type { Metadata } from "next";

import { PageHeader } from "@/components/app/ui";
import { OrganizeManager } from "@/components/app/monitors/organize-manager";
import { requireMonitorPage } from "@/lib/app/monitor-page";
import { listGroups, listTags } from "@/lib/monitoring/queries";

export const metadata: Metadata = {
  title: "Monitor groups",
  robots: { index: false, follow: false },
};

export default async function MonitorGroupsPage() {
  const ctx = await requireMonitorPage();
  const [groups, tags] = await Promise.all([
    listGroups(ctx.organizationId),
    listTags(ctx.organizationId),
  ]);

  return (
    <div>
      <PageHeader
        title="Groups and tags"
        description="Organize monitors so the right ones are easy to find. Groups keep environments and teams tidy. Tags cut across them."
      />
      {ctx.canManage ? (
        <OrganizeManager
          organizationId={ctx.organizationId}
          groups={groups.map((g) => ({ id: g.id, name: g.name, description: g.description, monitorCount: g.monitorCount }))}
          tags={tags.map((t) => ({ id: t.id, name: t.name, colorToken: t.colorToken, monitorCount: t.monitorCount }))}
        />
      ) : (
        <p className="fj-wiz__hint">You do not have permission to manage groups and tags.</p>
      )}
    </div>
  );
}
