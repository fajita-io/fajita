/**
 * Status-page readiness checklist. Client-side only. No certification badges.
 */

export type ChecklistState = "yes" | "partial" | "no" | "unset";

export interface ChecklistItem {
  id: string;
  category: string;
  label: string;
  critical: boolean;
}

export const STATUS_CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: "owner", category: "Ownership", label: "A named owner updates the page during incidents", critical: true },
  { id: "components", category: "Components", label: "Components use customer-visible names", critical: true },
  { id: "mapping", category: "Monitor mapping", label: "Critical components map to monitors or clear manual process", critical: true },
  { id: "incident-process", category: "Incident process", label: "First-update template exists and is findable", critical: true },
  { id: "public-updates", category: "Public updates", label: "Cadence for updates is agreed (even if nothing changed)", critical: true },
  { id: "maintenance", category: "Maintenance", label: "Maintenance can be scheduled with customer impact stated", critical: false },
  { id: "subscribers", category: "Subscribers", label: "Subscriber opt-in and preferences are configured if email is offered", critical: false },
  { id: "custom-domain", category: "Custom domain", label: "Custom domain decided (hosted subdomain acceptable)", critical: false },
  { id: "branding", category: "Branding", label: "Logo and theme match the product customers know", critical: false },
  { id: "testing", category: "Testing", label: "A test incident or drill was published at least once", critical: true },
  { id: "backup", category: "Backup communication", label: "Backup channel exists if the status page itself is down", critical: false },
];

export type ChecklistAnswers = Record<string, ChecklistState>;

export interface ChecklistSummary {
  ready: number;
  needsReview: number;
  missingCritical: number;
  unset: number;
  overall: "ready" | "needs-review" | "missing-critical";
  lines: string[];
}

export function summarizeChecklist(answers: ChecklistAnswers): ChecklistSummary {
  let ready = 0;
  let needsReview = 0;
  let missingCritical = 0;
  let unset = 0;
  const lines: string[] = [];

  for (const item of STATUS_CHECKLIST_ITEMS) {
    const state = answers[item.id] ?? "unset";
    if (state === "yes") ready += 1;
    else if (state === "partial") needsReview += 1;
    else if (state === "no" && item.critical) missingCritical += 1;
    else if (state === "no") needsReview += 1;
    else unset += 1;

    lines.push(`[${state}] ${item.category}: ${item.label}`);
  }

  let overall: ChecklistSummary["overall"] = "ready";
  if (missingCritical > 0 || unset > 0) overall = "missing-critical";
  else if (needsReview > 0) overall = "needs-review";

  return { ready, needsReview, missingCritical, unset, overall, lines };
}

export function checklistPlainText(answers: ChecklistAnswers): string {
  const summary = summarizeChecklist(answers);
  return [
    "Fajita status-page readiness checklist",
    `Overall: ${summary.overall}`,
    `Ready: ${summary.ready}; needs review: ${summary.needsReview}; missing critical: ${summary.missingCritical}; unset: ${summary.unset}`,
    "",
    ...summary.lines,
    "",
    "This is not a certification. It is a readiness summary.",
  ].join("\n");
}
