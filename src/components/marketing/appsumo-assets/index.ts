import type { ComponentType } from "react";

import { HeroScene } from "./hero-scene";
import { IncidentTimelineScene } from "./incident-timeline-scene";
import { MonitorDashboardScene } from "./monitor-dashboard-scene";
import { SlackAlertsScene } from "./slack-alerts-scene";
import { StatusPageScene } from "./status-page-scene";
import { WordmarkScene } from "./wordmark-scene";

export const APPSUMO_SCENES = {
  hero: {
    component: HeroScene,
    filename: "01-hero.png",
    alt: "Fajita uptime monitoring hero: verified alerts, Slack notifications, and public status pages.",
  },
  "slack-alerts": {
    component: SlackAlertsScene,
    filename: "02-slack-verified-alert-and-recovery.png",
    alt: "Slack channel showing a verified Fajita incident alert and recovery message for Checkout API.",
  },
  "status-page": {
    component: StatusPageScene,
    filename: "03-public-status-page-incident.png",
    alt: "Public status page with an active checkout incident, component states, and 90-day uptime history.",
  },
  "monitor-dashboard": {
    component: MonitorDashboardScene,
    filename: "04-monitor-dashboard.png",
    alt: "Fajita monitor dashboard with website, API, SSL certificate, and heartbeat monitors.",
  },
  "incident-timeline": {
    component: IncidentTimelineScene,
    filename: "05-incident-timeline.png",
    alt: "Incident timeline showing verified failure, alert delivery, recovery detection, and resolution.",
  },
  wordmark: {
    component: WordmarkScene,
    filename: "00-wordmark.png",
    alt: "Fajita horizontal wordmark logo.",
  },
} as const satisfies Record<
  string,
  { component: ComponentType; filename: string; alt: string }
>;

export type AppsumoSceneId = keyof typeof APPSUMO_SCENES;

export const APPSUMO_SCENE_IDS = Object.keys(APPSUMO_SCENES) as AppsumoSceneId[];
