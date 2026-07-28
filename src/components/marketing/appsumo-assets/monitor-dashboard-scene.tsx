import { FajitaMark } from "@/components/brand/logo/fajita-mark";
import { BrandIcon } from "@/components/design-system/icons";
import { StatusBadge } from "@/components/design-system/status/status-badge";

import { AppsumoCanvas } from "./canvas";
import { demoOrg } from "./demo-data";

const monitors = [
  {
    type: "http",
    name: "Marketing site",
    dest: demoOrg.domain,
    status: "operational" as const,
    uptime: "99.98%",
    response: "142 ms",
  },
  {
    type: "api",
    name: "Checkout API",
    dest: `api.${demoOrg.domain}/v1/health`,
    status: "operational" as const,
    uptime: "99.96%",
    response: "186 ms",
  },
  {
    type: "ssl",
    name: "TLS certificate",
    dest: `${demoOrg.domain}:443`,
    status: "operational" as const,
    uptime: "100%",
    response: "212 days left",
  },
  {
    type: "heartbeat",
    name: "Nightly backup",
    dest: "Expected every 24h",
    status: "operational" as const,
    uptime: "99.99%",
    response: "Pinged 3h ago",
  },
];

export function MonitorDashboardScene() {
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
            <span className="appsumo-app__nav-link" data-active="">
              <BrandIcon name="monitor-http" size={18} />
              Monitors
            </span>
            <span className="appsumo-app__nav-link">
              <BrandIcon name="incident" size={18} />
              Incidents
            </span>
            <span className="appsumo-app__nav-link">
              <BrandIcon name="status-page" size={18} />
              Status pages
            </span>
            <span className="appsumo-app__nav-link">
              <BrandIcon name="alert" size={18} />
              Alert channels
            </span>
          </nav>
        </aside>
        <div className="appsumo-app__main">
          <header className="appsumo-app__topbar">
            <h1 className="appsumo-app__title">Monitors</h1>
            <span className="fj-caption">{demoOrg.name} workspace</span>
          </header>
          <div className="appsumo-app__content">
            <table className="appsumo-mon-table">
              <thead>
                <tr>
                  <th>Monitor</th>
                  <th>Status</th>
                  <th>Uptime (90d)</th>
                  <th>Latest</th>
                </tr>
              </thead>
              <tbody>
                {monitors.map((m) => (
                  <tr key={m.name}>
                    <td>
                      <div className="appsumo-mon-name">
                        <BrandIcon
                          name={
                            m.type === "http"
                              ? "monitor-http"
                              : m.type === "api"
                                ? "monitor-api"
                                : m.type === "ssl"
                                  ? "monitor-ssl"
                                  : "monitor-cron"
                          }
                          size={18}
                        />
                        <div>
                          <div className="appsumo-mon-name__title">{m.name}</div>
                          <div className="appsumo-mon-name__dest">{m.dest}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={m.status} />
                    </td>
                    <td className="fj-numeric">{m.uptime}</td>
                    <td className="fj-numeric" style={{ color: "var(--color-text-secondary)" }}>
                      {m.response}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppsumoCanvas>
  );
}
