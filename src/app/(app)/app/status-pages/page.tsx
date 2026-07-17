import type { Metadata } from "next";
import Link from "next/link";

import { AppSection, EmptyState, PageHeader } from "@/components/app/ui";
import { BrandButtonLink } from "@/components/design-system/primitives";
import { BrandIcon } from "@/components/design-system/icons";
import { OVERALL_STATE_LABEL, type OverallState } from "@/lib/status-pages/constants";
import { hostedSubdomain } from "@/lib/status-pages/config";
import { requireStatusPageContext } from "@/lib/app/status-page-context";
import { listStatusPages } from "@/lib/status-pages/status-pages";

export const metadata: Metadata = {
  title: "Status pages",
  robots: { index: false, follow: false },
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  publishing: "Publishing",
  published: "Published",
  unpublished: "Unpublished",
  suspended: "Suspended",
  pending_deletion: "Pending deletion",
  deleted: "Deleted",
};

export default async function StatusPagesPage() {
  const ctx = await requireStatusPageContext();
  const pages = await listStatusPages(ctx.organizationId);

  return (
    <div>
      <PageHeader
        title="Status pages"
        description="Tell your customers what you already know. One page for live component status, incidents, maintenance, and history."
        actions={
          ctx.canManage ? (
            <BrandButtonLink href="/app/status-pages/new">
              <BrandIcon name="plus" size={16} /> New status page
            </BrandButtonLink>
          ) : undefined
        }
      />

      {pages.length === 0 ? (
        <AppSection>
          <EmptyState
            icon="status-page"
            title="Keep customers informed when production gets complicated."
            description="Publish live component status, incident updates, scheduled maintenance, and historical uptime from a page that looks like it belongs to your company."
            action={
              ctx.canManage ? (
                <BrandButtonLink href="/app/status-pages/new">Create status page</BrandButtonLink>
              ) : undefined
            }
          />
        </AppSection>
      ) : (
        <div className="fj-sp-list">
          {pages.map((page) => (
            <Link key={page.id} href={`/app/status-pages/${page.id}`} className="fj-sp-list__row">
              <div className="fj-sp-list__main">
                <span className="fj-sp-list__name">{page.name}</span>
                <span className="fj-sp-list__host fj-mono">
                  {page.primaryDomain ?? hostedSubdomain(page.slug)}
                </span>
              </div>
              <div className="fj-sp-list__meta">
                <span className="fj-sp-badge" data-status={page.status}>
                  {STATUS_LABEL[page.status] ?? page.status}
                </span>
                {page.overallStatus ? (
                  <span
                    className="fj-sp-overall"
                    data-state={page.overallStatus}
                    title={OVERALL_STATE_LABEL[page.overallStatus as OverallState]}
                  >
                    {OVERALL_STATE_LABEL[page.overallStatus as OverallState]}
                  </span>
                ) : null}
                <span className="fj-sp-list__count">
                  {page.componentCount} component{page.componentCount === 1 ? "" : "s"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
