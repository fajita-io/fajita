import { notFound } from "next/navigation";

import { BrandCard } from "@/components/design-system/primitives";
import { EmptyState } from "@/components/app/ui";
import { requireMonitorPage, loadMonitorDetail } from "@/lib/app/monitor-page";
import { listVersions } from "@/lib/monitoring/queries";
import { absoluteTime } from "@/lib/monitoring/display";

export default async function VersionsPage({
  params,
}: {
  params: Promise<{ monitorId: string }>;
}) {
  const { monitorId } = await params;
  const ctx = await requireMonitorPage();
  const monitor = await loadMonitorDetail(ctx.organizationId, monitorId);
  if (!monitor) notFound();

  const versions = await listVersions(ctx.organizationId, monitorId, monitor.currentVersionId);

  return (
    <div>
      <p className="fj-wiz__hint" style={{ marginTop: 0 }}>
        Every edit creates a new version. Older versions stay exactly as they were so your history keeps its
        meaning. Secret values never appear here.
      </p>
      {versions.length === 0 ? (
        <EmptyState title="No versions yet" description="Activate this monitor to create its first version." />
      ) : (
        <BrandCard variant="inset" style={{ padding: 0 }}>
          <div className="fj-mon-tablewrap">
            <table className="fj-mon-table">
              <caption className="fj-visually-hidden">Version history</caption>
              <thead>
                <tr>
                  <th scope="col">Version</th>
                  <th scope="col">Change</th>
                  <th scope="col">By</th>
                  <th scope="col">When</th>
                  <th scope="col">State</th>
                </tr>
              </thead>
              <tbody>
                {versions.map((v) => (
                  <tr key={v.id}>
                    <td>v{v.versionNumber}</td>
                    <td>{v.changeSummary ?? "—"}</td>
                    <td>{v.actorName ?? "—"}</td>
                    <td>
                      <time dateTime={v.createdAt} title={absoluteTime(v.createdAt)}>{absoluteTime(v.createdAt)}</time>
                    </td>
                    <td>
                      {v.isActive ? (
                        <span className="fj-mon-life" data-life="active">Active</span>
                      ) : (
                        <span className="fj-mon-life" data-life="disabled">Inactive</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </BrandCard>
      )}
    </div>
  );
}
