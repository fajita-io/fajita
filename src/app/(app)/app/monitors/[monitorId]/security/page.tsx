import { notFound } from "next/navigation";

import { BrandCard } from "@/components/design-system/primitives";
import { SecretManager } from "@/components/app/monitors/secret-manager";
import { HeartbeatSetup } from "@/components/app/monitors/heartbeat-setup";
import { requireMonitorPage, loadMonitorDetail } from "@/lib/app/monitor-page";
import { getHeartbeatToken } from "@/lib/monitoring/queries";
import { intervalLabel } from "@/lib/monitoring/entitlements";
import { relativeTime } from "@/lib/monitoring/display";

export default async function SecurityPage({
  params,
}: {
  params: Promise<{ monitorId: string }>;
}) {
  const { monitorId } = await params;
  const ctx = await requireMonitorPage();
  const monitor = await loadMonitorDetail(ctx.organizationId, monitorId);
  if (!monitor) notFound();

  const isHeartbeat = monitor.monitorType === "heartbeat";
  const token = isHeartbeat ? await getHeartbeatToken(ctx.organizationId, monitorId) : null;

  return (
    <div style={{ display: "grid", gap: "var(--space-5)" }}>
      {isHeartbeat ? (
        <BrandCard>
          <h2 className="fj-section-title">Ping URL</h2>
          {token ? (
            <p className="fj-wiz__hint" style={{ marginTop: 0 }}>
              Expected {intervalLabel(token.expectedIntervalSeconds).toLowerCase()}, grace {Math.round(token.gracePeriodSeconds / 60)} min.
              {token.lastHeartbeatAt ? ` Last ping ${relativeTime(token.lastHeartbeatAt)}.` : " No pings received yet."}
            </p>
          ) : null}
          <HeartbeatSetup
            organizationId={ctx.organizationId}
            monitorId={monitor.id}
            token={
              token
                ? {
                    id: token.id,
                    maskedLabel: token.maskedLabel,
                    state: token.state,
                    expectedIntervalSeconds: token.expectedIntervalSeconds,
                    gracePeriodSeconds: token.gracePeriodSeconds,
                  }
                : null
            }
          />
        </BrandCard>
      ) : (
        <BrandCard>
          <h2 className="fj-section-title">Credentials</h2>
          {ctx.canManage ? (
            <SecretManager
              organizationId={ctx.organizationId}
              monitorId={monitor.id}
              secrets={monitor.secrets.map((s) => ({
                id: s.id,
                secretType: s.secretType,
                headerName: s.headerName,
                maskedLabel: s.maskedLabel,
                rotatedAt: s.rotatedAt,
              }))}
            />
          ) : (
            <p className="fj-wiz__hint" style={{ marginTop: 0 }}>
              {monitor.secrets.length > 0
                ? `${monitor.secrets.length} credential(s) configured. Only managers can view or change them.`
                : "No credentials configured."}
            </p>
          )}
        </BrandCard>
      )}

      <BrandCard>
        <h2 className="fj-section-title">Destination safety</h2>
        <dl className="fj-review-list">
          <dt>Status</dt><dd>Public destination verified before every check</dd>
          {!isHeartbeat ? (
            <>
              <dt>Allowed method</dt><dd>{monitor.httpMethod}</dd>
              <dt>Redirects</dt><dd>{monitor.followRedirects ? "Followed, each destination re-validated" : "Not followed"}</dd>
            </>
          ) : null}
          <dt>Private networks</dt><dd>Always blocked</dd>
        </dl>
        <p className="fj-wiz__hint">
          Fajita rejects private, local, and restricted addresses, and re-validates every redirect. Use scoped,
          read-only credentials, rotate them periodically, and keep secrets out of the URL.
        </p>
      </BrandCard>
    </div>
  );
}
