import { NextResponse } from "next/server";

import { PUBLIC_SNAPSHOT_SCHEMA_VERSION } from "@/lib/status-pages/config";
import { getPublicSnapshotBySlug } from "@/lib/status-pages/projection";
import { clientKey, rateLimit } from "@/lib/site/rate-limit";

/**
 * Read-only public status JSON. Serves the same allowlisted projection as the
 * page: overall status, component states, active incidents, and upcoming
 * maintenance. No internal ids, monitor names, notes, or secrets. Cacheable and
 * rate-limited. CORS is open because this is deliberately public data.
 */
export const revalidate = 30;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!rateLimit(`status_api:${clientKey(request)}`, { limit: 60, windowMs: 60_000 })) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const { slug } = await params;
  const snapshot = await getPublicSnapshotBySlug(slug);
  if (!snapshot || snapshot.visibility !== "public") {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const d = snapshot.data;
  const body = {
    schemaVersion: PUBLIC_SNAPSHOT_SCHEMA_VERSION,
    page: { name: d.page.name },
    status: {
      indicator: snapshot.overallStatus,
      description: labelFor(snapshot.overallStatus),
    },
    components: [
      ...d.groups.flatMap((g) =>
        g.components.map((c) => ({ name: c.name, status: c.state, group: g.name })),
      ),
      ...d.ungrouped.map((c) => ({ name: c.name, status: c.state, group: null })),
    ],
    activeIncidents: d.activeIncidents.map((i) => ({
      name: i.title,
      status: i.status,
      severity: i.severity,
      startedAt: i.startedAt,
    })),
    upcomingMaintenance: d.upcomingMaintenance.map((m) => ({
      name: m.title,
      startsAt: m.startsAt,
      endsAt: m.endsAt,
    })),
    updatedAt: d.lastUpdatedAt,
    generatedAt: snapshot.generatedAt,
  };

  return NextResponse.json(body, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
    },
  });
}

function labelFor(state: string): string {
  const map: Record<string, string> = {
    operational: "All Systems Operational",
    degraded: "Degraded Performance",
    partial_outage: "Partial System Disruption",
    major_outage: "Major Service Disruption",
    maintenance: "Under Maintenance",
  };
  return map[state] ?? "Unknown";
}
