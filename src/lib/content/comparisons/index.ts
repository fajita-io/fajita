import type { ContentComparison } from "../types";

import { fajitaVsBetterStack } from "./fajita-vs-better-stack";
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
  uptimeToolsSoloSaas,
  statusPageToolsSmallTeams,
];
