import type { Metadata } from "next";
import Link from "next/link";

import { BrandIcon } from "@/components/design-system/icons";
import { AppSection, EmptyState, PageHeader } from "@/components/app/ui";
import {
  DeliveryStatusBadge,
  SeverityTag,
  errorLabel,
  eventLabel,
} from "@/components/app/alerts/alert-bits";
import { DeadLetterActions, ExportDeliveriesButton } from "@/components/app/alerts/delivery-tools";
import { requireAlertsPage } from "@/lib/alerts/alerts-page";
import { listDeadLetters, listDeliveries } from "@/lib/alerts/queries";
import { relativeTime } from "@/lib/incidents/duration";

export const metadata: Metadata = {
  title: "Alert deliveries",
  robots: { index: false, follow: false },
};

// Categories that cannot be safely retried without fixing configuration first.
const NON_RETRYABLE = new Set(["authentication_failed", "permission_denied", "webhook_blocked", "recipient_suppressed", "configuration_error"]);

export default async function DeliveriesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; channel?: string; status?: string; incident?: string }>;
}) {
  const { tab, channel, status, incident } = await searchParams;
  const ctx = await requireAlertsPage();
  const showDeadLetters = tab === "dead-letters";

  const [deliveries, deadLetters] = await Promise.all([
    showDeadLetters ? Promise.resolve([]) : listDeliveries(ctx.organizationId, { channelId: channel, status, incidentId: incident }),
    listDeadLetters(ctx.organizationId, "open"),
  ]);

  return (
    <div className="fj-alerts">
      <Link className="fj-back-link" href="/app/integrations">
        <BrandIcon name="chevron-right" size={14} className="fj-flip-up" /> Integrations
      </Link>

      <PageHeader
        title="Deliveries"
        description="Every attempt Fajita made, with the outcome and why. Nothing here reveals a secret or the message body sent to a provider."
        actions={<ExportDeliveriesButton organizationId={ctx.organizationId} />}
      />

      <nav className="fj-tabs" aria-label="Delivery views">
        <Link className="fj-tab" data-active={!showDeadLetters || undefined} href="/app/integrations/deliveries">
          Recent
        </Link>
        <Link className="fj-tab" data-active={showDeadLetters || undefined} href="/app/integrations/deliveries?tab=dead-letters">
          Needs review
          {deadLetters.length > 0 ? <span className="fj-tab__count">{deadLetters.length}</span> : null}
        </Link>
      </nav>

      {showDeadLetters ? (
        deadLetters.length === 0 ? (
          <AppSection>
            <EmptyState
              icon="check"
              title="Nothing needs review"
              description="When Fajita exhausts its retries for a delivery, it lands here so you can fix the cause and try again. It is empty, which is the good kind of empty."
            />
          </AppSection>
        ) : (
          <AppSection>
            <ul className="fj-dl-list" role="list">
              {deadLetters.map((d) => (
                <li key={d.id} className="fj-dl-row">
                  <div className="fj-dl-row__main">
                    <div className="fj-dl-row__head">
                      <span className="fj-dl-row__event">{eventLabel(d.eventType)}</span>
                      {d.channelName ? <span className="fj-dl-row__chan">{d.channelName}</span> : null}
                      {d.errorCategory ? <span className="fj-dl-row__error">{errorLabel(d.errorCategory)}</span> : null}
                    </div>
                    {d.suggestedAction ? <p className="fj-dl-row__hint">{d.suggestedAction}</p> : null}
                    <span className="fj-dl-row__when">Gave up {relativeTime(d.finalAttemptAt ?? d.createdAt)}</span>
                  </div>
                  {ctx.canManageAlerts ? (
                    <DeadLetterActions
                      organizationId={ctx.organizationId}
                      deadLetterId={d.id}
                      canRetry={Boolean(d.channelId) && !NON_RETRYABLE.has(d.errorCategory ?? "")}
                    />
                  ) : null}
                </li>
              ))}
            </ul>
          </AppSection>
        )
      ) : deliveries.length === 0 ? (
        <AppSection>
          <EmptyState
            icon="response-time"
            title="No deliveries yet"
            description="Once a routing rule sends an event to a channel, every attempt shows up here with its outcome."
          />
        </AppSection>
      ) : (
        <AppSection>
          <ul className="fj-delivery-list fj-delivery-list--full" role="list">
            {deliveries.map((d) => (
              <li key={d.id} className="fj-delivery-row">
                <Link href={`/app/integrations/deliveries/${d.id}`} className="fj-delivery-row__link">
                  <DeliveryStatusBadge status={d.status} />
                  <span className="fj-delivery-row__event">
                    {eventLabel(d.eventType)}
                    <SeverityTag severity={d.severity} />
                  </span>
                  <span className="fj-delivery-row__chan">{d.channelName ?? d.provider}</span>
                  <span className="fj-delivery-row__meta">
                    {d.lastErrorCategory ? errorLabel(d.lastErrorCategory) : `${d.attemptCount} attempt${d.attemptCount === 1 ? "" : "s"}`}
                  </span>
                  <span className="fj-delivery-row__when">{relativeTime(d.createdAt)}</span>
                  <BrandIcon name="chevron-right" size={15} />
                </Link>
              </li>
            ))}
          </ul>
        </AppSection>
      )}
    </div>
  );
}
