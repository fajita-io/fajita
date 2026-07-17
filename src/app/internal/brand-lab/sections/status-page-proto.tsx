import { FajitaPoweredBy } from "@/components/brand/powered-by/fajita-powered-by";
import { StatusBadge } from "@/components/design-system/status/status-badge";
import { UptimeChart, sampleUptimeDays } from "@/components/design-system/uptime-chart";
import type { OperationalStatus } from "@/components/design-system/status/status";

import { LabSection } from "./lab-ui";

function StatusPagePrototype({
  variant,
}: {
  variant: "operational" | "incident";
}) {
  const incident = variant === "incident";
  const components: Array<[string, OperationalStatus]> = [
    ["Website", "operational"],
    ["API", incident ? "down" : "operational"],
    ["Checkout", incident ? "degraded" : "operational"],
    ["Background jobs", "operational"],
  ];

  return (
    <div
      style={{
        border: "1px solid var(--color-border-subtle)",
        borderRadius: "var(--radius-lg)",
        background: "var(--color-background-primary)",
        overflow: "hidden",
      }}
    >
      {/* Customer brand header: customer logo left, calm neutral chrome */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "var(--space-4) var(--space-6)",
          borderBottom: "1px solid var(--color-border-subtle)",
          background: "var(--color-background-elevated)",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)", fontWeight: 600 }}>
          <span
            aria-hidden
            style={{
              width: 20,
              height: 20,
              borderRadius: 6,
              background: "var(--fj-blue-600)",
              display: "inline-block",
            }}
          />
          Acme status
        </span>
        <span className="fj-caption">status.acme.dev</span>
      </header>

      <div style={{ padding: "var(--space-6)" }}>
        <StatusBadge
          status={incident ? "down" : "operational"}
          label={incident ? "Partial outage" : "All systems operational"}
        />

        {incident ? (
          <div
            style={{
              marginTop: "var(--space-4)",
              padding: "var(--space-4) var(--space-5)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-status-down-bold)",
              background: "var(--color-status-down-soft)",
            }}
          >
            <p className="fj-heading-3" style={{ margin: 0 }}>
              API errors for some requests
            </p>
            <p className="fj-body-sm" style={{ marginTop: "var(--space-2)" }}>
              We are seeing elevated error rates on the API and checkout is
              slower than normal. The team is deploying a fix. Next update by
              14:30 UTC.
            </p>
            <p className="fj-caption fj-mono" style={{ marginTop: "var(--space-2)" }}>
              Investigating · opened 14:02 UTC · updated 14:18 UTC
            </p>
          </div>
        ) : null}

        <div style={{ marginTop: "var(--space-6)", display: "grid", gap: "var(--space-3)" }}>
          {components.map(([name, status]) => (
            <div
              key={name}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "var(--space-3) var(--space-4)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--color-border-subtle)",
                background: "var(--color-background-elevated)",
              }}
            >
              <span className="fj-label" style={{ color: "var(--color-text-primary)" }}>{name}</span>
              <StatusBadge status={status} />
            </div>
          ))}
        </div>

        <div style={{ marginTop: "var(--space-6)" }}>
          <UptimeChart
            days={sampleUptimeDays(90, incident ? 11 : 5)}
            label="API · last 90 days"
          />
        </div>

        <form
          style={{
            marginTop: "var(--space-6)",
            display: "flex",
            gap: "var(--space-2)",
            flexWrap: "wrap",
          }}
        >
          <label className="fj-label" style={{ width: "100%" }} htmlFor={`sub-${variant}`}>
            Get updates by email
          </label>
          <input
            id={`sub-${variant}`}
            type="email"
            placeholder="you@company.com"
            style={{
              flex: "1 1 12rem",
              minHeight: 44,
              padding: "0 var(--space-3)",
              borderRadius: "var(--radius-xs)",
              border: "1.5px solid var(--color-border-strong)",
              background: "var(--color-background-elevated)",
              color: "var(--color-text-primary)",
              font: "inherit",
            }}
          />
          <button type="button" className="fj-button fj-button--secondary">
            Subscribe
          </button>
        </form>
      </div>

      <footer
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "var(--space-3) var(--space-6)",
          borderTop: "1px solid var(--color-border-subtle)",
        }}
      >
        <span className="fj-caption">© Acme, Inc.</span>
        <FajitaPoweredBy href="https://fajita.io" />
      </footer>
    </div>
  );
}

export function StatusPageSection() {
  return (
    <LabSection
      id="status-page"
      title="Status-page brand foundation"
      note="The status page is the calmest Fajita surface: customer brand first, no marketing energy, no animation during incidents. Fajita appears only in the powered-by lockup. Customer colors live in the header chip and never override status semantics. Spec in docs/brand/fajita-status-page-branding.md."
    >
      <div style={{ display: "grid", gap: "var(--space-8)" }}>
        <figure style={{ margin: 0 }}>
          <figcaption className="fj-label" style={{ marginBottom: "var(--space-3)" }}>
            Operational
          </figcaption>
          <StatusPagePrototype variant="operational" />
        </figure>
        <figure style={{ margin: 0 }}>
          <figcaption className="fj-label" style={{ marginBottom: "var(--space-3)" }}>
            Active incident
          </figcaption>
          <StatusPagePrototype variant="incident" />
        </figure>
      </div>
    </LabSection>
  );
}
