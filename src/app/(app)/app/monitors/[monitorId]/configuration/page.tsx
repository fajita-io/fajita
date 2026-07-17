import { notFound } from "next/navigation";

import { BrandCard } from "@/components/design-system/primitives";
import { MonitorEditForm, type EditableConfig } from "@/components/app/monitors/monitor-edit-form";
import { requireMonitorPage, loadMonitorDetail } from "@/lib/app/monitor-page";
import { resolveEntitlements } from "@/lib/monitoring/entitlements.server";
import { availableIntervals, intervalLabel } from "@/lib/monitoring/entitlements";
import { assertionLabel, absoluteTime } from "@/lib/monitoring/display";
import { formatResponseTime } from "@/lib/monitoring/uptime";

export default async function ConfigurationPage({
  params,
}: {
  params: Promise<{ monitorId: string }>;
}) {
  const { monitorId } = await params;
  const ctx = await requireMonitorPage();
  const monitor = await loadMonitorDetail(ctx.organizationId, monitorId);
  if (!monitor) notFound();
  const ent = await resolveEntitlements(ctx.organizationId);

  const initial: EditableConfig = {
    name: monitor.name,
    description: monitor.description ?? "",
    monitor_type: monitor.monitorType,
    target_url: monitor.fullTargetUrl,
    http_method: monitor.httpMethod,
    check_interval_seconds: monitor.checkIntervalSeconds,
    timeout_ms: monitor.timeoutMs,
    retry_count: monitor.retryCount,
    retry_delay_ms: monitor.retryDelayMs,
    follow_redirects: monitor.followRedirects,
    max_redirects: monitor.maxRedirects,
    expected_status_codes: monitor.expectedStatusCodes,
    response_time_threshold_ms: monitor.responseTimeThresholdMs,
    body_size_limit_bytes: 1048576,
    assertions: monitor.assertions.map((a, i) => ({
      assertion_type: a.assertionType,
      field_path: a.fieldPath,
      operator: a.operator,
      expected_value: a.expectedValue,
      expected_value_type: (a.expectedValueType as EditableConfig["assertions"][number]["expected_value_type"]) ?? "string",
      case_sensitive: a.caseSensitive,
      position: a.position ?? i,
    })),
  };

  const isHeartbeat = monitor.monitorType === "heartbeat";

  return (
    <div style={{ display: "grid", gap: "var(--space-5)" }}>
      <BrandCard>
        <h2 className="fj-section-title">Active configuration</h2>
        <dl className="fj-review-list">
          <dt>Name</dt><dd>{monitor.name}</dd>
          {!isHeartbeat ? (
            <>
              <dt>Destination</dt><dd><code>{monitor.safeDestination}</code></dd>
              <dt>Method</dt><dd>{monitor.httpMethod}</dd>
              <dt>Interval</dt><dd>{intervalLabel(monitor.checkIntervalSeconds)}</dd>
              <dt>Timeout</dt><dd>{Math.round(monitor.timeoutMs / 1000)} s</dd>
              <dt>Retries</dt><dd>{monitor.retryCount}</dd>
              <dt>Redirects</dt><dd>{monitor.followRedirects ? `Followed (max ${monitor.maxRedirects})` : "Not followed"}</dd>
              <dt>Expected status</dt><dd>{monitor.expectedStatusCodes.join(", ") || "—"}</dd>
              {monitor.responseTimeThresholdMs ? (
                <><dt>Response limit</dt><dd>{formatResponseTime(monitor.responseTimeThresholdMs)}</dd></>
              ) : null}
            </>
          ) : null}
          <dt>Region</dt><dd>{monitor.region}</dd>
          <dt>Group</dt><dd>{monitor.groupName ?? "Ungrouped"}</dd>
          <dt>Credentials</dt><dd>{monitor.secrets.length > 0 ? `${monitor.secrets.length} configured` : "None"}</dd>
          <dt>Version</dt><dd>{monitor.versionNumber ? `v${monitor.versionNumber}` : "Draft"}</dd>
          <dt>Last changed</dt><dd>{absoluteTime(monitor.updatedAt)}{monitor.updatedByName ? ` by ${monitor.updatedByName}` : ""}</dd>
        </dl>

        {monitor.assertions.length > 0 ? (
          <div style={{ marginTop: "var(--space-4)" }}>
            <h3 className="fj-section-title">Assertions</h3>
            <ul style={{ margin: 0, paddingLeft: "1.1rem", fontSize: "0.85rem", display: "grid", gap: "var(--space-1)" }}>
              {monitor.assertions.map((a) => (
                <li key={a.id}>
                  {assertionLabel(a.assertionType)}
                  {a.fieldPath ? ` · ${a.fieldPath}` : ""}
                  {a.expectedValue ? ` · ${a.expectedValue}` : ""}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </BrandCard>

      {ctx.canManage ? (
        <BrandCard>
          <h2 className="fj-section-title">Edit configuration</h2>
          <MonitorEditForm
            organizationId={ctx.organizationId}
            monitorId={monitor.id}
            initial={initial}
            intervals={availableIntervals(ent)}
            maxAssertions={ent.maxAssertionsPerMonitor}
          />
        </BrandCard>
      ) : null}
    </div>
  );
}
