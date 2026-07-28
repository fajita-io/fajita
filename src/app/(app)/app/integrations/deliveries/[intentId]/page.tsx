import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BrandIcon } from "@/components/design-system/icons";
import { AppSection, PageHeader } from "@/components/app/ui";
import {
  DeliveryStatusBadge,
  SeverityTag,
  errorLabel,
  eventLabel,
} from "@/components/app/alerts/alert-bits";
import { requireAlertsPage } from "@/lib/alerts/alerts-page";
import { getDeliveryDetail } from "@/lib/alerts/queries";
import { formatTimestamp, relativeTime } from "@/lib/incidents/duration";

export const metadata: Metadata = {
  title: "Delivery detail",
  robots: { index: false, follow: false },
};

const ATTEMPT_LABEL: Record<string, string> = {
  delivered: "Delivered",
  retryable_failure: "Failed, will retry",
  permanent_failure: "Failed permanently",
  skipped: "Skipped",
};

export default async function DeliveryDetailPage({
  params,
}: {
  params: Promise<{ intentId: string }>;
}) {
  const { intentId } = await params;
  const ctx = await requireAlertsPage();
  const delivery = await getDeliveryDetail(ctx.organizationId, intentId);
  if (!delivery) notFound();

  return (
    <div className="fj-alerts">
      <Link className="fj-back-link" href="/app/integrations/deliveries">
        <BrandIcon name="chevron-right" size={14} className="fj-flip-up" /> Deliveries
      </Link>

      <PageHeader title={eventLabel(delivery.eventType)} description={delivery.routingExplanation ?? undefined} />

      <div className="fj-chan-detail">
        <div className="fj-chan-detail__main">
          <AppSection title="Attempts">
            {delivery.attempts.length === 0 ? (
              <p className="fj-inc-empty-line">
                {delivery.status === "scheduled" || delivery.status === "pending"
                  ? "Scheduled. The first attempt has not run yet."
                  : delivery.status === "suppressed"
                    ? "Held back by a rule or quiet hours. No attempt was made."
                    : "No attempts recorded."}
              </p>
            ) : (
              <ol className="fj-attempt-list" role="list">
                {delivery.attempts.map((a) => (
                  <li key={a.attemptNumber} className="fj-attempt-row" data-result={a.result}>
                    <div className="fj-attempt-row__num">#{a.attemptNumber}{a.isManual ? " · manual" : ""}</div>
                    <div className="fj-attempt-row__body">
                      <span className="fj-attempt-row__result">
                        {ATTEMPT_LABEL[a.result] ?? a.result}
                        {a.errorCategory ? ` · ${errorLabel(a.errorCategory)}` : ""}
                      </span>
                      {a.safeSummary ? <span className="fj-attempt-row__summary">{a.safeSummary}</span> : null}
                      <span className="fj-attempt-row__meta">
                        {a.httpStatus ? `HTTP ${a.httpStatus} · ` : ""}
                        {a.durationMs != null ? `${a.durationMs} ms · ` : ""}
                        {formatTimestamp(a.startedAt, ctx.timezone)}
                        {a.nextRetryAt ? ` · next try ${relativeTime(a.nextRetryAt)}` : ""}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </AppSection>
        </div>

        <aside className="fj-chan-detail__side">
          <AppSection title="Summary">
            <div className="fj-chan-status-row">
              <DeliveryStatusBadge status={delivery.status} />
              <SeverityTag severity={delivery.severity} />
            </div>
            <dl className="fj-kv">
              <div><dt>Channel</dt><dd>{delivery.channelName ? <Link href={`/app/integrations/${delivery.channelId}`}>{delivery.channelName}</Link> : delivery.provider}</dd></div>
              <div><dt>Kind</dt><dd>{delivery.kind === "recovery" ? "Recovery" : "Event"}</dd></div>
              <div><dt>Attempts</dt><dd>{delivery.attemptCount}</dd></div>
              {delivery.incidentId ? <div><dt>Incident</dt><dd><Link href={`/app/incidents/${delivery.incidentId}`}>Open incident</Link></dd></div> : null}
              <div><dt>Created</dt><dd>{formatTimestamp(delivery.createdAt, ctx.timezone)}</dd></div>
              {delivery.completedAt ? <div><dt>Completed</dt><dd>{formatTimestamp(delivery.completedAt, ctx.timezone)}</dd></div> : null}
              {delivery.lastErrorCategory ? <div><dt>Last error</dt><dd>{errorLabel(delivery.lastErrorCategory)}</dd></div> : null}
            </dl>
          </AppSection>
        </aside>
      </div>
    </div>
  );
}
