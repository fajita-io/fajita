import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import {
  IncidentCard,
  StatusPageView,
} from "@/components/status-public/status-page-view";
import { OVERALL_STATE_LABEL } from "@/lib/status-pages/constants";
import { formatInstant } from "@/lib/status-pages/format";
import {
  getPublicSnapshotByDomain,
  getPublishedIncidentBySlug,
  listAllPublishedIncidents,
  type PublicSnapshot,
} from "@/lib/status-pages/projection";

/**
 * Custom-domain renderer. Middleware rewrites requests arriving on a verified
 * custom domain to /_status-host/<host><path>. This one route handles the page
 * root, the incident archive, and incident detail on the customer's own domain,
 * with links resolved relative to the domain root (basePath is empty). Only
 * verified domains with active TLS resolve here.
 */
export const revalidate = 30;

interface Params {
  params: Promise<{ host: string; path?: string[] }>;
}

async function resolve(host: string): Promise<PublicSnapshot | null> {
  const snapshot = await getPublicSnapshotByDomain(decodeURIComponent(host));
  if (!snapshot) return null;
  if (snapshot.visibility === "password_protected" || snapshot.visibility === "organization_only") {
    return null;
  }
  return snapshot;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { host } = await params;
  const decodedHost = decodeURIComponent(host);
  const snapshot = await resolve(host);
  if (!snapshot) return { title: "Status", robots: { index: false, follow: false } };
  const { page } = snapshot.data;
  const statusLabel = OVERALL_STATE_LABEL[snapshot.overallStatus];
  const title = page.title || `${page.name} Status`;
  const description =
    page.description ||
    `Current status and incident history for ${page.name}. ${statusLabel}.`;
  const index = snapshot.data.seo.indexing;
  const canonical = `https://${decodedHost}/`;

  return {
    title,
    description,
    robots: index ? { index: true, follow: true } : { index: false, follow: false },
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonical,
      images: [{ url: `https://${decodedHost}/opengraph-image` }],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function CustomDomainStatusPage({ params }: Params) {
  const { host, path } = await params;
  const snapshot = await resolve(host);
  if (!snapshot) notFound();

  const segments = path ?? [];
  const { page, theme } = snapshot.data;

  const wrapperProps = {
    className: "sp-root",
    "data-theme": theme.key,
    "data-radius": theme.appearance.radius,
    "data-density": theme.appearance.density,
    "data-header": theme.appearance.headerStyle,
    style: { ["--sp-accent" as string]: theme.appearance.accentColor },
    lang: page.locale || "en",
  };

  // Incident detail: /incidents/<slug>
  if (segments[0] === "incidents" && segments[1]) {
    const incident = await getPublishedIncidentBySlug(
      snapshot.organizationId,
      snapshot.statusPageId,
      segments[1],
    );
    if (!incident) notFound();
    return (
      <div {...wrapperProps}>
        <div className="sp-shell">
          {/* On the custom domain, "/" is the status page root, not the app home. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a className="sp-back" href="/">
            ← {page.name} status
          </a>
          <IncidentCard
            incident={incident}
            basePath=""
            timezone={page.timezone}
            locale={page.locale}
            showTimeline
          />
        </div>
      </div>
    );
  }

  // Archive: /history
  if (segments[0] === "history") {
    if (!snapshot.data.display.showIncidentHistory) notFound();
    const all = await listAllPublishedIncidents(snapshot.organizationId, snapshot.statusPageId);
    const resolved = all.filter((i) => i.resolvedAt).slice(0, 50);
    return (
      <div {...wrapperProps}>
        <div className="sp-shell">
          {/* On the custom domain, "/" is the status page root, not the app home. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a className="sp-back" href="/">
            ← {page.name} status
          </a>
          <h1 className="sp-banner__title" style={{ marginBottom: "24px" }}>
            Incident history
          </h1>
          {resolved.length === 0 ? (
            <p className="sp-empty">No incidents have been published yet.</p>
          ) : (
            resolved.map((incident) => (
              <div key={incident.slug} className="sp-card" data-tone={incident.severity ?? "resolved"}>
                <p className="sp-card__title">
                  <a href={`/incidents/${incident.slug}`}>{incident.title}</a>
                </p>
                <p className="sp-card__meta">
                  {formatInstant(incident.startedAt, page.timezone, page.locale)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  if (segments.length > 0) notFound();

  return (
    <StatusPageView
      data={snapshot.data}
      basePath=""
      generatedAt={snapshot.generatedAt}
      subscribeSlug={snapshot.slug}
    />
  );
}
