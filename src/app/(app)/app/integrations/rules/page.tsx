import type { Metadata } from "next";
import Link from "next/link";

import { BrandButtonLink } from "@/components/design-system/primitives";
import { BrandIcon } from "@/components/design-system/icons";
import { AppSection, EmptyState, PageHeader } from "@/components/app/ui";
import { RuleRowActions } from "@/components/app/alerts/rule-row-actions";
import { requireAlertsPage } from "@/lib/alerts/alerts-page";
import { listChannelOptions, listRules } from "@/lib/alerts/queries";

export const metadata: Metadata = {
  title: "Routing rules",
  robots: { index: false, follow: false },
};

const SCOPE_LABEL: Record<string, string> = {
  organization: "All monitors",
  monitor: "Specific monitors",
  group: "Monitor groups",
  tag: "Tags",
};

export default async function RulesPage() {
  const ctx = await requireAlertsPage();
  const [rules, channels] = await Promise.all([
    listRules(ctx.organizationId),
    listChannelOptions(ctx.organizationId),
  ]);

  return (
    <div className="fj-alerts">
      <Link className="fj-back-link" href="/app/integrations">
        <BrandIcon name="chevron-right" size={14} className="fj-flip-up" /> Integrations
      </Link>

      <PageHeader
        title="Routing rules"
        description="A rule decides which events reach which channels. The most specific rule wins when two would send to the same place, so a monitor rule can override an organization-wide one."
        actions={
          ctx.canManageAlerts && channels.length > 0 ? (
            <BrandButtonLink href="/app/integrations/rules/new">
              <BrandIcon name="plus" size={16} /> Add rule
            </BrandButtonLink>
          ) : undefined
        }
      />

      {channels.length === 0 ? (
        <AppSection>
          <EmptyState
            icon="webhook"
            title="Add a channel first"
            description="A rule needs somewhere to send. Create and test a channel, then come back to route events to it."
            action={<BrandButtonLink href="/app/integrations/new">Add a channel</BrandButtonLink>}
          />
        </AppSection>
      ) : rules.length === 0 ? (
        <AppSection>
          <EmptyState
            icon="alert"
            title="No routing rules yet"
            description="Until a rule exists, alerts have nowhere to go. Start with one rule that sends outages to your team, then refine."
            action={ctx.canManageAlerts ? <BrandButtonLink href="/app/integrations/rules/new">Write your first rule</BrandButtonLink> : undefined}
          />
        </AppSection>
      ) : (
        <AppSection>
          <ul className="fj-rule-list" role="list">
            {rules.map((r) => (
              <li key={r.id} className="fj-rule-row" data-status={r.status}>
                <Link href={`/app/integrations/rules/${r.id}`} className="fj-rule-row__main">
                  <span className="fj-rule-row__name">
                    {r.name}
                    {r.status !== "active" ? <span className="fj-tag-pill">Disabled</span> : null}
                  </span>
                  <span className="fj-rule-row__meta">
                    {SCOPE_LABEL[r.scopeKind] ?? r.scopeKind} · {r.eventTypeCount || "all"} events · {r.channelCount} {r.channelCount === 1 ? "channel" : "channels"}
                  </span>
                </Link>
                {ctx.canManageAlerts ? (
                  <RuleRowActions organizationId={ctx.organizationId} ruleId={r.id} status={r.status} />
                ) : null}
              </li>
            ))}
          </ul>
        </AppSection>
      )}
    </div>
  );
}
