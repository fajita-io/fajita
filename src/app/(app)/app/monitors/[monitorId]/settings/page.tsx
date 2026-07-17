import { notFound } from "next/navigation";

import { BrandCard } from "@/components/design-system/primitives";
import { MonitorSettingsForm } from "@/components/app/monitors/monitor-settings-form";
import { requireMonitorPage, loadMonitorDetail } from "@/lib/app/monitor-page";
import { listGroups, listTags } from "@/lib/monitoring/queries";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ monitorId: string }>;
}) {
  const { monitorId } = await params;
  const ctx = await requireMonitorPage();
  const monitor = await loadMonitorDetail(ctx.organizationId, monitorId);
  if (!monitor) notFound();

  const [groups, tags] = await Promise.all([
    listGroups(ctx.organizationId),
    listTags(ctx.organizationId),
  ]);

  return (
    <div style={{ display: "grid", gap: "var(--space-5)" }}>
      <BrandCard>
        <h2 className="fj-section-title">Organize</h2>
        {ctx.canManage ? (
          <MonitorSettingsForm
            organizationId={ctx.organizationId}
            monitorId={monitor.id}
            currentGroupId={monitor.groupId}
            groups={groups.map((g) => ({ id: g.id, name: g.name }))}
            allTags={tags.map((t) => ({ id: t.id, name: t.name, colorToken: t.colorToken }))}
            assignedTagIds={monitor.tags.map((t) => t.id)}
          />
        ) : (
          <p className="fj-wiz__hint" style={{ marginTop: 0 }}>
            You do not have permission to change this monitor.
          </p>
        )}
      </BrandCard>

      <BrandCard>
        <h2 className="fj-section-title">Lifecycle</h2>
        <p className="fj-wiz__hint" style={{ marginTop: 0 }}>
          Pause, resume, duplicate, archive, and delete from the actions in the header. Pausing keeps your
          history and stops new checks. Archiving hides the monitor from active views but keeps everything.
          Deleting removes it for good.
        </p>
      </BrandCard>
    </div>
  );
}
