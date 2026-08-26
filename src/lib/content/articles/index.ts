import type { ContentArticle } from "../types";

import { calculateUptime } from "./calculate-uptime";
import { fajitaIsNowOpenSource } from "./fajita-is-now-open-source";
import { heartbeatMonitoring } from "./heartbeat-monitoring";
import { minimumReliabilityStack } from "./minimum-reliability-stack";
import { monitorApiWithoutNoise } from "./monitor-api-without-noise";
import { safeApiHealthEndpoint } from "./safe-api-health-endpoint";
import { whatBelongsOnStatusPage } from "./what-belongs-on-status-page";
import { whyOneFailedCheck } from "./why-one-failed-check";
import { writeUsefulIncidentUpdate } from "./write-useful-incident-update";

export const allArticles: ContentArticle[] = [
  fajitaIsNowOpenSource,
  minimumReliabilityStack,
  monitorApiWithoutNoise,
  writeUsefulIncidentUpdate,
  whatBelongsOnStatusPage,
  heartbeatMonitoring,
  calculateUptime,
  whyOneFailedCheck,
  safeApiHealthEndpoint,
];
