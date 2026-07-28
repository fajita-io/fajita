import { h2, p, table } from "@/lib/docs/blocks";
import { buildTermBody } from "@/lib/glossary/authoring";
import { defineTerm, type GlossaryTerm } from "@/lib/glossary/types";

export const teamsOperationsTerms: GlossaryTerm[] = [
defineTerm({
  meta: {
  "id": "audit-log",
  "term": "Audit log",
  "slug": "audit-log",
  "shortDefinition": "Audit log is a recorded history of important actions taken in an account.",
  "shortAnswer": "Audit log describes a recorded history of important actions taken in an account. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "teams-operations",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "incident-assignment",
    "operational-status"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "alerts",
    "status-pages"
  ],
  "documentationLinks": [
    {
      "href": "/docs/teams/audit-log",
      "label": "Audit log"
    }
  ],
  "productLinks": [],
  "searchIntent": "definition",
  "primaryQuery": "what is audit log",
  "secondaryQueries": [],
  "status": "published",
  "owner": "glossary-editorial",
  "reviewers": [
    "product",
    "engineering"
  ],
  "lastReviewedAt": "2026-07-17",
  "nextReviewDue": "2027-01-17",
  "contentVersion": "1",
  "productVersion": "1.0",
  "technicalStandardRefs": [],
  "featured": false,
  "foundational": false,
  "llmInclude": true,
  "indexable": true,
  "canonical": true,
  "redirects": [],
  "cta": "documentation",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Audit log? Definition and Examples",
  "description": "Audit log: a recorded history of important actions taken in an account. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Audit log matters because teams need a precise shared meaning for a recorded history of important actions taken in an account. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, a recorded history of important actions taken in an account shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of audit log is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around member role change recorded with actor and time. When observed behavior stops matching the definition of audit log, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Audit logs are the same as monitor history", body: ["That reading usually collapses distinct ideas into one slogan. Keep audit log tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Fajita records team and security-relevant actions in the organization audit log. See [audit log](/docs/teams/audit-log)."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "operational-readiness",
  "term": "Operational readiness",
  "slug": "operational-readiness",
  "shortDefinition": "Operational readiness is whether people, processes, and tools are prepared to detect and handle failures.",
  "shortAnswer": "Operational readiness describes whether people, processes, and tools are prepared to detect and handle failures. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "teams-operations",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "alert-channel",
    "status-page",
    "monitor"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "alerts",
    "status-pages"
  ],
  "documentationLinks": [
    {
      "href": "/docs/getting-started/next-steps",
      "label": "Next steps"
    }
  ],
  "productLinks": [],
  "searchIntent": "definition",
  "primaryQuery": "what is operational readiness",
  "secondaryQueries": [],
  "status": "published",
  "owner": "glossary-editorial",
  "reviewers": [
    "product",
    "engineering"
  ],
  "lastReviewedAt": "2026-07-17",
  "nextReviewDue": "2027-01-17",
  "contentVersion": "1",
  "productVersion": "1.0",
  "technicalStandardRefs": [],
  "featured": false,
  "foundational": false,
  "llmInclude": true,
  "indexable": true,
  "canonical": true,
  "redirects": [],
  "cta": "documentation",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Operational readiness? Definition and Examples",
  "description": "Operational readiness: whether people, processes, and tools are prepared to detect and handle failures. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Operational readiness matters because teams need a precise shared meaning for whether people, processes, and tools are prepared to detect and handle failures. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, whether people, processes, and tools are prepared to detect and handle failures shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of operational readiness is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around alert channel tested before launch day. When observed behavior stops matching the definition of operational readiness, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Readiness is a one-time checklist at company founding", body: ["That reading usually collapses distinct ideas into one slogan. Keep operational readiness tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Before launch, confirm monitors, alert channels, and status-page ownership exist."],
    
  }),
  faqs: undefined,
  formula: undefined,
})
];
