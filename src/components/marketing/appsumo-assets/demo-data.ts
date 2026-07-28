/** Deterministic demo data shared across AppSumo export scenes. */
import type { UptimeDay } from "@/components/design-system/uptime-chart";
import type { OperationalStatus } from "@/components/design-system/status/status";

export function previewUptimeDays(count = 90, incidentDayIndex = 31): UptimeDay[] {
  const days: UptimeDay[] = [];
  const start = new Date("2026-07-16T00:00:00Z");
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() - i);
    let status: OperationalStatus = "operational";
    if (i === incidentDayIndex) status = "down";
    if (i === 16) status = "maintenance";
    days.push({ date: d.toISOString().slice(0, 10), status });
  }
  return days;
}

export const demoOrg = {
  name: "Genius",
  domain: "genius.ly",
  statusHost: "status.genius.ly",
  slackChannel: "#ops-alerts",
} as const;
