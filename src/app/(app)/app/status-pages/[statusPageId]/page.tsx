import type { Metadata } from "next";

import { AppSection } from "@/components/app/ui";
import { PublishPanel } from "@/components/app/status-pages/publish-panel";
import { STATUS_PAGE_THEMES } from "@/lib/status-pages/constants";
import { hostedStatusUrl, hostedSubdomain } from "@/lib/status-pages/config";
import { requireStatusPage } from "@/lib/app/status-page-context";
import { listComponents } from "@/lib/status-pages/components";
import { listDomains } from "@/lib/status-pages/domains";

export const metadata: Metadata = {
  title: "Status page overview",
  robots: { index: false, follow: false },
};

const VISIBILITY_LABEL: Record<string, string> = {
  public: "Public",
  password_protected: "Password protected",
  private_link: "Private link",
  organization_only: "Organization only",
};

export default async function StatusPageOverview({
  params,
}: {
  params: Promise<{ statusPageId: string }>;
}) {
  const { statusPageId } = await params;
  const ctx = await requireStatusPage(statusPageId);
  const page = ctx.statusPage;

  const [components, domains] = await Promise.all([
    listComponents(statusPageId, { includeArchived: false }),
    listDomains(ctx.organizationId, statusPageId),
  ]);

  const unmapped = components.filter((c) => c.monitors.length === 0 && c.calculationMode !== "manual").length;
  const primaryDomain = domains.find((d) => d.isPrimary);

  return (
    <div style={{ display: "grid", gap: "var(--space-5)" }}>
      <AppSection title="Publication">
        {page.status === "published" ? (
          <p className="fj-sp-alert" data-tone="success">
            Live at{" "}
            <a href={hostedStatusUrl(page.slug)} target="_blank" rel="noopener">
              {primaryDomain?.domain ?? hostedSubdomain(page.slug)}
            </a>
            . Republish after making changes to update the public page.
          </p>
        ) : (
          <p className="fj-sp-alert" data-tone="info">
            This page is a draft. Nothing is public until you publish. Add components and map monitors first.
          </p>
        )}
        <PublishPanel
          organizationId={ctx.organizationId}
          statusPageId={statusPageId}
          status={page.status}
          canPublish={ctx.canPublish}
        />
      </AppSection>

      <AppSection title="Configuration">
        <div className="fj-sp-defs">
          <Def k="Publication state" v={page.status} />
          <Def k="Public address" v={hostedSubdomain(page.slug)} />
          <Def k="Custom domain" v={primaryDomain?.domain ?? "None"} />
          <Def
            k="Domain / TLS"
            v={
              primaryDomain
                ? `${primaryDomain.verificationStatus} / ${primaryDomain.tlsStatus}`
                : "Hosted subdomain (managed TLS)"
            }
          />
          <Def k="Visibility" v={VISIBILITY_LABEL[page.visibility] ?? page.visibility} />
          <Def k="Components" v={`${components.length}${unmapped > 0 ? ` (${unmapped} without a monitor)` : ""}`} />
          <Def k="Theme" v={STATUS_PAGE_THEMES.includes(page.themeKey) ? page.themeKey : "signal"} />
          <Def k="Timezone" v={page.timezone} />
          <Def k="Uptime history" v={page.showUptimeHistory ? `${page.uptimeHistoryDays} days` : "Hidden"} />
          <Def k="Search indexing" v={page.searchIndexingEnabled ? "Enabled" : "Noindex"} />
          <Def k="Powered by Fajita" v={page.poweredByVisible ? "Visible" : "Hidden"} />
          <Def
            k="Last published"
            v={page.publishedAt ? new Date(page.publishedAt).toLocaleString() : "Never"}
          />
        </div>
      </AppSection>
    </div>
  );
}

function Def({ k, v }: { k: string; v: string }) {
  return (
    <div className="fj-sp-def">
      <span className="fj-sp-def__key">{k}</span>
      <span className="fj-sp-def__val">{v}</span>
    </div>
  );
}
