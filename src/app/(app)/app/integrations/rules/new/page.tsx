import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BrandIcon } from "@/components/design-system/icons";
import { AppSection, EmptyState, PageHeader } from "@/components/app/ui";
import { BrandButtonLink } from "@/components/design-system/primitives";
import { RuleForm } from "@/components/app/alerts/rule-form";
import { requireAlertsPage } from "@/lib/alerts/alerts-page";
import { listChannelOptions } from "@/lib/alerts/queries";
import { listMonitorsForSelect } from "@/lib/incidents/queries";
import { listGroups, listTags } from "@/lib/monitoring/queries";

export const metadata: Metadata = {
  title: "Add routing rule",
  robots: { index: false, follow: false },
};

export default async function NewRulePage() {
  const ctx = await requireAlertsPage();
  if (!ctx.canManageAlerts) notFound();

  const [channels, monitors, groups, tags] = await Promise.all([
    listChannelOptions(ctx.organizationId),
    listMonitorsForSelect(ctx.organizationId),
    listGroups(ctx.organizationId),
    listTags(ctx.organizationId),
  ]);

  return (
    <div className="fj-alerts">
      <Link className="fj-back-link" href="/app/integrations/rules">
        <BrandIcon name="chevron-right" size={14} className="fj-flip-up" /> Routing rules
      </Link>

      <PageHeader title="Add routing rule" description="Choose the events, the monitors they cover, and where they go." />

      {channels.length === 0 ? (
        <AppSection>
          <EmptyState
            icon="webhook"
            title="Add a channel first"
            description="A rule needs a destination. Create and test a channel, then write the rule."
            action={<BrandButtonLink href="/app/integrations/new">Add a channel</BrandButtonLink>}
          />
        </AppSection>
      ) : (
        <AppSection>
          <RuleForm
            organizationId={ctx.organizationId}
            channels={channels.map((c) => ({ id: c.id, name: c.name, provider: c.provider as never, status: c.status }))}
            monitors={monitors}
            groups={groups.map((g) => ({ id: g.id, name: g.name }))}
            tags={tags.map((t) => ({ id: t.id, name: t.name }))}
          />
        </AppSection>
      )}
    </div>
  );
}
