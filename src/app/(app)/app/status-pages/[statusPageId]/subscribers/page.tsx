import type { Metadata } from "next";

import { AppSection, EmptyState } from "@/components/app/ui";
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
    <div className="fj-subscribers-page">
      <p className="fj-subscribers-page__lede">
        Operational status-page email for {ctx.statusPage.name}. No marketing
        sends.
      </p>

      <section aria-label="Subscriber metrics" className="fj-inc-metrics">
        {metrics.map((m) => (
          <div key={m.label} className="fj-inc-metric">
            <div className="fj-inc-metric__value">{m.value}</div>
            <div className="fj-inc-metric__label">{m.label}</div>
          </div>
        ))}
      </section>

      <AppSection title="Delivery health">
        <dl className="fj-stat-list fj-stat-list--inline">
          <div>
            <dt>Delivered</dt>
            <dd>{health.delivered}</dd>
          </div>
          <div>
            <dt>Pending</dt>
            <dd>{health.pending}</dd>
          </div>
          <div>
            <dt>Failed</dt>
            <dd>{health.failed}</dd>
          </div>
          <div>
            <dt>Dead-lettered</dt>
            <dd>{health.deadLettered}</dd>
          </div>
        </dl>
      </AppSection>

      {settings ? (
        <SubscriberSettingsForm
          organizationId={ctx.organizationId}
          statusPageId={statusPageId}
          initial={settings}
          canManage={ctx.canManageSettings}
        />
      ) : null}

      <AppSection title={`Subscribers (${list.total})`}>
        {list.items.length === 0 ? (
          <EmptyState
            icon="status-page"
            title="No subscribers yet"
            description="When someone subscribes from the public status page and confirms, they appear here."
          />
        ) : (
          <div className="fj-table-scroll">
            <table className="fj-table fj-subscribers-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Scope</th>
                  <th>Source</th>
                  <th>Confirmed</th>
                </tr>
              </thead>
              <tbody>
                {list.items.map((item) => (
                  <tr key={item.id}>
                    <td className="fj-subscribers-table__email">{item.email}</td>
                    <td>{STATUS_LABELS[item.status] ?? item.status}</td>
                    <td>
                      {item.allComponents === false ? "Selected" : "All"}
                      {item.incidentUpdates === false ? ", no incidents" : ""}
                      {item.maintenanceUpdates === false ? ", no maintenance" : ""}
                    </td>
                    <td>{item.source}</td>
                    <td>
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
      </AppSection>
    </div>
  );
}
