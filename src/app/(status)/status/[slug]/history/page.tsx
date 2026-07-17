import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { formatInstant } from "@/lib/status-pages/format";
import {
  getPublicSnapshotBySlug,
  listAllPublishedIncidents,
} from "@/lib/status-pages/projection";

export const revalidate = 60;

const loadSnapshot = cache(async (slug: string) => getPublicSnapshotBySlug(slug));

const PAGE_SIZE = 25;

interface Params {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const snapshot = await loadSnapshot(slug);
  if (!snapshot || snapshot.visibility !== "public") {
    return { title: "Incident history", robots: { index: false, follow: false } };
  }
  const indexable = snapshot.data.seo.indexing && snapshot.data.seo.indexIncidentArchive;
  return {
    title: `Incident history · ${snapshot.data.page.name}`,
    description: `Past incidents and resolutions for ${snapshot.data.page.name}.`,
    robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
    alternates: { canonical: `/status/${slug}/history` },
  };
}

export default async function IncidentHistoryPage({ params, searchParams }: Params) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const snapshot = await loadSnapshot(slug);
  if (!snapshot || snapshot.visibility === "password_protected" || snapshot.visibility === "organization_only") {
    notFound();
  }
  if (!snapshot.data.display.showIncidentHistory) notFound();

  const { page, theme } = snapshot.data;
  const all = await listAllPublishedIncidents(snapshot.organizationId, snapshot.statusPageId);
  const resolved = all.filter((i) => i.resolvedAt);

  const current = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const start = (current - 1) * PAGE_SIZE;
  const items = resolved.slice(start, start + PAGE_SIZE);
  const hasNext = start + PAGE_SIZE < resolved.length;

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
        <h1 className="sp-banner__title" style={{ marginBottom: "24px" }}>
          Incident history
        </h1>
        {items.length === 0 ? (
          <p className="sp-empty">No incidents have been published yet.</p>
        ) : (
          items.map((incident) => (
            <div key={incident.slug} className="sp-card" data-tone={incident.severity ?? "resolved"}>
              <p className="sp-card__title">
                <a href={`/status/${slug}/incidents/${incident.slug}`}>{incident.title}</a>
              </p>
              <p className="sp-card__meta">
                {formatInstant(incident.startedAt, page.timezone, page.locale)}
                {incident.resolvedAt
                  ? ` · resolved ${formatInstant(incident.resolvedAt, page.timezone, page.locale)}`
                  : ""}
              </p>
              {incident.affectedComponents.length > 0 ? (
                <div className="sp-card__components">
                  {incident.affectedComponents.map((name) => (
                    <span key={name} className="sp-tag">
                      {name}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ))
        )}
        {(current > 1 || hasNext) && (
          <nav
            style={{ display: "flex", justifyContent: "space-between", marginTop: "24px" }}
            aria-label="Incident history pagination"
          >
            {current > 1 ? (
              <a className="sp-back" href={`/status/${slug}/history?page=${current - 1}`}>
                ← Newer
              </a>
            ) : (
              <span />
            )}
            {hasNext ? (
              <a className="sp-back" href={`/status/${slug}/history?page=${current + 1}`}>
                Older →
              </a>
            ) : (
              <span />
            )}
          </nav>
        )}
      </div>
    </div>
  );
}
