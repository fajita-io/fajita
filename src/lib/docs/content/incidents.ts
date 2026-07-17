import { callout, diagram, h2, p, table, ul } from "../blocks";
import { defineDoc, type DocPage } from "../types";

const base = {
  category: "incidents" as const,
  lastReviewedAt: "2026-07-17",
  owner: "docs-incidents",
  reviewers: ["engineering", "product"],
  productVersion: "2026.07",
};

export const incidentsPages: DocPage[] = [
  defineDoc({
    meta: {
      ...base,
      slug: "incidents/verification",
      title: "Retries and verification",
      description:
        "Why one failed request does not open an incident, and how verification confirms a real failure.",
      model: "learn",
      pageType: "concept",
      order: 0,
      productArea: ["incidents", "monitors"],
      keywords: ["verification", "retry", "confirm", "incident opens", "threshold", "consecutive"],
      relatedPages: ["monitors/retries", "incidents/recovery"],
      searchBoost: 3,
    },
    body: [
      p("Fajita separates two questions so alerts stay trustworthy."),
      table(
        ["Step", "Answers"],
        [
          ["Check retry", "Was this one failed request temporary?"],
          ["Incident verification", "Is the service meaningfully unhealthy?"],
        ],
      ),
      h2("The sequence"),
      diagram(
        "retry-vs-verification",
        "Retry decides transience, verification decides health",
        "A scheduled check fails. Fajita retries the request. If the retry also fails, the failing result becomes eligible for verification. Verification counts consecutive eligible failures against the monitor's failure confirmation threshold. When the threshold is met, an incident opens. If a check passes before the threshold, the monitor returns to operational.",
      ),
      h2("Verification threshold"),
      p(
        "Each monitor has a failure confirmation threshold, defaulting to two consecutive eligible failures. Critical monitors can open faster. A single failing check never opens an incident on a normal monitor.",
      ),
      h2("Why this matters"),
      ul([
        "A retry result stays in history so you can see what happened.",
        "Manual tests do not open incidents.",
        "Platform uncertainty (a problem on Fajita's side) does not automatically blame your service.",
      ]),
    ],
  }),

  defineDoc({
    meta: {
      ...base,
      slug: "incidents/degraded-vs-down",
      title: "Degraded vs down",
      description: "The difference between a degraded state and a down state, and how severity is assigned.",
      model: "learn",
      pageType: "concept",
      order: 1,
      productArea: ["incidents"],
      keywords: ["degraded", "down", "severity", "minor", "major", "critical", "state"],
      relatedPages: ["incidents/verification", "reference/monitor-states"],
    },
    body: [
      p("An operational state describes what Fajita observes. A severity describes how serious the incident is."),
      h2("Operational states"),
      table(
        ["State", "Meaning"],
        [
          ["Operational", "Checks pass"],
          ["Verifying", "A failure is being confirmed"],
          ["Degraded", "Working but outside expected performance"],
          ["Down", "Confirmed failing"],
          ["Recovering", "Passing again, awaiting recovery confirmation"],
          ["Maintenance", "Suppressed during a maintenance window"],
        ],
      ),
      h2("Severity"),
      p("Operators can label an incident minor, major, or critical. A monitor's criticality influences how quickly a down state is confirmed."),
    ],
  }),

  defineDoc({
    meta: {
      ...base,
      slug: "incidents/recovery",
      title: "Recovery",
      description: "How Fajita confirms recovery before resolving an incident, and how reopening and flapping work.",
      model: "learn",
      pageType: "concept",
      order: 2,
      productArea: ["incidents"],
      keywords: ["recovery", "resolve", "reopen", "flapping", "recovering", "stabilize"],
      relatedPages: ["incidents/verification", "alerts/recovery-notifications"],
    },
    body: [
      p("Just as a failure is confirmed before opening, a recovery is confirmed before resolving."),
      h2("Recovery confirmation"),
      ul([
        "When checks start passing, the monitor enters recovering.",
        "Fajita counts consecutive passing checks against the recovery confirmation threshold (default two).",
        "Once met, the incident resolves.",
      ]),
      h2("Reopening"),
      p("If failures return within a short reopen window after resolution, Fajita reopens the same incident rather than opening a new one."),
      h2("Flapping"),
      p("A target that alternates between failing and passing repeatedly is flapping. Fajita detects this pattern and can note it so you are not paged on every flip."),
      callout("note", [
        p("An incident is not resolved until recovery is confirmed. A single passing check does not resolve an open incident."),
      ]),
    ],
  }),

  defineDoc({
    meta: {
      ...base,
      slug: "incidents/timeline",
      title: "Incident timeline",
      description: "The event categories on an incident timeline, what is immutable, and what stays internal.",
      model: "operate",
      pageType: "reference",
      order: 3,
      productArea: ["incidents"],
      keywords: ["timeline", "events", "internal note", "public update", "history", "audit"],
      relatedPages: ["incidents/recovery"],
    },
    body: [
      p("The timeline is the record of what happened during an incident."),
      h2("Event categories"),
      table(
        ["Category", "Source", "Visibility"],
        [
          ["System event", "Automatic (open, verify, recover)", "Internal"],
          ["Operator action", "A person (acknowledge, assign)", "Internal"],
          ["Internal note", "A person", "Internal only, never public"],
          ["Public update", "A person", "Shown on the status page"],
          ["Maintenance event", "Automatic or scheduled", "Depends on publication"],
          ["Recovery event", "Automatic", "Internal"],
        ],
      ),
      h2("Immutability and corrections"),
      ul([
        "System events are immutable.",
        "Corrections are added as new entries rather than editing history.",
        "Internal notes are never shown on the public status page.",
        "Timestamps are displayed in a consistent, unambiguous format.",
      ]),
    ],
  }),
];
