import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BrandIcon } from "@/components/design-system/icons";
import { AppSection, PageHeader } from "@/components/app/ui";
import { RuleForm } from "@/components/app/alerts/rule-form";
import { requireAlertsPage } from "@/lib/alerts/alerts-page";
import { getRuleDetail, listChannelOptions } from "@/lib/alerts/queries";
import { listMonitorsForSelect } from "@/lib/incidents/queries";
import { listGroups, listTags } from "@/lib/monitoring/queries";
import type { ScopeKind } from "@/lib/alerts/constants";

export const metadata: Metadata = {
  title: "Edit routing rule",
  robots: { index: false, follow: false },
};

export default async function EditRulePage({
  params,
}: {
  params: Promise<{ ruleId: string }>;
}) {
  const { ruleId } = await params;
  const ctx = await requireAlertsPage();
  if (!ctx.canManageAlerts) notFound();

  const rule = await getRuleDetail(ctx.organizationId, ruleId);
  if (!rule) notFound();

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

      <PageHeader title="Edit routing rule" description="Changes apply to future events. Deliveries already in flight are not affected." />

      <AppSection>
        <RuleForm
          organizationId={ctx.organizationId}
          channels={channels.map((c) => ({ id: c.id, name: c.name, provider: c.provider as never, status: c.status }))}
          monitors={monitors}
          groups={groups.map((g) => ({ id: g.id, name: g.name }))}
          tags={tags.map((t) => ({ id: t.id, name: t.name }))}
          initial={{
            ruleId: rule.id,
            name: rule.name,
            scopeKind: rule.scopeKind as ScopeKind,
            recoveryBehavior: rule.recoveryBehavior,
            quietBehavior: rule.quietBehavior,
            deduplicate: rule.deduplicate,
            eventTypes: rule.eventTypes,
            severities: rule.severities,
            monitorIds: rule.monitorIds,
            groupIds: rule.groupIds,
            tagIds: rule.tagIds,
            channels: rule.channels.map((c) => ({ channelId: c.channelId, role: c.role as "primary" | "recovery_only" | "fallback" })),
          }}
        />
      </AppSection>
    </div>
  );
}
