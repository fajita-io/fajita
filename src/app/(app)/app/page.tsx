import type { Metadata } from "next";
import Link from "next/link";

import { BrandIcon, type BrandIconName } from "@/components/design-system/icons";
import {
  AppSection,
  PageHeader,
  RoleBadge,
} from "@/components/app/ui";
import { BrandButtonLink } from "@/components/design-system/primitives";
import { ActivationChecklist } from "@/components/app/onboarding/activation-checklist";
import { requireActiveContext } from "@/lib/app/page-context";
import { getOnboardingState } from "@/lib/app/onboarding";
import { countActiveMembers } from "@/lib/app/organizations";
import { listAuditEvents } from "@/lib/app/audit";
import { actionLabel, relativeTime } from "@/lib/app/format";
import { can, type Permission } from "@/lib/auth/roles";
import { isFeatureEnabled } from "@/lib/app/feature-flags.server";
import { isPlatformAdmin } from "@/lib/auth/context";
import { getIncidentOverview } from "@/lib/incidents/queries";
import { getStatusPageOverview } from "@/lib/status-pages/status-pages";
import { listWeeklyReports } from "@/lib/reports/queries";

export const metadata: Metadata = {
  title: "Overview",
  robots: { index: false, follow: false },
};

function OpsMetric({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: BrandIconName;
  tone?: "attention" | "down";
}) {
  return (
    <div className="fj-inc-metric" data-tone={value > 0 ? tone : undefined}>
      <div className="fj-inc-metric__label">
        <BrandIcon name={icon} size={14} /> {label}
      </div>
      <div className="fj-inc-metric__value fj-numeric">{value}</div>
    </div>
  );
}

const STEP_UNAVAILABLE_COPY: Record<string, string> = {
  "monitors:manage": "Requires monitor management permission. Ask an owner or admin.",
  "integrations:manage": "Requires integration management permission. Ask an owner or admin.",
  "status_pages:manage": "Requires status page permission. Ask an owner or admin.",
  "members:invite": "Requires invitation permission. Ask an owner or admin.",
};

