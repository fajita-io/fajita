import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { IncidentCard } from "@/components/status-public/status-page-view";
import { formatDuration, formatInstant } from "@/lib/status-pages/format";
import { getPublishedIncidentBySlug } from "@/lib/status-pages/projection";
import { loadFajitaServiceStatus } from "@/lib/platform/service-status";

export const revalidate = 30;

interface Params {
  params: Promise<{ incidentSlug: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { incidentSlug } = await params;
  const status = await loadFajitaServiceStatus();
  if (
    status.source !== "snapshot" ||
    !status.statusPageId ||
    !status.organizationId
  ) {
    return { title: "Incident", robots: { index: false, follow: false } };
  }

  const incident = await getPublishedIncidentBySlug(
    status.organizationId,
    status.statusPageId,
    incidentSlug,
  );
  if (!incident) {
    return { title: "Incident", robots: { index: false, follow: false } };
  }

  const indexable =
    status.data.seo.indexing && status.data.seo.indexIndividualIncidents;

  return {
    title: `${incident.title} · ${status.data.page.name}`,
    description: `Incident details and timeline for ${status.data.page.name}.`,
    robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
    alternates: { canonical: `/status/incidents/${incidentSlug}` },
  };
}

export default async function FajitaServiceStatusIncidentPage({ params }: Params) {
  const { incidentSlug } = await params;
  const status = await loadFajitaServiceStatus();
  if (
    status.source !== "snapshot" ||
    !status.statusPageId ||
    !status.organizationId
  ) {
    notFound();
  }

  const incident = await getPublishedIncidentBySlug(
    status.organizationId,
    status.statusPageId,
    incidentSlug,
  );
  if (!incident) notFound();

  const { page, theme } = status.data;

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
        <a className="sp-back" href="/status">
          ← {page.name} status
        </a>
        <IncidentCard
          incident={incident}
          basePath="/status"
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
