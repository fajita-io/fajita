import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { IncidentCard } from "@/components/status-public/status-page-view";
import { formatDuration, formatInstant } from "@/lib/status-pages/format";
import {
  getPublicSnapshotBySlug,
  getPublishedIncidentBySlug,
} from "@/lib/status-pages/projection";

export const revalidate = 30;

const loadSnapshot = cache(async (slug: string) => getPublicSnapshotBySlug(slug));

interface Params {
  params: Promise<{ slug: string; incidentSlug: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug, incidentSlug } = await params;
  const snapshot = await loadSnapshot(slug);
  if (!snapshot || snapshot.visibility !== "public") {
    return { title: "Incident", robots: { index: false, follow: false } };
  }
  const incident = await getPublishedIncidentBySlug(
    snapshot.organizationId,
    snapshot.statusPageId,
    incidentSlug,
  );
  if (!incident) return { title: "Incident", robots: { index: false, follow: false } };
  const indexable = snapshot.data.seo.indexing && snapshot.data.seo.indexIndividualIncidents;
  return {
    title: `${incident.title} · ${snapshot.data.page.name}`,
    description: `Incident details and timeline for ${snapshot.data.page.name}.`,
    robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
    alternates: { canonical: `/status/${slug}/incidents/${incidentSlug}` },
  };
}

export default async function IncidentDetailPage({ params }: Params) {
  const { slug, incidentSlug } = await params;
  const snapshot = await loadSnapshot(slug);
  if (!snapshot || snapshot.visibility === "password_protected" || snapshot.visibility === "organization_only") {
    notFound();
  }
  const incident = await getPublishedIncidentBySlug(
    snapshot.organizationId,
    snapshot.statusPageId,
    incidentSlug,
  );
  if (!incident) notFound();

  const { page, theme } = snapshot.data;

  return (
    <div
      className="sp-root"
      data-theme={theme.key}
      data-radius={theme.appearance.radius}
      data-density={theme.appearance.density}
      data-header={theme.appearance.headerStyle}
      style={{ ["--sp-accent" as string]: theme.appearance.accentColor }}
      lang={page.locale || "en"}
    >
      <div className="sp-shell">
        <a className="sp-back" href={`/status/${slug}`}>
          ← {page.name} status
        </a>
        <IncidentCard
          incident={incident}
          basePath={`/status/${slug}`}
          timezone={page.timezone}
          locale={page.locale}
          showTimeline
        />
        {incident.resolvedAt ? (
          <p className="sp-card__meta" style={{ marginTop: "12px" }}>
            Total duration: {formatDuration(incident.startedAt, incident.resolvedAt)} · resolved{" "}
            {formatInstant(incident.resolvedAt, page.timezone, page.locale)}
          </p>
        ) : null}
      </div>
    </div>
  );
}