export default async function OverviewPage() {
  const { profile, membership } = await requireActiveContext();
  const org = membership.organization;

  const [onboarding, memberCount, events, incidentsEnabled, statusPagesEnabled, reportsEnabled, admin] =
    await Promise.all([
      getOnboardingState(org.id),
      countActiveMembers(org.id),
      can(membership.role, "audit:read")
        ? listAuditEvents(org.id, 6)
        : Promise.resolve([]),
      isFeatureEnabled("incidents", org.id),
      isFeatureEnabled("statusPages", org.id),
      isFeatureEnabled("reports", org.id),
      isPlatformAdmin(),
    ]);
  const showOps = incidentsEnabled || admin;
  const ops = showOps ? await getIncidentOverview(org.id) : null;
  const showStatusPages = statusPagesEnabled || admin;
  const statusPages = showStatusPages ? await getStatusPageOverview(org.id) : null;
  const latestReports =
    (reportsEnabled || admin) && onboarding.signals.activeMonitorCount > 0
      ? await listWeeklyReports(org.id, 1)
      : [];
  const latestReport = latestReports[0] ?? null;

  const firstName = profile.display_name?.trim().split(/\s+/)[0] ?? "there";
  const monitoring = onboarding.signals.activeMonitorCount > 0;
  const nextStep = onboarding.steps.find((s) => !s.done && !s.optional && s.href);
  const showChecklist = !onboarding.dismissed;

  const checklistSteps = onboarding.steps.map((step) => {
    const permission = step.permission as Permission | null | undefined;
    const actionable = !permission || can(membership.role, permission);
    return {
      key: step.key,
      title: step.title,
      description: step.description,
      done: step.done,
      optional: step.optional,
      skipped: step.skipped,
      href: step.href,
      actionable,
      unavailableReason:
        !actionable && !step.done && permission
          ? STEP_UNAVAILABLE_COPY[permission] ?? "Not available with your role."
          : undefined,
    };
  });

  return (
    <>
      <PageHeader
        title={
          onboarding.activated
            ? `Welcome back, ${firstName}.`
            : `Welcome to Fajita, ${firstName}.`
        }
        description={
          onboarding.activated
            ? `${org.name} is fully connected: monitoring, alert path, and status page are live.`
            : monitoring
              ? `Fajita is watching ${onboarding.signals.activeMonitorCount === 1 ? "your first monitor" : `${onboarding.signals.activeMonitorCount} monitors`} for ${org.name}. A few steps remain before everything is connected.`
              : "Create your first monitor and Fajita starts watching within minutes. Everything below stays open while you set up."
        }
        actions={<RoleBadge role={membership.role} />}
      />

      {showChecklist ? (
        <AppSection
          title="Setup"
          footer={
            nextStep && !onboarding.activated ? (
              <BrandButtonLink href={nextStep.href!} size="sm">
                Continue setup
              </BrandButtonLink>
            ) : undefined
          }
        >
          <ActivationChecklist
            organizationId={org.id}
            steps={checklistSteps}
            activated={onboarding.activated}
            canDismiss
          />
        </AppSection>
      ) : null}

      {ops ? (
        <AppSection
          title="Operations"
          description="Confirmed states only. One failed check is not an outage."
          footer={
            <Link className="fj-link-button" href="/app/incidents">
              View incidents
            </Link>
          }
        >
          <div className="fj-inc-metrics">
            <OpsMetric label="Active incidents" value={ops.activeIncidents} icon="incident" tone={ops.activeIncidents > 0 ? "down" : undefined} />
            <OpsMetric label="Unacknowledged" value={ops.unacknowledged} icon="bell" tone={ops.unacknowledged > 0 ? "attention" : undefined} />
            <OpsMetric label="Verifying" value={ops.verifying} icon="warning" />
            <OpsMetric label="Degraded" value={ops.degraded} icon="warning" tone={ops.degraded > 0 ? "attention" : undefined} />
            <OpsMetric label="Down" value={ops.down} icon="alert" tone={ops.down > 0 ? "down" : undefined} />
            <OpsMetric label="Maintenance" value={ops.activeMaintenance} icon="maintenance" />
          </div>
        </AppSection>
      ) : null}

      {latestReport ? (
        <AppSection
          title="Latest weekly report"
          footer={
            <Link className="fj-link-button" href="/app/reports">
              All reports
            </Link>
          }
        >
          <p className="fj-app-section__desc" style={{ margin: 0 }}>
            <Link
              className="fj-link-button"
              href={`/app/reports/weekly/${latestReport.id}`}
            >
              {latestReport.periodLabel}
            </Link>
            {latestReport.successRateLabel
              ? ` · ${latestReport.successRateLabel} check success`
              : ""}
            {latestReport.incidentCount != null
              ? ` · ${latestReport.incidentCount} ${latestReport.incidentCount === 1 ? "incident" : "incidents"}`
              : ""}
          </p>
        </AppSection>
      ) : null}

      {statusPages && statusPages.publishedCount + statusPages.draftCount > 0 ? (
        <AppSection
          title="Status pages"
          description="Real counts from your pages."
          footer={
            <Link className="fj-link-button" href="/app/status-pages">
              Manage status pages
            </Link>
          }
        >
          <div className="fj-inc-metrics">
            <OpsMetric label="Published" value={statusPages.publishedCount} icon="status-page" />
            <OpsMetric label="Drafts" value={statusPages.draftCount} icon="status-page" />
            <OpsMetric label="Active public incidents" value={statusPages.activePublicIncidents} icon="incident" tone={statusPages.activePublicIncidents > 0 ? "down" : undefined} />
            <OpsMetric label="Upcoming maintenance" value={statusPages.upcomingMaintenance} icon="maintenance" />
            <OpsMetric label="Needs republish" value={statusPages.pagesNeedingPublication} icon="warning" tone={statusPages.pagesNeedingPublication > 0 ? "attention" : undefined} />
            <OpsMetric label="Components without a monitor" value={statusPages.componentsWithoutMonitor} icon="warning" tone={statusPages.componentsWithoutMonitor > 0 ? "attention" : undefined} />
            <OpsMetric label="Domains needing attention" value={statusPages.domainsNeedingAttention} icon="warning" tone={statusPages.domainsNeedingAttention > 0 ? "attention" : undefined} />
            <OpsMetric label="TLS issues" value={statusPages.tlsIssues} icon="alert" tone={statusPages.tlsIssues > 0 ? "down" : undefined} />
          </div>
        </AppSection>
      ) : null}

      <div className="fj-overview-grid">
        <AppSection title="Organization readiness">
          <dl className="fj-stat-list">
            <div>
              <dt>Organization</dt>
              <dd>{org.name}</dd>
            </div>
            <div>
              <dt>Handle</dt>
              <dd style={{ fontFamily: "var(--font-mono)" }}>{org.slug}</dd>
            </div>
            <div>
              <dt>Team</dt>
              <dd>{memberCount === 1 ? "Just you" : `${memberCount} members`}</dd>
            </div>
            <div>
              <dt>Time zone</dt>
              <dd>{org.default_timezone.replace(/_/g, " ")}</dd>
            </div>
          </dl>
        </AppSection>

        <AppSection
          title="Recent activity"
          description={
            can(membership.role, "audit:read")
              ? undefined
              : "Activity history is available to owners and admins."
          }
        >
          {events.length > 0 ? (
            <ul className="fj-activity">
              {events.map((event) => (
                <li key={event.id} className="fj-activity__item">
                  <BrandIcon name="check" size={14} />
                  <span>
                    <strong>{event.actorName ?? "Someone"}</strong>{" "}
                    {actionLabel(event.action)}
                  </span>
                  <time dateTime={event.createdAt} className="fj-activity__time">
                    {relativeTime(event.createdAt)}
                  </time>
                </li>
              ))}
            </ul>
          ) : (
            <p className="fj-app-section__desc">
              {can(membership.role, "audit:read")
                ? "Nothing yet. Actions like invitations and settings changes will show here."
                : "Nothing to show."}
            </p>
          )}
        </AppSection>
      </div>
    </>
  );
}
