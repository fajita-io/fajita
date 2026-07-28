import { FajitaPoweredBy } from "@/components/brand/powered-by/fajita-powered-by";
import { StatusBadge } from "@/components/design-system/status/status-badge";
import { UptimeChart } from "@/components/design-system/uptime-chart";

import { AppsumoCanvas } from "./canvas";
import { demoOrg, previewUptimeDays } from "./demo-data";

export function StatusPageScene() {
  const days = previewUptimeDays(90, 31);

  return (
    <AppsumoCanvas>
      <div className="appsumo-status">
        <div className="appsumo-status__frame">
          <header className="appsumo-status__header">
            <span className="appsumo-status__brand">
              <span className="appsumo-status__mark">{demoOrg.name[0]}</span>
              {demoOrg.name} status
            </span>
            <span className="fj-caption">{demoOrg.statusHost}</span>
          </header>
          <div className="appsumo-status__body">
            <StatusBadge status="down" label="Partial outage" />
            <div className="appsumo-status__incident">
              <p className="fj-heading-3" style={{ margin: 0 }}>
                Checkout is unavailable
              </p>
              <p className="fj-body-sm" style={{ marginTop: "var(--space-2)" }}>
                Checkout requests are failing after a database migration. The team is deploying a
                fix. Orders already placed are not affected.
              </p>
              <p
                className="fj-caption fj-mono"
                style={{ marginTop: "var(--space-2)", marginBottom: 0 }}
              >
                Identified · opened 09:18 MST · updated 09:41 MST
              </p>
            </div>
            <div className="appsumo-status__components">
              {[
                ["Web application", "operational"],
                ["API", "degraded"],
                ["Checkout", "down"],
                ["Background jobs", "operational"],
              ].map(([name, status]) => (
                <div key={name} className="appsumo-status__row">
                  <span className="fj-label" style={{ color: "var(--color-text-primary)" }}>
                    {name}
                  </span>
                  <StatusBadge status={status as "operational"} />
                </div>
              ))}
            </div>
            <div className="appsumo-status__uptime">
              <UptimeChart days={days} label="Checkout · last 90 days" />
            </div>
          </div>
          <footer
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "var(--space-3) var(--space-8)",
              borderTop: "1px solid var(--color-border-subtle)",
            }}
          >
            <span className="fj-caption">© {demoOrg.name}</span>
            <FajitaPoweredBy href="https://fajita.io" />
          </footer>
        </div>
      </div>
    </AppsumoCanvas>
  );
}
