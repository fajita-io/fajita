import { FajitaLogo } from "@/components/brand/logo/fajita-logo";
import Link from "next/link";
import { OVERALL_STATE_LABEL } from "@/lib/status-pages/constants";
import { formatInstant, formatUptimePercent } from "@/lib/status-pages/format";
import type {
  PublicComponent,
  PublicIncident,
  PublicMaintenance,
  PublicSnapshotData,
} from "@/lib/status-pages/snapshot-types";

import { PoweredBy } from "./powered-by";
import { StatePill } from "./state-pill";
import { SubscribeForm } from "./subscribe-form";
import { UptimeBar } from "./uptime-bar";

const STALE_THRESHOLD_MS = 15 * 60 * 1000;

/**
 * The public status page. Server-rendered from the allowlisted snapshot only.
 * No client JavaScript, no authenticated data. `basePath` is empty on a custom
 * domain root and `/status/<slug>` on the hosted domain, so links resolve on
 * either host.
 */
export function StatusPageView({
  data,
  basePath,
  generatedAt,
  subscribeSlug,
  brandLockup,
}: {
  data: PublicSnapshotData;
  basePath: string;
  generatedAt: string;
  /**
   * Public slug the subscribe form posts to. When present (and the page allows
   * the form), the active subscribe form renders. When absent, the form is not
   * shown, so we never render a dead control.
   */
  subscribeSlug?: string;
  /** When set to "fajita", render the Fajita lockup instead of plain page name text. */
  brandLockup?: "fajita";
}) {
  const { page, theme, display, overall } = data;
  const allComponents = [
    ...data.ungrouped,
    ...data.groups.flatMap((g) => g.components),
  ].map((c) => ({ slug: c.slug, name: c.name }));
  const staleMs = Date.now() - new Date(generatedAt).getTime();
  const isStale = Number.isFinite(staleMs) && staleMs > STALE_THRESHOLD_MS;

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
        <header className="sp-header">
          <div className="sp-brand">
            {page.websiteUrl ? (
              <a className="sp-brand__link" href={page.websiteUrl} rel="noopener nofollow">
                <StatusBrandMark brandLockup={brandLockup} page={page} theme={theme} />
              </a>
            ) : (
              <StatusBrandMark brandLockup={brandLockup} page={page} theme={theme} />
            )}
          </div>
          <nav className="sp-header__links" aria-label="Company links">
            {page.websiteUrl ? (
              <a href={page.websiteUrl} rel="noopener nofollow">
                Website
              </a>
            ) : null}
            {page.supportUrl ? (
              <a href={page.supportUrl} rel="noopener nofollow">
                Support
              </a>
            ) : null}
          </nav>
        </header>

        <main>
          {page.headline ? (
            <p className="sp-section" style={{ marginTop: "-12px" }}>
              {page.headline}
            </p>
          ) : null}

          {isStale ? (
            <p className="sp-stale" role="status">
              This page could not refresh recently. It is showing the last
              confirmed status from {formatInstant(generatedAt, page.timezone, page.locale)}.
            </p>
          ) : null}

          <section
            className="sp-banner"
            data-state={overall}
            aria-label="Overall status"
          >
            <span className="sp-banner__dot" aria-hidden="true" />
            <span className="sp-banner__text">
              <span className="sp-banner__title">{OVERALL_STATE_LABEL[overall]}</span>
              <span className="sp-banner__meta">
                Updated {formatInstant(data.lastUpdatedAt, page.timezone, page.locale)}
              </span>
            </span>
          </section>

          {data.notices.length > 0 ? (
            <section className="sp-section" aria-label="Notices">
              {data.notices.map((notice) => (
                <div key={notice.slug} className="sp-notice">
                  <p className="sp-notice__title">{notice.title}</p>
                  <div
                    className="sp-notice__body sp-update__body"
                    dangerouslySetInnerHTML={{ __html: notice.bodyHtml }}
                  />
                </div>
              ))}
            </section>
          ) : null}

          {data.activeIncidents.length > 0 ? (
            <section className="sp-section" aria-label="Active incidents">
              <h2 className="sp-section__title">Active incidents</h2>
              {data.activeIncidents.map((incident) => (
                <IncidentCard
                  key={incident.slug}
                  incident={incident}
                  basePath={basePath}
                  timezone={page.timezone}
                  locale={page.locale}
                  showTimeline
                />
              ))}
            </section>
          ) : null}

          {display.showScheduledMaintenance && data.activeMaintenance.length > 0 ? (
            <section className="sp-section" aria-label="Active maintenance">
              <h2 className="sp-section__title">Maintenance in progress</h2>
              {data.activeMaintenance.map((m) => (
                <MaintenanceCard key={m.slug} maintenance={m} timezone={page.timezone} locale={page.locale} />
              ))}
            </section>
          ) : null}

          <section className="sp-section" aria-label="Components">
            <h2 className="sp-section__title">Components</h2>
            <div className="sp-components">
              {data.groups.map((group) => (
                <div key={group.name} className="sp-group">
                  <div className="sp-group__head">
                    <span className="sp-group__name">{group.name}</span>
                  </div>
                  <div className="sp-group__body">
                    {group.components.map((c) => (
                      <ComponentRow
                        key={c.slug}
                        component={c}
                        showDescription={display.showComponentDescriptions}
                        showResponseTime={display.showResponseTime}
                        timezone={page.timezone}
                        locale={page.locale}
                      />
                    ))}
                  </div>
                </div>
              ))}
              {data.ungrouped.map((c) => (
                <div key={c.slug} className="sp-component">
                  <ComponentInner
                    component={c}
                    showDescription={display.showComponentDescriptions}
                    showResponseTime={display.showResponseTime}
                    timezone={page.timezone}
                    locale={page.locale}
                  />
                </div>
              ))}
              {data.groups.length === 0 && data.ungrouped.length === 0 ? (
                <p className="sp-empty">No components have been added yet.</p>
              ) : null}
            </div>
          </section>

          {display.showScheduledMaintenance && data.upcomingMaintenance.length > 0 ? (
            <section className="sp-section" aria-label="Scheduled maintenance">
              <h2 className="sp-section__title">Scheduled maintenance</h2>
              {data.upcomingMaintenance.map((m) => (
                <MaintenanceCard key={m.slug} maintenance={m} timezone={page.timezone} locale={page.locale} />
              ))}
            </section>
          ) : null}

          {display.showIncidentHistory ? (
            <section className="sp-section" aria-label="Recent incident history">
              <h2 className="sp-section__title">Past incidents</h2>
              {data.recentIncidents.length > 0 ? (
                <>
                  {data.recentIncidents.map((incident) => (
                    <div key={incident.slug} className="sp-card" data-tone={incident.severity ?? "resolved"}>
                      <p className="sp-card__title">
                        <a href={`${basePath}/incidents/${incident.slug}`}>{incident.title}</a>
                      </p>
                      <p className="sp-card__meta">
                        {incident.resolvedAt ? "Resolved" : "Ongoing"} ·{" "}
                        {formatInstant(incident.startedAt, page.timezone, page.locale)}
                      </p>
                    </div>
                  ))}
                  <p style={{ marginTop: "8px" }}>
                    <a className="sp-back" href={`${basePath}/history`}>
                      View full incident history
                    </a>
                  </p>
                </>
              ) : (
                <p className="sp-empty">
                  No incidents have been recorded since monitoring began.
                </p>
              )}
            </section>
          ) : null}

          {display.showSubscriberForm && subscribeSlug ? (
            <SubscribeForm slug={subscribeSlug} components={allComponents} />
          ) : null}
        </main>

        <footer className="sp-footer">
          <span>© {new Date().getFullYear()} {page.name}</span>
          {brandLockup === "fajita" ? (
            <Link className="sp-back" href="/signup">
              Start monitoring your own stack
            </Link>
          ) : display.poweredByVisible ? (
            <PoweredBy />
          ) : (
            <span />
          )}
          <span className="sp-freshness">
            Last checked {formatInstant(generatedAt, page.timezone, page.locale)}
          </span>
        </footer>
      </div>
    </div>
  );
}

