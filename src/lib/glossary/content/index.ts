import { monitoringTerms } from "./monitoring";
import { incidentTerms } from "./incidents";
import { alertTerms } from "./alerts";
import { statusPageTerms } from "./status-pages";
import { apiWebhookTerms } from "./apis-webhooks";
import { sslDnsTerms } from "./ssl-dns";
import { performanceTerms } from "./performance";
import { reliabilityMetricTerms } from "./reliability-metrics";
import { scheduledJobTerms } from "./scheduled-jobs";
import { teamsOperationsTerms } from "./teams-operations";
import type { GlossaryTerm } from "@/lib/glossary/types";

export {
  monitoringTerms,
  incidentTerms,
  alertTerms,
  statusPageTerms,
  apiWebhookTerms,
  sslDnsTerms,
  performanceTerms,
  reliabilityMetricTerms,
  scheduledJobTerms,
  teamsOperationsTerms,
};

export const allTermModules: GlossaryTerm[] = [
  ...monitoringTerms,
  ...incidentTerms,
  ...alertTerms,
  ...statusPageTerms,
  ...apiWebhookTerms,
  ...sslDnsTerms,
  ...performanceTerms,
  ...reliabilityMetricTerms,
  ...scheduledJobTerms,
  ...teamsOperationsTerms,
];
