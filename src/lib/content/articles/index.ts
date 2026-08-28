import type { ContentArticle } from "../types";

import { calculateUptime } from "./calculate-uptime";
import { certificateExpirationAlertTiming } from "./certificate-expiration-alert-timing";
import { fajitaIsNowOpenSource } from "./fajita-is-now-open-source";
import { heartbeatGracePeriod } from "./heartbeat-grace-period";
import { heartbeatMonitoring } from "./heartbeat-monitoring";
import { howOftenCheckWebsite } from "./how-often-check-website";
import { minimumReliabilityStack } from "./minimum-reliability-stack";
import { monitorApiWithoutNoise } from "./monitor-api-without-noise";
import { monitoringBeforeProductHunt } from "./monitoring-before-product-hunt";
import { nameStatusPageComponents } from "./name-status-page-components";
import { safeApiHealthEndpoint } from "./safe-api-health-endpoint";
import { uptimeVsPerformance } from "./uptime-vs-performance";
import { whatBelongsOnStatusPage } from "./what-belongs-on-status-page";
import { whatCustomersNeedDuringOutage } from "./what-customers-need-during-outage";
import { whyOneFailedCheck } from "./why-one-failed-check";
import { whyValidCertificateCanStillFail } from "./why-valid-certificate-can-still-fail";
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
  howOftenCheckWebsite,
  uptimeVsPerformance,
  whatCustomersNeedDuringOutage,
  nameStatusPageComponents,
  monitoringBeforeProductHunt,
  certificateExpirationAlertTiming,
  whyValidCertificateCanStillFail,
  heartbeatGracePeriod,
];
