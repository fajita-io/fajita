import type { ContentComparison } from "../types";

import { fajitaVsBetterStack } from "./fajita-vs-better-stack";
import { fajitaVsCheckly } from "./fajita-vs-checkly";
import { fajitaVsPingdom } from "./fajita-vs-pingdom";
import { fajitaVsStatuspage } from "./fajita-vs-statuspage";
import { fajitaVsUptimeRobot } from "./fajita-vs-uptimerobot";
import {
  statusPageToolsSmallTeams,
  uptimeToolsSoloSaas,
} from "./category-pages";
import { comparisonMethodology } from "./methodology";

export { COMPETITOR_FACTS, factsForPage, getFact, staleFacts } from "./facts";

export const allComparisons: ContentComparison[] = [
  comparisonMethodology,
  fajitaVsUptimeRobot,
  fajitaVsBetterStack,
  fajitaVsPingdom,
  fajitaVsCheckly,
  fajitaVsStatuspage,
  uptimeToolsSoloSaas,
  statusPageToolsSmallTeams,
];
