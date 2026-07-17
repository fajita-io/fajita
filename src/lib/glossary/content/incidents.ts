import { h2, p, table } from "@/lib/docs/blocks";
import { buildTermBody } from "@/lib/glossary/authoring";
import { defineTerm, type GlossaryTerm } from "@/lib/glossary/types";

export const incidentTerms: GlossaryTerm[] = [
defineTerm({
  meta: {
  "id": "incident",
  "term": "Incident",
  "slug": "incident",
  "shortDefinition": "Incident is a tracked period of degraded or failed service.",
  "shortAnswer": "Incident describes a tracked period of degraded or failed service. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "incidents",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "incident-verification",
    "incident-severity",
    "recovery-confirmation",
    "incident-timeline",
    "false-positive"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "incident-communication"
  ],
  "documentationLinks": [
    {
      "href": "/docs/incidents/verification",
      "label": "Incident verification"
    }
  ],
  "productLinks": [
    {
      "href": "/features/incident-communication",
      "label": "Incident communication"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is incident",
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
  "featured": true,
  "foundational": true,
  "llmInclude": true,
  "indexable": true,
  "canonical": true,
  "redirects": [],
  "poweredByWiki": true,
  "cta": "status-page",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Incident? Definition and Examples",
  "description": "Incident: a tracked period of degraded or failed service. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Incident matters because teams need a precise shared meaning for a tracked period of degraded or failed service. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, a tracked period of degraded or failed service shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of incident is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around api.example.com returning 503 after verification. When observed behavior stops matching the definition of incident, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "An incident is any failed monitor check", body: ["That reading usually collapses distinct ideas into one slogan. Keep incident tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Fajita opens incidents after verification, not after every blip. See [incident verification](/docs/incidents/verification)."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "incident-management",
  "term": "Incident management",
  "slug": "incident-management",
  "shortDefinition": "Incident management is the process of detecting, coordinating, resolving, and reviewing service failures.",
  "shortAnswer": "Incident management describes the process of detecting, coordinating, resolving, and reviewing service failures. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "incidents",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "incident",
    "incident-response",
    "post-incident-review",
    "incident-acknowledgment"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "incident-communication"
  ],
  "documentationLinks": [],
  "productLinks": [],
  "searchIntent": "definition",
  "primaryQuery": "what is incident management",
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
  "poweredByWiki": true,
  "cta": "none",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Incident management? Definition and Examples",
  "description": "Incident management: the process of detecting, coordinating, resolving, and reviewing service failures. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Incident management matters because teams need a precise shared meaning for the process of detecting, coordinating, resolving, and reviewing service failures. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, the process of detecting, coordinating, resolving, and reviewing service failures shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of incident management is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around an open incident for checkout API failures. When observed behavior stops matching the definition of incident management, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Incident management is only a status-page post", body: ["That reading usually collapses distinct ideas into one slogan. Keep incident management tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Fajita tracks incident state, timeline, and recovery. See [incident timeline](/docs/incidents/timeline)."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "incident-detection",
  "term": "Incident detection",
  "slug": "incident-detection",
  "shortDefinition": "Incident detection is discovering that a service likely failed or degraded.",
  "shortAnswer": "Incident detection describes discovering that a service likely failed or degraded. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "incidents",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "incident-verification",
    "false-positive",
    "monitoring-interval"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "incident-communication"
  ],
  "documentationLinks": [],
  "productLinks": [],
  "searchIntent": "definition",
  "primaryQuery": "what is incident detection",
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
  "poweredByWiki": true,
  "cta": "none",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Incident detection? Definition and Examples",
  "description": "Incident detection: discovering that a service likely failed or degraded. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Incident detection matters because teams need a precise shared meaning for discovering that a service likely failed or degraded. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, discovering that a service likely failed or degraded shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of incident detection is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around monitor failures on https://api.example.com/health. When observed behavior stops matching the definition of incident detection, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Detection always equals a confirmed outage", body: ["That reading usually collapses distinct ideas into one slogan. Keep incident detection tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Fajita detects candidate failures through monitors, then verifies before treating them as incidents."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "incident-verification",
  "term": "Incident verification",
  "slug": "incident-verification",
  "shortDefinition": "Incident verification is confirming a failure is real before treating it as an incident.",
  "shortAnswer": "Incident verification describes confirming a failure is real before treating it as an incident. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "incidents",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "retry",
    "false-positive",
    "incident",
    "monitoring-region",
    "recovery-confirmation"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "incident-communication"
  ],
  "documentationLinks": [
    {
      "href": "/docs/incidents/verification",
      "label": "Incident verification"
    }
  ],
  "productLinks": [],
  "searchIntent": "definition",
  "primaryQuery": "what is incident verification",
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
  "featured": true,
  "foundational": true,
  "llmInclude": true,
  "indexable": true,
  "canonical": true,
  "redirects": [],
  "poweredByWiki": true,
  "cta": "monitor",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Incident verification? Definition and Examples",
  "description": "Incident verification: confirming a failure is real before treating it as an incident. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Incident verification matters because teams need a precise shared meaning for confirming a failure is real before treating it as an incident. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, confirming a failure is real before treating it as an incident shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of incident verification is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around a second region confirming https://api.example.com/health is down. When observed behavior stops matching the definition of incident verification, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Verification means blaming a root cause", body: ["That reading usually collapses distinct ideas into one slogan. Keep incident verification tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Fajita verifies failures before alerting. See [incident verification](/docs/incidents/verification)."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "incident-response",
  "term": "Incident response",
  "slug": "incident-response",
  "shortDefinition": "Incident response is the coordinated actions taken while a service is degraded or down.",
  "shortAnswer": "Incident response describes the coordinated actions taken while a service is degraded or down. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "incidents",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "incident-acknowledgment",
    "incident-assignment",
    "incident-severity"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "incident-communication"
  ],
  "documentationLinks": [],
  "productLinks": [],
  "searchIntent": "definition",
  "primaryQuery": "what is incident response",
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
  "poweredByWiki": true,
  "cta": "none",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Incident response? Definition and Examples",
  "description": "Incident response: the coordinated actions taken while a service is degraded or down. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Incident response matters because teams need a precise shared meaning for the coordinated actions taken while a service is degraded or down. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, the coordinated actions taken while a service is degraded or down shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of incident response is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around acknowledging and assigning a checkout outage. When observed behavior stops matching the definition of incident response, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Response is only writing a public status update", body: ["That reading usually collapses distinct ideas into one slogan. Keep incident response tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Fajita supports acknowledgment, assignment, timeline notes, and recovery confirmation during response."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "incident-severity",
  "term": "Incident severity",
  "slug": "incident-severity",
  "shortDefinition": "Incident severity is a ranked label for how bad an incident is.",
  "shortAnswer": "Incident severity describes a ranked label for how bad an incident is. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "incidents",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "degraded-performance",
    "major-outage",
    "partial-outage"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "incident-communication"
  ],
  "documentationLinks": [],
  "productLinks": [],
  "searchIntent": "definition",
  "primaryQuery": "what is incident severity",
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
  "poweredByWiki": true,
  "cta": "none",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Incident severity? Definition and Examples",
  "description": "Incident severity: a ranked label for how bad an incident is. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Incident severity matters because teams need a precise shared meaning for a ranked label for how bad an incident is. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, a ranked label for how bad an incident is shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of incident severity is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around severity high for payments API downtime. When observed behavior stops matching the definition of incident severity, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Severity is the same as priority forever", body: ["That reading usually collapses distinct ideas into one slogan. Keep incident severity tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Fajita lets teams set severity so routing and status communication match impact. See [degraded vs down](/docs/incidents/degraded-vs-down)."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "degraded-performance",
  "term": "Degraded performance",
  "slug": "degraded-performance",
  "shortDefinition": "Degraded performance is a state where a service works partially or slowly but is not fully down.",
  "shortAnswer": "Degraded performance describes a state where a service works partially or slowly but is not fully down. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "incidents",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "partial-outage",
    "major-outage",
    "response-time-threshold"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "incident-communication"
  ],
  "documentationLinks": [],
  "productLinks": [],
  "searchIntent": "definition",
  "primaryQuery": "what is degraded performance",
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
  "poweredByWiki": true,
  "cta": "none",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Degraded performance? Definition and Examples",
  "description": "Degraded performance: a state where a service works partially or slowly but is not fully down. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Degraded performance matters because teams need a precise shared meaning for a state where a service works partially or slowly but is not fully down. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, a state where a service works partially or slowly but is not fully down shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of degraded performance is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around search API responding in 4s instead of 200ms. When observed behavior stops matching the definition of degraded performance, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Degraded always means completely offline", body: ["That reading usually collapses distinct ideas into one slogan. Keep degraded performance tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Fajita distinguishes degraded from down. See [degraded vs down](/docs/incidents/degraded-vs-down)."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "partial-outage",
  "term": "Partial outage",
  "slug": "partial-outage",
  "shortDefinition": "Partial outage is a failure that affects some features, regions, or customers but not the whole service.",
  "shortAnswer": "Partial outage describes a failure that affects some features, regions, or customers but not the whole service. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "incidents",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "degraded-performance",
    "major-outage",
    "status-page-component"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "incident-communication"
  ],
  "documentationLinks": [],
  "productLinks": [],
  "searchIntent": "definition",
  "primaryQuery": "what is partial outage",
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
  "poweredByWiki": true,
  "cta": "none",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Partial outage? Definition and Examples",
  "description": "Partial outage: a failure that affects some features, regions, or customers but not the whole service. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Partial outage matters because teams need a precise shared meaning for a failure that affects some features, regions, or customers but not the whole service. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, a failure that affects some features, regions, or customers but not the whole service shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of partial outage is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around billing API down while marketing site stays up. When observed behavior stops matching the definition of partial outage, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Partial outage means only one server restarted", body: ["That reading usually collapses distinct ideas into one slogan. Keep partial outage tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Describe partial outages clearly on status pages so customers know what still works."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "major-outage",
  "term": "Major outage",
  "slug": "major-outage",
  "shortDefinition": "Major outage is a severe failure that blocks core customer journeys.",
  "shortAnswer": "Major outage describes a severe failure that blocks core customer journeys. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "incidents",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "partial-outage",
    "incident-severity",
    "public-incident"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "incident-communication"
  ],
  "documentationLinks": [],
  "productLinks": [],
  "searchIntent": "definition",
  "primaryQuery": "what is major outage",
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
  "poweredByWiki": true,
  "cta": "none",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Major outage? Definition and Examples",
  "description": "Major outage: a severe failure that blocks core customer journeys. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Major outage matters because teams need a precise shared meaning for a severe failure that blocks core customer journeys. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, a severe failure that blocks core customer journeys shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of major outage is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around login and checkout both unavailable. When observed behavior stops matching the definition of major outage, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Every failed check is a major outage", body: ["That reading usually collapses distinct ideas into one slogan. Keep major outage tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Reserve major outage language for core path failures and keep status copy honest."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "service-disruption",
  "term": "Service disruption",
  "slug": "service-disruption",
  "shortDefinition": "Service disruption is an interruption to normal service behavior, whether partial or complete.",
  "shortAnswer": "Service disruption describes an interruption to normal service behavior, whether partial or complete. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "incidents",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "incident",
    "scheduled-maintenance",
    "public-incident"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "incident-communication"
  ],
  "documentationLinks": [],
  "productLinks": [],
  "searchIntent": "definition",
  "primaryQuery": "what is service disruption",
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
  "poweredByWiki": true,
  "cta": "none",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Service disruption? Definition and Examples",
  "description": "Service disruption: an interruption to normal service behavior, whether partial or complete. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Service disruption matters because teams need a precise shared meaning for an interruption to normal service behavior, whether partial or complete. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, an interruption to normal service behavior, whether partial or complete shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of service disruption is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around customers unable to export reports. When observed behavior stops matching the definition of service disruption, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Disruption is only intentional maintenance", body: ["That reading usually collapses distinct ideas into one slogan. Keep service disruption tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Use disruption language carefully on status pages; pair it with components and updates."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "recovery-confirmation",
  "term": "Recovery confirmation",
  "slug": "recovery-confirmation",
  "shortDefinition": "Recovery confirmation is evidence that a service has returned to healthy behavior after a failure.",
  "shortAnswer": "Recovery confirmation describes evidence that a service has returned to healthy behavior after a failure. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "incidents",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "incident-resolution",
    "incident-verification",
    "flapping"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "incident-communication"
  ],
  "documentationLinks": [
    {
      "href": "/docs/incidents/recovery",
      "label": "Recovery"
    }
  ],
  "productLinks": [],
  "searchIntent": "definition",
  "primaryQuery": "what is recovery confirmation",
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
  "foundational": true,
  "llmInclude": true,
  "indexable": true,
  "canonical": true,
  "redirects": [],
  "poweredByWiki": true,
  "cta": "none",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Recovery confirmation? Definition and Examples",
  "description": "Recovery confirmation: evidence that a service has returned to healthy behavior after a failure. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Recovery confirmation matters because teams need a precise shared meaning for evidence that a service has returned to healthy behavior after a failure. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, evidence that a service has returned to healthy behavior after a failure shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of recovery confirmation is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around successful checks after api.example.com recovered. When observed behavior stops matching the definition of recovery confirmation, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Recovery is the first successful ping", body: ["That reading usually collapses distinct ideas into one slogan. Keep recovery confirmation tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Fajita confirms recovery before closing the loop. See [recovery](/docs/incidents/recovery)."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "incident-resolution",
  "term": "Incident resolution",
  "slug": "incident-resolution",
  "shortDefinition": "Incident resolution is closing an incident after the service is healthy again and work is complete.",
  "shortAnswer": "Incident resolution describes closing an incident after the service is healthy again and work is complete. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "incidents",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "recovery-confirmation",
    "incident-recap",
    "post-incident-review"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "incident-communication"
  ],
  "documentationLinks": [],
  "productLinks": [],
  "searchIntent": "definition",
  "primaryQuery": "what is incident resolution",
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
  "poweredByWiki": true,
  "cta": "none",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Incident resolution? Definition and Examples",
  "description": "Incident resolution: closing an incident after the service is healthy again and work is complete. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Incident resolution matters because teams need a precise shared meaning for closing an incident after the service is healthy again and work is complete. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, closing an incident after the service is healthy again and work is complete shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of incident resolution is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around marking the checkout incident resolved. When observed behavior stops matching the definition of incident resolution, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Resolution deletes the incident history", body: ["That reading usually collapses distinct ideas into one slogan. Keep incident resolution tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Resolved incidents remain in history for review and uptime context."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "incident-reopening",
  "term": "Incident reopening",
  "slug": "incident-reopening",
  "shortDefinition": "Incident reopening is returning a resolved incident to an active state when failure returns.",
  "shortAnswer": "Incident reopening describes returning a resolved incident to an active state when failure returns. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "incidents",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "flapping",
    "recovery-confirmation",
    "incident"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "incident-communication"
  ],
  "documentationLinks": [],
  "productLinks": [],
  "searchIntent": "definition",
  "primaryQuery": "what is incident reopening",
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
  "poweredByWiki": true,
  "cta": "none",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Incident reopening? Definition and Examples",
  "description": "Incident reopening: returning a resolved incident to an active state when failure returns. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Incident reopening matters because teams need a precise shared meaning for returning a resolved incident to an active state when failure returns. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, returning a resolved incident to an active state when failure returns shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of incident reopening is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around checkout fails again twenty minutes after resolve. When observed behavior stops matching the definition of incident reopening, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Reopening always means a brand-new incident", body: ["That reading usually collapses distinct ideas into one slogan. Keep incident reopening tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Reopening preserves context when a fix did not hold. Watch for flapping patterns."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "flapping",
  "term": "Flapping",
  "slug": "flapping",
  "shortDefinition": "Flapping is rapid oscillation between healthy and failed states.",
  "shortAnswer": "Flapping describes rapid oscillation between healthy and failed states. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "incidents",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "incident-reopening",
    "retry",
    "false-positive"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "incident-communication"
  ],
  "documentationLinks": [],
  "productLinks": [],
  "searchIntent": "definition",
  "primaryQuery": "what is flapping",
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
  "poweredByWiki": true,
  "cta": "none",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Flapping? Definition and Examples",
  "description": "Flapping: rapid oscillation between healthy and failed states. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Flapping matters because teams need a precise shared meaning for rapid oscillation between healthy and failed states. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, rapid oscillation between healthy and failed states shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of flapping is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around api.example.com alternating pass and fail each minute. When observed behavior stops matching the definition of flapping, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Flapping is the same as a planned deploy", body: ["That reading usually collapses distinct ideas into one slogan. Keep flapping tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Fajita surfaces flapping so teams do not resolve and reopen endlessly."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "false-positive",
  "term": "False positive",
  "slug": "false-positive",
  "shortDefinition": "False positive is an alert or incident that fired when the service was actually fine.",
  "shortAnswer": "False positive describes an alert or incident that fired when the service was actually fine. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "incidents",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "false-negative",
    "incident-verification",
    "retry"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "incident-communication"
  ],
  "documentationLinks": [],
  "productLinks": [],
  "searchIntent": "definition",
  "primaryQuery": "what is false positive",
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
  "foundational": true,
  "llmInclude": true,
  "indexable": true,
  "canonical": true,
  "redirects": [],
  "poweredByWiki": true,
  "cta": "none",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is False positive? Definition and Examples",
  "description": "False positive: an alert or incident that fired when the service was actually fine. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "False positive matters because teams need a precise shared meaning for an alert or incident that fired when the service was actually fine. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, an alert or incident that fired when the service was actually fine shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of false positive is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around a regional blip that looked like downtime. When observed behavior stops matching the definition of false positive, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "False positives mean monitoring is useless", body: ["That reading usually collapses distinct ideas into one slogan. Keep false positive tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Verification and retries reduce false positives without ignoring real outages."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "false-negative",
  "term": "False negative",
  "slug": "false-negative",
  "shortDefinition": "False negative is a real failure that monitoring failed to detect.",
  "shortAnswer": "False negative describes a real failure that monitoring failed to detect. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "incidents",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "false-positive",
    "health-endpoint",
    "api-monitoring"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "incident-communication"
  ],
  "documentationLinks": [],
  "productLinks": [],
  "searchIntent": "definition",
  "primaryQuery": "what is false negative",
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
  "poweredByWiki": true,
  "cta": "none",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is False negative? Definition and Examples",
  "description": "False negative: a real failure that monitoring failed to detect. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "False negative matters because teams need a precise shared meaning for a real failure that monitoring failed to detect. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, a real failure that monitoring failed to detect shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of false negative is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around checkout broken while /health still returned 200. When observed behavior stops matching the definition of false negative, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "False negatives only happen with bad alert channels", body: ["That reading usually collapses distinct ideas into one slogan. Keep false negative tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Monitor real customer paths, not only shallow health endpoints, to reduce false negatives."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "incident-timeline",
  "term": "Incident timeline",
  "slug": "incident-timeline",
  "shortDefinition": "Incident timeline is the ordered record of detection, updates, and recovery for an incident.",
  "shortAnswer": "Incident timeline describes the ordered record of detection, updates, and recovery for an incident. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "incidents",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "incident",
    "incident-recap",
    "public-incident"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "incident-communication"
  ],
  "documentationLinks": [
    {
      "href": "/docs/incidents/timeline",
      "label": "Incident timeline"
    }
  ],
  "productLinks": [],
  "searchIntent": "definition",
  "primaryQuery": "what is incident timeline",
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
  "poweredByWiki": true,
  "cta": "none",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Incident timeline? Definition and Examples",
  "description": "Incident timeline: the ordered record of detection, updates, and recovery for an incident. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Incident timeline matters because teams need a precise shared meaning for the ordered record of detection, updates, and recovery for an incident. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, the ordered record of detection, updates, and recovery for an incident shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of incident timeline is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around timestamps from first fail to resolve. When observed behavior stops matching the definition of incident timeline, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "A timeline is only for public customers", body: ["That reading usually collapses distinct ideas into one slogan. Keep incident timeline tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Fajita keeps an internal timeline. See [incident timeline](/docs/incidents/timeline)."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "incident-acknowledgment",
  "term": "Incident acknowledgment",
  "slug": "incident-acknowledgment",
  "shortDefinition": "Incident acknowledgment is an explicit signal that a human has seen the incident and is engaging.",
  "shortAnswer": "Incident acknowledgment describes an explicit signal that a human has seen the incident and is engaging. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "incidents",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "incident-assignment",
    "incident-response",
    "alert"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "incident-communication"
  ],
  "documentationLinks": [],
  "productLinks": [],
  "searchIntent": "definition",
  "primaryQuery": "what is incident acknowledgment",
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
  "poweredByWiki": true,
  "cta": "none",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Incident acknowledgment? Definition and Examples",
  "description": "Incident acknowledgment: an explicit signal that a human has seen the incident and is engaging. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Incident acknowledgment matters because teams need a precise shared meaning for an explicit signal that a human has seen the incident and is engaging. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, an explicit signal that a human has seen the incident and is engaging shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of incident acknowledgment is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around on-call acknowledges the payments incident. When observed behavior stops matching the definition of incident acknowledgment, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Acknowledgment means the outage is fixed", body: ["That reading usually collapses distinct ideas into one slogan. Keep incident acknowledgment tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Acknowledgment stops duplicate paging confusion while work continues."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "incident-assignment",
  "term": "Incident assignment",
  "slug": "incident-assignment",
  "shortDefinition": "Incident assignment is naming the person or role responsible for driving an incident.",
  "shortAnswer": "Incident assignment describes naming the person or role responsible for driving an incident. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "incidents",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "incident-acknowledgment",
    "incident-response"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "incident-communication"
  ],
  "documentationLinks": [],
  "productLinks": [],
  "searchIntent": "definition",
  "primaryQuery": "what is incident assignment",
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
  "poweredByWiki": true,
  "cta": "none",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Incident assignment? Definition and Examples",
  "description": "Incident assignment: naming the person or role responsible for driving an incident. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Incident assignment matters because teams need a precise shared meaning for naming the person or role responsible for driving an incident. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, naming the person or role responsible for driving an incident shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of incident assignment is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around assigning the checkout incident to the payments owner. When observed behavior stops matching the definition of incident assignment, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Assignment replaces the need for a timeline", body: ["That reading usually collapses distinct ideas into one slogan. Keep incident assignment tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Clear assignment keeps incident response from stalling in a group channel."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "incident-recap",
  "term": "Incident recap",
  "slug": "incident-recap",
  "shortDefinition": "Incident recap is a short after-action summary of what happened and what changed.",
  "shortAnswer": "Incident recap describes a short after-action summary of what happened and what changed. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "incidents",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "post-incident-review",
    "root-cause-analysis",
    "incident-timeline"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "incident-communication"
  ],
  "documentationLinks": [],
  "productLinks": [],
  "searchIntent": "definition",
  "primaryQuery": "what is incident recap",
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
  "poweredByWiki": true,
  "cta": "none",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Incident recap? Definition and Examples",
  "description": "Incident recap: a short after-action summary of what happened and what changed. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Incident recap matters because teams need a precise shared meaning for a short after-action summary of what happened and what changed. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, a short after-action summary of what happened and what changed shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of incident recap is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around recap of a two-hour API outage. When observed behavior stops matching the definition of incident recap, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "A recap is a full root-cause analysis", body: ["That reading usually collapses distinct ideas into one slogan. Keep incident recap tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Recaps help teams learn quickly; deeper RCA can follow when stakes require it."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "root-cause-analysis",
  "term": "Root-cause analysis",
  "slug": "root-cause-analysis",
  "shortDefinition": "Root-cause analysis is structured investigation into why an incident happened.",
  "shortAnswer": "Root-cause analysis describes structured investigation into why an incident happened. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "incidents",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "post-incident-review",
    "incident-recap"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "incident-communication"
  ],
  "documentationLinks": [],
  "productLinks": [],
  "searchIntent": "definition",
  "primaryQuery": "what is root-cause analysis",
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
  "poweredByWiki": true,
  "cta": "none",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Root-cause analysis? Definition and Examples",
  "description": "Root-cause analysis: structured investigation into why an incident happened. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Root-cause analysis matters because teams need a precise shared meaning for structured investigation into why an incident happened. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, structured investigation into why an incident happened shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of root-cause analysis is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around finding a bad migration behind 500s. When observed behavior stops matching the definition of root-cause analysis, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "There is always exactly one root cause", body: ["That reading usually collapses distinct ideas into one slogan. Keep root-cause analysis tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Prefer clear contributing factors over a single blame story."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "post-incident-review",
  "term": "Post-incident review",
  "slug": "post-incident-review",
  "shortDefinition": "Post-incident review is a blameless review of detection, response, and prevention after an incident.",
  "shortAnswer": "Post-incident review describes a blameless review of detection, response, and prevention after an incident. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "incidents",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "root-cause-analysis",
    "incident-recap",
    "incident-management"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "incident-communication"
  ],
  "documentationLinks": [],
  "productLinks": [],
  "searchIntent": "definition",
  "primaryQuery": "what is post-incident review",
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
  "poweredByWiki": true,
  "cta": "none",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Post-incident review? Definition and Examples",
  "description": "Post-incident review: a blameless review of detection, response, and prevention after an incident. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Post-incident review matters because teams need a precise shared meaning for a blameless review of detection, response, and prevention after an incident. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, a blameless review of detection, response, and prevention after an incident shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of post-incident review is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around review meeting after a status-page-worthy outage. When observed behavior stops matching the definition of post-incident review, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "The review exists to assign personal blame", body: ["That reading usually collapses distinct ideas into one slogan. Keep post-incident review tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Focus reviews on system improvements: detection gaps, communication, and follow-up actions."],
    
  }),
  faqs: undefined,
  formula: undefined,
})
];
