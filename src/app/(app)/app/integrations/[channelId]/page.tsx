import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BrandIcon } from "@/components/design-system/icons";
import { AppSection, PageHeader } from "@/components/app/ui";
import {
  DeliveryStatusBadge,
  HealthBadge,
  ProviderMark,
  PROVIDER_LABEL,
  channelStatusLabel,
  errorLabel,
  eventLabel,
} from "@/components/app/alerts/alert-bits";
import { ChannelActions, ResendRecipientButton, RotateSigningKey } from "@/components/app/alerts/channel-actions";
import { requireAlertsPage } from "@/lib/alerts/alerts-page";
import { getChannelDetail, listDeliveries } from "@/lib/alerts/queries";
import { formatTimestamp, relativeTime } from "@/lib/incidents/duration";

export const metadata: Metadata = {
  title: "Alert channel",
  robots: { index: false, follow: false },
};

const VERIFY_LABEL: Record<string, string> = {
  unverified: "Not tested yet",
  verifying: "Verification pending",
  verified: "Verified",
  failed: "Last test failed",
};

export default async function ChannelDetailPage({
  params,
}: {
  params: Promise<{ channelId: string }>;
}) {
  const { channelId } = await params;
  const ctx = await requireAlertsPage();
  const channel = await getChannelDetail(ctx.organizationId, channelId);
  if (!channel) notFound();

  const deliveries = await listDeliveries(ctx.organizationId, { channelId, limit: 8 });

  return (
    <div className="fj-alerts">
      <Link className="fj-back-link" href="/app/integrations">
        <BrandIcon name="chevron-right" size={14} className="fj-flip-up" /> Integrations
      </Link>

      <PageHeader
        title={channel.name}
        description={channel.description ?? PROVIDER_LABEL[channel.provider]}
      />

      <div className="fj-chan-detail">
        <div className="fj-chan-detail__main">
          <AppSection title="Status">
            <div className="fj-chan-status-row">
              <ProviderMark provider={channel.provider} size={18} />
              <span className="fj-chan-status-row__provider">{PROVIDER_LABEL[channel.provider]}</span>
              <HealthBadge health={channel.healthStatus} />
              <span className="fj-tag-pill">{channelStatusLabel(channel.status)}</span>
              {channel.defaultForOrganization ? <span className="fj-tag-pill">Default</span> : null}
            </div>
            <dl className="fj-kv">
              <div><dt>Verification</dt><dd>{VERIFY_LABEL[channel.verificationStatus] ?? channel.verificationStatus}</dd></div>
              <div><dt>Last delivery</dt><dd>{channel.lastSuccessAt ? formatTimestamp(channel.lastSuccessAt, ctx.timezone) : "None yet"}</dd></div>
              <div><dt>Last failure</dt><dd>{channel.lastFailureAt ? formatTimestamp(channel.lastFailureAt, ctx.timezone) : "None"}</dd></div>
              <div><dt>Consecutive failures</dt><dd>{channel.consecutiveFailures}</dd></div>
              {channel.summary ? <div><dt>Destination</dt><dd>{channel.summary}</dd></div> : null}
            </dl>
            <div className="fj-chan-actions-wrap">
              <ChannelActions
                organizationId={ctx.organizationId}
                channelId={channel.id}
                status={channel.status}
                verificationStatus={channel.verificationStatus}
                isDefault={channel.defaultForOrganization}
                canManage={ctx.canManageAlerts}
              />
            </div>
          </AppSection>

          {channel.provider === "email" ? (
            <AppSection title="Recipients" description="Each address must verify before it can receive an alert.">
              <ul className="fj-recip-view" role="list">
                {channel.recipients.map((r) => (
                  <li key={r.id} className="fj-recip-view__row">
                    <div>
                      <span className="fj-recip-view__email">{r.email}</span>
                      {r.label ? <span className="fj-recip-view__label">{r.label}</span> : null}
                    </div>
                    <span className={`fj-verify fj-verify--${r.verificationStatus}`}>
                      {r.verificationStatus === "verified" ? "Verified" : r.verificationStatus === "failed" ? "Bounced" : "Pending"}
                    </span>
                    {ctx.canManageAlerts && r.verificationStatus === "pending" ? (
                      <ResendRecipientButton organizationId={ctx.organizationId} recipientId={r.id} />
                    ) : null}
                  </li>
                ))}
              </ul>
            </AppSection>
          ) : null}

          {channel.provider === "webhook" ? (
            <AppSection title="Signing" description="Verify the signature header on every request so you know it came from Fajita.">
              {channel.signingKeys.length === 0 ? (
                <p className="fj-inc-empty-line">Signing is off for this endpoint.</p>
              ) : (
                <ul className="fj-key-list" role="list">
                  {channel.signingKeys.map((k) => (
                    <li key={k.keyId} className="fj-key-row">
                      <code>{k.keyId}</code>
                      <span className="fj-tag-pill">{k.status}</span>
                      <span className="fj-key-row__when">Added {relativeTime(k.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              )}
              {ctx.canManageAlerts ? (
                <div className="fj-chan-actions-wrap">
                  <RotateSigningKey organizationId={ctx.organizationId} channelId={channel.id} />
                </div>
              ) : null}
            </AppSection>
          ) : null}

          <AppSection
            title="Recent deliveries"
            footer={
              <Link className="fj-link-button" href={`/app/integrations/deliveries?channel=${channel.id}`}>
                View all deliveries to this channel
              </Link>
            }
          >
            {deliveries.length === 0 ? (
              <p className="fj-inc-empty-line">No deliveries yet. Once a rule routes an event here, attempts appear in this list.</p>
            ) : (
              <ul className="fj-delivery-list" role="list">
                {deliveries.map((d) => (
                  <li key={d.id} className="fj-delivery-row">
                    <Link href={`/app/integrations/deliveries/${d.id}`} className="fj-delivery-row__link">
                      <DeliveryStatusBadge status={d.status} />
                      <span className="fj-delivery-row__event">{eventLabel(d.eventType)}</span>
                      <span className="fj-delivery-row__meta">
                        {d.lastErrorCategory ? errorLabel(d.lastErrorCategory) : `${d.attemptCount} attempt${d.attemptCount === 1 ? "" : "s"}`}
                      </span>
                      <span className="fj-delivery-row__when">{relativeTime(d.createdAt)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </AppSection>
        </div>

        <aside className="fj-chan-detail__side">
          <AppSection title="Recent tests">
            {channel.recentTests.length === 0 ? (
              <p className="fj-inc-empty-line">No tests yet.</p>
            ) : (
              <ul className="fj-test-list" role="list">
                {channel.recentTests.map((t) => (
                  <li key={t.id} className="fj-test-row" data-result={t.result ?? t.status}>
                    <BrandIcon name={t.result === "passed" || t.status === "delivered" ? "check" : "warning"} size={14} />
                    <div>
                      <span className="fj-test-row__result">
                        {t.result === "passed" || t.status === "delivered" ? "Passed" : errorLabel(t.errorCategory) ?? "Failed"}
                      </span>
                      {t.safeSummary ? <span className="fj-test-row__summary">{t.safeSummary}</span> : null}
                      <span className="fj-test-row__when">{relativeTime(t.createdAt)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </AppSection>

          <AppSection title="History">
            <ul className="fj-version-list" role="list">
              {channel.versions.map((v) => (
                <li key={v.version} className="fj-version-row">
                  <span className="fj-version-row__num">v{v.version}</span>
                  <span className="fj-version-row__reason">{v.changeReason ?? "Created"}</span>
                  <span className="fj-version-row__when">{relativeTime(v.createdAt)}</span>
                </li>
              ))}
            </ul>
          </AppSection>
        </aside>
      </div>
    </div>
  );
}
