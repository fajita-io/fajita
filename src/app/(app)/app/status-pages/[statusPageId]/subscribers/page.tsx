import type { Metadata } from "next";

import { SubscriberSettingsForm } from "@/components/app/subscribers/settings-form";
import { requireSubscriberContext } from "@/lib/app/subscriber-context";
import {
  getSubscriberCounts,
  getSubscriberSettings,
  getDeliveryHealth,
  listSubscribers,
} from "@/lib/subscribers/admin";

export const metadata: Metadata = {
  title: "Subscribers",
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ statusPageId: string }>;
  searchParams: Promise<{ status?: string; page?: string }>;
}

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmed",
  pending: "Pending",
  unsubscribed: "Unsubscribed",
  bounced: "Bounced",
  complained: "Complained",
  suppressed: "Suppressed",
  pending_deletion: "Pending deletion",
};

export default async function SubscribersPage({ params, searchParams }: Props) {
  const { statusPageId } = await params;
  const { status, page } = await searchParams;
  const ctx = await requireSubscriberContext(statusPageId);

  const [counts, health, settings, list] = await Promise.all([
    getSubscriberCounts(ctx.organizationId, statusPageId),
    getDeliveryHealth(ctx.organizationId, statusPageId),
    getSubscriberSettings(ctx.organizationId, statusPageId),
    listSubscribers(ctx.organizationId, statusPageId, {
      status: status || undefined,
      page: page ? Number.parseInt(page, 10) : 1,
      includeSensitive: ctx.canReadSensitive,
    }),
  ]);

  const metrics: { label: string; value: number }[] = [
    { label: "Confirmed", value: counts.confirmed },
    { label: "Pending", value: counts.pending },
    { label: "Unsubscribed", value: counts.unsubscribed },
    { label: "Bounced", value: counts.bounced },
    { label: "Complained", value: counts.complained },
    { label: "Suppressed", value: counts.suppressed },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 960 }}>
      <header>
        <h1 style={{ margin: "0 0 4px", fontSize: 22 }}>Subscribers</h1>
        <p style={{ margin: 0, fontSize: 14, color: "var(--muted, #666)" }}>
          {ctx.statusPage.name} · operational status-page email
        </p>
      </header>

      <section
        aria-label="Subscriber metrics"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: 12,
        }}
      >
        {metrics.map((m) => (
          <div
            key={m.label}
            className="card"
            style={{ padding: 14, borderRadius: 10, border: "1px solid #e5e5e7" }}
          >
            <div style={{ fontSize: 24, fontWeight: 700 }}>{m.value}</div>
            <div style={{ fontSize: 12, color: "var(--muted, #666)" }}>{m.label}</div>
          </div>
        ))}
      </section>

      <section
        aria-label="Delivery health"
        style={{ display: "flex", gap: 20, flexWrap: "wrap", fontSize: 13 }}
      >
        <span>Delivered: {health.delivered}</span>
        <span>Pending: {health.pending}</span>
        <span>Failed: {health.failed}</span>
        <span>Dead-lettered: {health.deadLettered}</span>
      </section>

      {settings ? (
        <SubscriberSettingsForm
          organizationId={ctx.organizationId}
          statusPageId={statusPageId}
          initial={settings}
          canManage={ctx.canManageSettings}
        />
      ) : null}

      <section aria-label="Subscriber list">
        <h2 style={{ fontSize: 16, margin: "0 0 12px" }}>
          Subscribers ({list.total})
        </h2>
        {list.items.length === 0 ? (
          <p style={{ fontSize: 14, color: "var(--muted, #666)" }}>
            No subscribers yet. When someone subscribes from the public status
            page and confirms, they appear here.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid #e5e5e7" }}>
                  <th style={{ padding: "8px 10px" }}>Email</th>
                  <th style={{ padding: "8px 10px" }}>Status</th>
                  <th style={{ padding: "8px 10px" }}>Scope</th>
                  <th style={{ padding: "8px 10px" }}>Source</th>
                  <th style={{ padding: "8px 10px" }}>Confirmed</th>
                </tr>
              </thead>
              <tbody>
                {list.items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid #f0f0f2" }}>
                    <td style={{ padding: "8px 10px", fontFamily: "ui-monospace, monospace" }}>
                      {item.email}
                    </td>
                    <td style={{ padding: "8px 10px" }}>
                      {STATUS_LABELS[item.status] ?? item.status}
                    </td>
                    <td style={{ padding: "8px 10px" }}>
                      {item.allComponents === false ? "Selected" : "All"}
                      {item.incidentUpdates === false ? ", no incidents" : ""}
                      {item.maintenanceUpdates === false ? ", no maintenance" : ""}
                    </td>
                    <td style={{ padding: "8px 10px" }}>{item.source}</td>
                    <td style={{ padding: "8px 10px" }}>
                      {item.confirmedAt
                        ? new Date(item.confirmedAt).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