function StatusBrandMark({
  brandLockup,
  page,
  theme,
}: {
  brandLockup?: "fajita";
  page: PublicSnapshotData["page"];
  theme: PublicSnapshotData["theme"];
}) {
  if (brandLockup === "fajita") {
    return <FajitaLogo orientation="horizontal" size={30} label="Fajita" />;
  }

  return (
    <>
      {theme.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="sp-brand__logo" src={theme.logoUrl} alt={`${page.name} logo`} />
      ) : null}
      <span className="sp-brand__name">{page.name}</span>
    </>
  );
}

function ComponentRow(props: {
  component: PublicComponent;
  showDescription: boolean;
  showResponseTime: boolean;
  timezone: string;
  locale: string;
}) {
  return (
    <div className="sp-component">
      <ComponentInner {...props} />
    </div>
  );
}

function ComponentInner({
  component,
  showDescription,
  showResponseTime,
  timezone,
  locale,
}: {
  component: PublicComponent;
  showDescription: boolean;
  showResponseTime: boolean;
  timezone: string;
  locale: string;
}) {
  return (
    <>
      <div className="sp-component__row">
        <div>
          <div className="sp-component__name">{component.name}</div>
          {showDescription && component.description ? (
            <div className="sp-component__desc">{component.description}</div>
          ) : null}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {showResponseTime && component.responseMs !== null ? (
            <span className="sp-card__meta" style={{ marginTop: 0 }}>
              {component.responseMs} ms
            </span>
          ) : null}
          <StatePill state={component.state} />
        </div>
      </div>
      {component.showUptime && component.uptime ? (
        <UptimeBar
          days={component.uptime.days}
          fraction={component.uptime.fraction}
          windowDays={component.uptime.windowDays}
          timezone={timezone}
          locale={locale}
          label={component.name}
        />
      ) : null}
    </>
  );
}

