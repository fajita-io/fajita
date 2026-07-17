import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  OpsBreadcrumbs,
  OpsEmpty,
  OpsMetricCard,
  OpsPageHeader,
  OpsPanel,
} from "@/components/platform/ops-ui";
import { getPlatformAccess } from "@/lib/platform/access";
import { loadCustomer360 } from "@/lib/platform/customers/detail";
import { logPlatformAdminAction } from "@/lib/platform/logging";

export const metadata: Metadata = {
  title: "Customer 360",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function Customer360Page({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const { organizationId } = await params;
  const detail = await loadCustomer360(organizationId);
  if (!detail) notFound();

  const access = await getPlatformAccess();
  if (access) {
    await logPlatformAdminAction({
      action: "platform.search.performed",
      actorUserId: access.profile.id,
      organizationId,
      resourceType: "organization",
      resourceId: organizationId,
      summary: "Customer 360 viewed",
      metadata: { view: "customer_360" },
    });
  }

  const { organization: org } = detail;

  return (
    <>
      <OpsBreadcrumbs
        items={[
          { href: "/internal/command-center", label: "Ops" },
          { href: "/internal/customers", label: "Organizations" },
          { label: org.name },
        ]}
      />
      <OpsPageHeader
        title={org.name}
        deck={`${org.slug} · created ${org.created_at.slice(0, 10)} · ${org.status}${
          org.is_internal ? " · internal" : ""
        }`}
      />

      <div className="fj-ops-grid">
        <OpsMetricCard
          label="MRR"
          value={detail.mrrLabel}
          completeness="complete"
          meta="recurring"
        />
        <OpsMetricCard
          label="Plan"
          value={detail.subscription?.plan_key ?? "—"}
          completeness="complete"
        />
        <OpsMetricCard
          label="Billing"
          value={detail.subscription?.access_state ?? detail.subscription?.status ?? "—"}
          completeness="complete"
        />
        <OpsMetricCard
          label="Lifecycle"
          value={detail.lifecycle?.state ?? "—"}
          completeness="complete"
        />
        <OpsMetricCard
          label="Health"
          value={
            (detail.health as { health_state?: string } | null)?.health_state ??
            detail.lifecycle?.state ??
            "—"
          }
          completeness="complete"
        />
        <OpsMetricCard
          label="Members"
          value={detail.memberCount}
          completeness="complete"
        />
      </div>

      <div className="fj-ops-two-col">
        <OpsPanel title="Product">
          <p className="fj-ops-card__meta">
            Monitors {detail.monitors.length} · Open-ish incidents{" "}
            {detail.incidents.filter((i) => !i.resolved_at).length} · Status pages{" "}
            {detail.statusPages.length}
          </p>
          {detail.monitors.length === 0 ? (
            <OpsEmpty>No monitors. Names only; URLs and secrets stay hidden.</OpsEmpty>
          ) : (
            <table className="fj-ops-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Interval</th>
                </tr>
              </thead>
              <tbody>
                {detail.monitors.slice(0, 20).map((m) => (
                  <tr key={m.id}>
                    <td>{m.name}</td>
                    <td>{m.monitor_type}</td>
                    <td>{m.status}</td>
                    <td>{m.check_interval_seconds}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </OpsPanel>

        <OpsPanel title="Revenue">
          {detail.subscription ? (
            <table className="fj-ops-table">
              <tbody>
                <tr>
                  <th>Stripe subscription</th>
                  <td>{detail.subscription.stripe_subscription_id}</td>
                </tr>
                <tr>
                  <th>Interval</th>
                  <td>{detail.subscription.billing_interval}</td>
                </tr>
                <tr>
                  <th>Period end</th>
                  <td>{detail.subscription.current_period_end?.slice(0, 10) ?? "—"}</td>
                </tr>
                <tr>
                  <th>Cancel at period end</th>
                  <td>{detail.subscription.cancel_at_period_end ? "yes" : "no"}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <OpsEmpty>No subscription record.</OpsEmpty>
          )}
        </OpsPanel>
      </div>

      <OpsPanel title="Recent incidents">
        {detail.incidents.length === 0 ? (
          <OpsEmpty>No incidents.</OpsEmpty>
        ) : (
          <table className="fj-ops-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Severity</th>
                <th>Opened</th>
              </tr>
            </thead>
            <tbody>
              {detail.incidents.map((i) => (
                <tr key={i.id}>
                  <td>{i.title}</td>
                  <td>{i.lifecycle_status}</td>
                  <td>{i.severity}</td>
                  <td>{i.opened_at.slice(0, 16)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </OpsPanel>

      <OpsPanel title="Internal notes">
        {(detail.notes as Array<{ id: string; category: string; body: string; created_at: string }>).length ===
        0 ? (
          <OpsEmpty>No internal notes yet.</OpsEmpty>
        ) : (
          <ul className="fj-ops-attention">
            {(detail.notes as Array<{ id: string; category: string; body: string; created_at: string }>).map(
              (n) => (
                <li key={n.id} style={{ padding: "10px 0" }}>
                  <span className="fj-ops-pill">{n.category}</span>{" "}
                  <span className="fj-ops-card__meta">{n.created_at.slice(0, 16)}</span>
                  <div style={{ marginTop: 6 }}>{n.body}</div>
                </li>
              ),
            )}
          </ul>
        )}
      </OpsPanel>
    </>
  );
}
