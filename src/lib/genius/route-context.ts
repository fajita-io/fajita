import type { GeniusProductContext } from "@/lib/genius/types";

const SEGMENT_FEATURES: Record<string, string> = {
  app: "Overview",
  monitors: "Monitors",
  incidents: "Incidents",
  maintenance: "Maintenance",
  integrations: "Alert channels",
  "status-pages": "Status pages",
  "monitor-groups": "Monitor groups",
  team: "Team",
  settings: "Settings",
  onboarding: "Onboarding",
  support: "Support",
  reports: "Reports",
  referrals: "Referrals",
  "coming-soon": "Unavailable",
};

function tabFromPath(segments: string[]): string | undefined {
  if (segments.length < 2) return undefined;
  const last = segments[segments.length - 1];
  if (/^[0-9a-f-]{36}$/i.test(last)) return undefined;
  return last.replace(/-/g, " ");
}

/** Maps an authenticated app route to Genius product context. */
export function geniusContextForRoute(pathname: string): GeniusProductContext {
  const segments = pathname.split("/").filter(Boolean);
  const appIndex = segments.indexOf("app");
  const tail = appIndex >= 0 ? segments.slice(appIndex + 1) : segments;
  const primary = tail[0] ?? "app";
  const feature = SEGMENT_FEATURES[primary] ?? primary.replace(/-/g, " ");
  const selectedTab = tabFromPath(tail);

  return {
    feature,
    route: pathname,
    ...(selectedTab ? { selectedTab } : {}),
  };
}