export function IncidentCard({
  incident,
  basePath,
  timezone,
  locale,
  showTimeline = false,
}: {
  incident: PublicIncident;
  basePath: string;
  timezone: string;
  locale: string;
  showTimeline?: boolean;
}) {
  return (
    <article className="sp-card" data-tone={incident.severity ?? incident.status}>
      <p className="sp-card__title">
        <a href={`${basePath}/incidents/${incident.slug}`}>{incident.title}</a>
      </p>
      <p className="sp-card__meta">
        <span style={{ textTransform: "capitalize", fontWeight: 600 }}>{incident.status}</span> ·
        started {formatInstant(incident.startedAt, timezone, locale)}
        {incident.resolvedAt
          ? ` · resolved ${formatInstant(incident.resolvedAt, timezone, locale)}`
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
      {showTimeline && incident.updates.length > 0 ? (
        <div className="sp-timeline">
          {incident.updates
            .slice()
            .reverse()
            .map((update, i) => (
              <div key={`${update.publishedAt}-${i}`} className="sp-update">
                <div>
                  <div className="sp-update__status">{update.type}</div>
                  <div className="sp-update__time">
                    {formatInstant(update.publishedAt, timezone, locale)}
                  </div>
                </div>
                <div
                  className="sp-update__body"
                  dangerouslySetInnerHTML={{ __html: update.bodyHtml }}
                />
              </div>
            ))}
        </div>
      ) : null}
    </article>
  );
}

function MaintenanceCard({
  maintenance,
  timezone,
  locale,
}: {
  maintenance: PublicMaintenance;
  timezone: string;
  locale: string;
}) {
  return (
    <article className="sp-card" data-tone="maintenance">
      <p className="sp-card__title">{maintenance.title}</p>
      <p className="sp-card__meta">
        {formatInstant(maintenance.startsAt, timezone, locale)} to{" "}
        {formatInstant(maintenance.endsAt, timezone, locale)}
      </p>
      {maintenance.summaryHtml ? (
        <div
          className="sp-update__body"
          style={{ marginTop: "8px" }}
          dangerouslySetInnerHTML={{ __html: maintenance.summaryHtml }}
        />
      ) : null}
      {maintenance.affectedComponents.length > 0 ? (
        <div className="sp-card__components">
          {maintenance.affectedComponents.map((name) => (
            <span key={name} className="sp-tag">
              {name}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}

/** Small shared helper reused by the archive route. */
export { formatUptimePercent };
