import type { Metadata } from "next";
import Link from "next/link";

import { BrandButtonLink } from "@/components/design-system/primitives";
import { BrandIcon } from "@/components/design-system/icons";
import { AppSection, EmptyState, PageHeader } from "@/components/app/ui";
import {
  HealthBadge,
  ProviderMark,
  PROVIDER_LABEL,
  channelStatusLabel,
} from "@/components/app/alerts/alert-bits";
import { requireAlertsPage } from "@/lib/alerts/alerts-page";
import { getAlertsOverview, listChannels } from "@/lib/alerts/queries";
import { relativeTime } from "@/lib/incidents/duration";

export const metadata: Metadata = {
  title: "Integrations",
  robots: { index: false, follow: false },
};

export default async function IntegrationsPage() {
  const ctx = await requireAlertsPage();
  const [overview, channels] = await Promise.all([
    getAlertsOverview(ctx.organizationId),
    listChannels(ctx.organizationId),
  ]);

  return (
    <div className="fj-alerts">
      <PageHeader
        title="Integrations"
        description="The right people hear about the problem before the wrong people do. Route incidents, maintenance, and certificate warnings to the channels your team already watches."
        actions={
          ctx.canManageAlerts ? (
            <BrandButtonLink href="/app/integrations/new">
              <BrandIcon name="plus" size={16} /> Add channel
            </BrandButtonLink>
          ) : undefined
        }
      />

      {channels.length === 0 ? (
        <AppSection>
          <EmptyState
            icon="webhook"
            title="No alert channels yet"
            description="Add a channel, send a test, then write one rule. Fajita will not send a real alert to any destination until you have tested it."
            action={
              ctx.canManageAlerts ? (
                <BrandButtonLink href="/app/integrations/new">Add your first channel</BrandButtonLink>
              ) : undefined
            }
          />
        </AppSection>
      ) : (
        <>
          <div className="fj-alerts-stats" role="list">
            <StatCard
              label="Channels"
              value={`${overview.activeChannelCount} active`}
              sub={`${overview.channelCount} total`}
              href="/app/integrations"
              tone={overview.unhealthyChannelCount > 0 ? "warn" : "calm"}
              note={overview.unhealthyChannelCount > 0 ? `${overview.unhealthyChannelCount} need attention` : undefined}
            />
            <StatCard
              label="Rules"
              value={`${overview.activeRuleCount} active`}
              sub={`${overview.ruleCount} total`}
              href="/app/integrations/rules"
              tone={overview.ruleCount === 0 ? "warn" : "calm"}
              note={overview.ruleCount === 0 ? "No route defined" : undefined}
            />
            <StatCard
              label="Delivered (24h)"
              value={String(overview.deliveredLast24h)}
              sub={`${overview.failedLast24h} failed`}
              href="/app/integrations/deliveries"
              tone={overview.failedLast24h > 0 ? "warn" : "calm"}
            />
            <StatCard
              label="Needs review"
              value={String(overview.openDeadLetters)}
              sub="undelivered"
              href="/app/integrations/deliveries?tab=dead-letters"
              tone={overview.openDeadLetters > 0 ? "alert" : "calm"}
            />
          </div>

          {overview.ruleCount === 0 ? (
            <div className="fj-alerts-nudge" role="note">
              <BrandIcon name="warning" size={16} />
              <div>
                <strong>Your channels are quiet.</strong> A channel receives alerts only when a rule
                sends them. {ctx.canManageAlerts ? "Write one rule to start routing." : "Ask an owner to add a routing rule."}
              </div>
              {ctx.canManageAlerts ? (
                <BrandButtonLink variant="secondary" size="sm" href="/app/integrations/rules/new">
                  Add a rule
                </BrandButtonLink>
              ) : null}
            </div>
          ) : null}

          <AppSection
            title="Channels"
            description="Each channel is versioned and its secrets are encrypted. Open one to test it, rotate credentials, or see recent deliveries."
          >
            <ul className="fj-chan-list" role="list">
              {channels.map((c) => (
                <li key={c.id} className="fj-chan-row">
                  <Link href={`/app/integrations/${c.id}`} className="fj-chan-row__link">
                    <ProviderMark provider={c.provider} />
                    <div className="fj-chan-row__main">
                      <div className="fj-chan-row__name">
                        {c.name}
                        {c.defaultForOrganization ? <span className="fj-tag-pill">Default</span> : null}
                      </div>
                      <div className="fj-chan-row__meta">
                        <span>{PROVIDER_LABEL[c.provider]}</span>
                        {c.summary ? <span>{c.summary}</span> : null}
                        <span>{channelStatusLabel(c.status)}</span>
                      </div>
                    </div>
                    <div className="fj-chan-row__side">
                      <HealthBadge health={c.healthStatus} />
                      <span className="fj-chan-row__when">
                        {c.lastSuccessAt
                          ? `Last delivered ${relativeTime(c.lastSuccessAt)}`
                          : c.lastTestedAt
                            ? `Tested ${relativeTime(c.lastTestedAt)}`
                            : "Never tested"}
                      </span>
                    </div>
                    <BrandIcon name="chevron-right" size={16} />
                  </Link>
                </li>
              ))}
            </ul>
          </AppSection>
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  href,
  tone,
  note,
}: {
  label: string;
  value: string;
  sub: string;
  href: string;
  tone: "calm" | "warn" | "alert";
  note?: string;
}) {
  return (
    <Link href={href} className="fj-stat-card" data-tone={tone} role="listitem">
      <span className="fj-stat-card__label">{label}</span>
      <span className="fj-stat-card__value">{value}</span>
      <span className="fj-stat-card__sub">{note ?? sub}</span>
    </Link>
  );
}
