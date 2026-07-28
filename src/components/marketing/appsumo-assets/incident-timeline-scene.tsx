import { FajitaMark } from "@/components/brand/logo/fajita-mark";
import { BrandIcon } from "@/components/design-system/icons";

import { AppsumoCanvas } from "./canvas";

const events = [
  {
    kind: "system",
    title: "Incident resolved",
    description: "Checkout API checks are passing from all regions. Public status page updated.",
    actor: "Fajita",
    time: "2 minutes ago",
  },
  {
    kind: "recovery",
    title: "Recovery detected",
    description: "Two consecutive successful checks confirmed the service is back.",
    actor: "Automated",
    time: "3 minutes ago",
  },
  {
    kind: "service",
    title: "Recovery alert sent",
    description: "Slack #ops-alerts and email team@genius.ly received the all-clear.",
    actor: "Automated",
    time: "3 minutes ago",
  },
  {
    kind: "system",
    title: "Failure verified",
    description: "Second check agreed. Incident opened after verification window completed.",
    actor: "Fajita",
    time: "18 minutes ago",
  },
  {
    kind: "system",
    title: "Check failed",
    description: "GET api.genius.ly/v1/checkout returned 503 from us-east.",
    actor: "Fajita",
    time: "19 minutes ago",
  },
];

export function IncidentTimelineScene() {
  return (
    <AppsumoCanvas>
      <div className="appsumo-app">
        <aside className="appsumo-app__sidebar">
          <div className="appsumo-app__logo">
            <FajitaMark size={28} />
            <span>Fajita</span>
          </div>
          <nav className="appsumo-app__nav" aria-label="App navigation">
            <span className="appsumo-app__nav-link">
              <BrandIcon name="overview" size={18} />
              Dashboard
            </span>
            <span className="appsumo-app__nav-link">
              <BrandIcon name="monitor-http" size={18} />
              Monitors
            </span>
            <span className="appsumo-app__nav-link" data-active="">
              <BrandIcon name="incident" size={18} />
              Incidents
            </span>
          </nav>
        </aside>
        <div className="appsumo-app__main">
          <header className="appsumo-app__topbar">
            <h1 className="appsumo-app__title">Checkout API outage</h1>
            <span className="fj-caption">Timeline</span>
          </header>
          <div className="appsumo-app__content">
            <div className="appsumo-inc-timeline">
              <header className="appsumo-inc-timeline__header">
                <h2 className="appsumo-inc-timeline__title">Timeline</h2>
                <p className="appsumo-inc-timeline__desc">
                  Every state change and alert, newest first. Verification ran before the team was
                  paged.
                </p>
              </header>
              <ol className="appsumo-inc-timeline__list">
                {events.map((event) => (
                  <li key={event.title} className="appsumo-inc-timeline__item">
                    <div
                      className="appsumo-inc-timeline__dot"
                      data-kind={event.kind}
                      aria-hidden
                    />
                    <div>
                      <div className="appsumo-inc-timeline__event-title">{event.title}</div>
                      <p className="appsumo-inc-timeline__event-desc">{event.description}</p>
                      <div className="appsumo-inc-timeline__event-meta">
                        <span>{event.actor}</span>
                        <span>{event.time}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </AppsumoCanvas>
  );
}
