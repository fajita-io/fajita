import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { formatInstant } from "@/lib/status-pages/format";
import { listAllPublishedIncidents } from "@/lib/status-pages/projection";
import { loadFajitaServiceStatus } from "@/lib/platform/service-status";

export const revalidate = 60;

const PAGE_SIZE = 25;

interface SearchParams {
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const status = await loadFajitaServiceStatus();
  if (status.source !== "snapshot" || !status.data.display.showIncidentHistory) {
    return { title: "Incident history", robots: { index: false, follow: false } };
  }

  const indexable =
    status.data.seo.indexing && status.data.seo.indexIncidentArchive;

  return {
    title: `Incident history · ${status.data.page.name}`,
    description: `Past incidents and resolutions for ${status.data.page.name}.`,
    robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
    alternates: { canonical: "/status/history" },
  };
}

export default async function FajitaServiceStatusHistoryPage({
  searchParams,
}: SearchParams) {
  const status = await loadFajitaServiceStatus();
  if (
    status.source !== "snapshot" ||
    !status.statusPageId ||
    !status.organizationId ||
    !status.data.display.showIncidentHistory
  ) {
    notFound();
  }

  const { page: pageParam } = await searchParams;
  const { page, theme } = status.data;
  const all = await listAllPublishedIncidents(
    status.organizationId,
    status.statusPageId,
  );
  const resolved = all.filter((incident) => incident.resolvedAt);

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
        <a className="sp-back" href="/status">
          ← {page.name} status
        </a>
        <h1 className="sp-banner__title" style={{ marginBottom: "24px" }}>
          Incident history
        </h1>
        {items.length === 0 ? (
          <p className="sp-empty">No incidents have been published yet.</p>
        ) : (
          items.map((incident) => (
            <div
              key={incident.slug}
              className="sp-card"
              data-tone={incident.severity ?? "resolved"}
            >
              <p className="sp-card__title">
                <a href={`/status/incidents/${incident.slug}`}>{incident.title}</a>
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
              <a className="sp-back" href={`/status/history?page=${current - 1}`}>
                ← Newer
              </a>
            ) : (
              <span />
            )}
            {hasNext ? (
              <a className="sp-back" href={`/status/history?page=${current + 1}`}>
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
