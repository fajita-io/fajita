import { FajitaLogo } from "@/components/brand/logo/fajita-logo";
import { StatusBadge } from "@/components/design-system/status/status-badge";
import { UptimeChart } from "@/components/design-system/uptime-chart";

import { AppsumoCanvas } from "./canvas";
import { previewUptimeDays } from "./demo-data";

export function HeroScene() {
  const days = previewUptimeDays(90, 31);

  return (
    <AppsumoCanvas dark>
      <div className="appsumo-hero">
        <div className="appsumo-hero__copy">
          <FajitaLogo orientation="horizontal" tone="dark" size={44} />
          <p className="appsumo-hero__eyebrow">Uptime monitoring</p>
          <h1 className="appsumo-hero__headline">Know when your software gets too hot.</h1>
          <p className="appsumo-hero__deck">
            Fajita watches websites, APIs, certificates, and cron jobs. Verified alerts reach your
            team before customers start asking.
          </p>
          <div className="appsumo-hero__chips">
            <span className="appsumo-hero__chip">Verified failures</span>
            <span className="appsumo-hero__chip">Slack and email alerts</span>
            <span className="appsumo-hero__chip">Public status pages</span>
          </div>
        </div>
        <div className="appsumo-hero__visual">
          <div className="appsumo-hero__device">
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid rgb(250 245 234 / 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: 13,
                  color: "rgb(250 245 234 / 0.55)",
                }}
              >
                fajita · monitors
              </span>
              <StatusBadge status="operational" label="4 monitors healthy" />
            </div>
            <div style={{ padding: "28px 32px 36px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 0.8fr 0.8fr",
                  gap: 12,
                  marginBottom: 24,
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "rgb(250 245 234 / 0.45)",
                }}
              >
                <span>Monitor</span>
                <span>Status</span>
                <span>Uptime</span>
              </div>
              {[
                ["genius.ly", "operational", "99.98%"],
                ["api.genius.ly/health", "operational", "99.96%"],
                ["TLS genius.ly:443", "operational", "100%"],
                ["nightly-backup heartbeat", "operational", "99.99%"],
              ].map(([name, status, uptime]) => (
                <div
                  key={name}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr 0.8fr 0.8fr",
                    gap: 12,
                    alignItems: "center",
                    padding: "14px 0",
                    borderTop: "1px solid rgb(250 245 234 / 0.08)",
                  }}
                >
                  <span style={{ color: "#faf5ea", fontSize: 15, fontWeight: 500 }}>{name}</span>
                  <StatusBadge status={status as "operational"} />
                  <span
                    style={{
                      fontFamily: "var(--font-mono, monospace)",
                      color: "#f5921b",
                      fontSize: 14,
                    }}
                  >
                    {uptime}
                  </span>
                </div>
              ))}
              <div style={{ marginTop: 28 }}>
                <UptimeChart days={days} label="All monitors · last 90 days" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppsumoCanvas>
  );
}
