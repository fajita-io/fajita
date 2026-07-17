import Link from "next/link";
import { redirect } from "next/navigation";

import { requireAuthenticatedUser } from "@/lib/auth/context";
import { resolveActiveOrg } from "@/lib/app/organizations";
import { readActiveOrgId } from "@/lib/app/active-org";
import { listMonitors } from "@/lib/monitoring/monitors";
import { listSecurityEvents } from "@/lib/monitoring/security-events";
import { EngineLabClient } from "./engine-lab-client";

/**
 * Internal monitor engine lab. Server component: resolves the active
 * organization, loads its monitors and recent security events, and renders the
 * operator console. No customer data from other organizations is ever shown.
 */
export default async function MonitorEngineLabPage() {
  const profile = await requireAuthenticatedUser();
  const requested = await readActiveOrgId();
  const active = await resolveActiveOrg(profile.id, requested);
  if (!active) redirect("/app/new-organization");

  const organizationId = active.organization.id;
  const [monitors, securityEvents] = await Promise.all([
    listMonitors(organizationId, 100),
    listSecurityEvents(organizationId, 25),
  ]);

  return (
    <main
      style={{
        maxWidth: 1040,
        margin: "0 auto",
        padding: "2.5rem 1.25rem 4rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.75rem",
      }}
    >
      <header style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <p
          style={{
            fontSize: "0.75rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-text-muted)",
          }}
        >
          Internal · {active.organization.name}
        </p>
        <h1 style={{ fontSize: "1.75rem", margin: 0 }}>Monitor engine lab</h1>
        <p style={{ color: "var(--color-text-muted)", margin: 0, maxWidth: "62ch" }}>
          Operate the real engine against this organization. Configuration test
          runs apply the same destination and SSRF gates as scheduled checks.
          This surface is internal and not customer facing.
        </p>
        <p style={{ margin: "0.25rem 0 0" }}>
          <Link
            href="/internal/monitor-engine-lab/workers"
            style={{ fontSize: "0.9rem" }}
          >
            Worker operations →
          </Link>
        </p>
      </header>

      <EngineLabClient
        organizationId={organizationId}
        monitors={monitors}
        securityEvents={securityEvents}
      />
    </main>
  );
}
