import { h2, p, table } from "@/lib/docs/blocks";
import { buildTermBody } from "@/lib/glossary/authoring";
import { defineTerm, type GlossaryTerm } from "@/lib/glossary/types";
import { uptimeTableForBlocks } from "@/lib/glossary/uptime-tables";

export const reliabilityMetricTerms: GlossaryTerm[] = [
defineTerm({
  meta: {
  "id": "uptime",
  "term": "Uptime",
  "slug": "uptime",
  "shortDefinition": "Uptime is the time a service was available during a period.",
  "shortAnswer": "Uptime describes the time a service was available during a period. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "reliability-metrics",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "downtime",
    "uptime-percentage",
    "availability"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "uptime-monitoring"
  ],
  "documentationLinks": [
    {
      "href": "/docs/reference/terminology",
      "label": "Terminology"
    }
  ],
  "productLinks": [
    {
      "href": "/features/uptime-monitoring",
      "label": "Uptime monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is uptime",
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
  "cta": "documentation",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Uptime? Definition and Examples",
  "description": "Uptime: the time a service was available during a period. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Uptime matters because teams need a precise shared meaning for the time a service was available during a period. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, the time a service was available during a period shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of uptime is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around api.example.com available for 29 days 23 hours in a month. When observed behavior stops matching the definition of uptime, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Uptime is a vendor marketing badge with one universal formula", body: ["That reading usually collapses distinct ideas into one slogan. Keep uptime tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Fajita derives uptime views from monitor history and status-page history. Definitions of eligible time can vary."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "downtime",
  "term": "Downtime",
  "slug": "downtime",
  "shortDefinition": "Downtime is the time a service was unavailable during a period.",
  "shortAnswer": "Downtime describes the time a service was unavailable during a period. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "reliability-metrics",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "uptime",
    "major-outage",
    "maintenance-window"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "uptime-monitoring"
  ],
  "documentationLinks": [
    {
      "href": "/docs/reference/terminology",
      "label": "Terminology"
    }
  ],
  "productLinks": [
    {
      "href": "/features/uptime-monitoring",
      "label": "Uptime monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is downtime",
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
  "cta": "documentation",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Downtime? Definition and Examples",
  "description": "Downtime: the time a service was unavailable during a period. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Downtime matters because teams need a precise shared meaning for the time a service was unavailable during a period. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, the time a service was unavailable during a period shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of downtime is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around 43 minutes of downtime in a month. When observed behavior stops matching the definition of downtime, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Downtime only counts when you post a status incident", body: ["That reading usually collapses distinct ideas into one slogan. Keep downtime tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Define whether maintenance and missing data count before comparing downtime numbers."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "availability",
  "term": "Availability",
  "slug": "availability",
  "shortDefinition": "Availability is the share of time a service was able to fulfill its intended function.",
  "shortAnswer": "Availability describes the share of time a service was able to fulfill its intended function. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "reliability-metrics",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "uptime",
    "service-availability",
    "service-level-objective"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "uptime-monitoring"
  ],
  "documentationLinks": [
    {
      "href": "/docs/reference/terminology",
      "label": "Terminology"
    }
  ],
  "productLinks": [
    {
      "href": "/features/uptime-monitoring",
      "label": "Uptime monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is availability",
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
  "cta": "documentation",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Availability? Definition and Examples",
  "description": "Availability: the share of time a service was able to fulfill its intended function. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Availability matters because teams need a precise shared meaning for the share of time a service was able to fulfill its intended function. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, the share of time a service was able to fulfill its intended function shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of availability is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around 99.9% availability target for checkout. When observed behavior stops matching the definition of availability, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Availability always equals uptime percentage from one probe", body: ["That reading usually collapses distinct ideas into one slogan. Keep availability tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Availability definitions vary. Write yours down before arguing about decimals."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "reliability",
  "term": "Reliability",
  "slug": "reliability",
  "shortDefinition": "Reliability is the consistency with which a service meets its expected behavior over time.",
  "shortAnswer": "Reliability describes the consistency with which a service meets its expected behavior over time. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "reliability-metrics",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "availability",
    "mean-time-to-recovery",
    "incident-management"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "uptime-monitoring"
  ],
  "documentationLinks": [
    {
      "href": "/docs/reference/terminology",
      "label": "Terminology"
    }
  ],
  "productLinks": [
    {
      "href": "/features/uptime-monitoring",
      "label": "Uptime monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is reliability",
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
  "cta": "documentation",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Reliability? Definition and Examples",
  "description": "Reliability: the consistency with which a service meets its expected behavior over time. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Reliability matters because teams need a precise shared meaning for the consistency with which a service meets its expected behavior over time. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, the consistency with which a service meets its expected behavior over time shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of reliability is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around a quarter with fewer customer-facing incidents. When observed behavior stops matching the definition of reliability, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Reliability is only uptime marketing", body: ["That reading usually collapses distinct ideas into one slogan. Keep reliability tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Reliability includes detection, recovery, and communication quality, not only green checks."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "service-availability",
  "term": "Service availability",
  "slug": "service-availability",
  "shortDefinition": "Service availability is availability measured for a named service or customer journey.",
  "shortAnswer": "Service availability describes availability measured for a named service or customer journey. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "reliability-metrics",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "availability",
    "uptime-percentage",
    "status-page-component"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "uptime-monitoring"
  ],
  "documentationLinks": [
    {
      "href": "/docs/reference/terminology",
      "label": "Terminology"
    }
  ],
  "productLinks": [
    {
      "href": "/features/uptime-monitoring",
      "label": "Uptime monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is service availability",
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
  "cta": "documentation",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Service availability? Definition and Examples",
  "description": "Service availability: availability measured for a named service or customer journey. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Service availability matters because teams need a precise shared meaning for availability measured for a named service or customer journey. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, availability measured for a named service or customer journey shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of service availability is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around availability of the billing API this month. When observed behavior stops matching the definition of service availability, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Service availability is a single global cloud number", body: ["That reading usually collapses distinct ideas into one slogan. Keep service availability tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Measure the journey customers feel, not an unrelated internal host."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "uptime-percentage",
  "term": "Uptime percentage",
  "slug": "uptime-percentage",
  "shortDefinition": "Uptime percentage is availability expressed as a percentage of eligible monitored time.",
  "shortAnswer": "Uptime percentage describes availability expressed as a percentage of eligible monitored time. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "reliability-metrics",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "uptime",
    "downtime",
    "service-level-agreement"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "uptime-monitoring"
  ],
  "documentationLinks": [
    {
      "href": "/docs/reference/terminology",
      "label": "Terminology"
    }
  ],
  "productLinks": [
    {
      "href": "/features/uptime-monitoring",
      "label": "Uptime monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is uptime percentage",
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
  "cta": "documentation",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Uptime percentage? Definition and Examples",
  "description": "Uptime percentage: availability expressed as a percentage of eligible monitored time. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Uptime percentage matters because teams need a precise shared meaning for availability expressed as a percentage of eligible monitored time. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, availability expressed as a percentage of eligible monitored time shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of uptime percentage is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around 99.95% uptime for the API component. When observed behavior stops matching the definition of uptime percentage, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Uptime percentage is automatically an SLA credit", body: ["That reading usually collapses distinct ideas into one slogan. Keep uptime percentage tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Uptime percentage is a metric. An SLA is a contract. Do not confuse them."],
    extra: (() => { const t = uptimeTableForBlocks(); return [h2("Uptime and downtime examples"), table(t.headers, t.rows, t.caption), p("Month figures use a 30-day month. Year figures use 365.25 days. Organizations may define eligible time differently.")]; })(),
  }),
  faqs: undefined,
  formula: { label: "Uptime percentage", expression: "Uptime percentage = Eligible available time ÷ Eligible monitored time × 100", notes: ["Define eligible time, including whether maintenance is excluded.", "Define how missing data is handled.", "Different providers calculate differently; compare methodologies before comparing numbers."] },
}),

defineTerm({
  meta: {
  "id": "mean-time-to-detect",
  "term": "Mean time to detect",
  "slug": "mean-time-to-detect",
  "shortDefinition": "Mean time to detect is the average time from failure start to detection.",
  "shortAnswer": "Mean time to detect describes the average time from failure start to detection. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "reliability-metrics",
  "secondaryCategories": [],
  "acronym": "MTTD",
  "expandedName": "Mean Time to Detect",
  "synonyms": [],
  "relatedTerms": [
    "mean-time-to-recovery",
    "incident-detection"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "uptime-monitoring"
  ],
  "documentationLinks": [
    {
      "href": "/docs/reference/terminology",
      "label": "Terminology"
    }
  ],
  "productLinks": [
    {
      "href": "/features/uptime-monitoring",
      "label": "Uptime monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is mean time to detect",
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
  "cta": "documentation",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Mean time to detect? Definition and Examples",
  "description": "Mean time to detect: the average time from failure start to detection. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Mean time to detect matters because teams need a precise shared meaning for the average time from failure start to detection. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, the average time from failure start to detection shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of mean time to detect is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around MTTD of eight minutes across incidents. When observed behavior stops matching the definition of mean time to detect, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "MTTD starts when someone opens a laptop", body: ["That reading usually collapses distinct ideas into one slogan. Keep mean time to detect tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Faster detection usually means better external monitoring coverage and alert delivery."],
    
  }),
  faqs: undefined,
  formula: { label: "MTTD", expression: "MTTD = Total time from failure start to detection ÷ Number of incidents", notes: ["Failure start can be hard to know precisely.", "Use consistent clocks and incident markers."] },
}),

defineTerm({
  meta: {
  "id": "mean-time-to-recovery",
  "term": "Mean time to recovery",
  "slug": "mean-time-to-recovery",
  "shortDefinition": "Mean time to recovery is the average time from failure to restored service.",
  "shortAnswer": "Mean time to recovery describes the average time from failure to restored service. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "reliability-metrics",
  "secondaryCategories": [],
  "acronym": "MTTR",
  "expandedName": "Mean Time to Recovery",
  "synonyms": [],
  "relatedTerms": [
    "mean-time-to-detect",
    "incident-resolution",
    "recovery-confirmation"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "uptime-monitoring"
  ],
  "documentationLinks": [
    {
      "href": "/docs/reference/terminology",
      "label": "Terminology"
    }
  ],
  "productLinks": [
    {
      "href": "/features/uptime-monitoring",
      "label": "Uptime monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is mean time to recovery",
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
  "cta": "documentation",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Mean time to recovery? Definition and Examples",
  "description": "Mean time to recovery: the average time from failure to restored service. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Mean time to recovery matters because teams need a precise shared meaning for the average time from failure to restored service. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, the average time from failure to restored service shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of mean time to recovery is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around MTTR of thirty-five minutes last quarter. When observed behavior stops matching the definition of mean time to recovery, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "MTTR always means mean time to repair with one universal formula", body: ["That reading usually collapses distinct ideas into one slogan. Keep mean time to recovery tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["MTTR is ambiguous in the industry. Define whether it starts at failure, detection, or acknowledgment."],
    
  }),
  faqs: [{ question: "Does MTTR mean repair or recovery?", answer: "Both expansions are used. Publish your definition beside the number." }, { question: "Should MTTR include nights and weekends?", answer: "Yes if customers were impacted then. Exclude periods only when your written definition says so." }],
  formula: { label: "MTTR", expression: "MTTR = Total incident recovery time ÷ Number of resolved incidents", notes: ["State whether recovery time starts at failure detection or impact start.", "Do not treat MTTR as a contractual SLA unless a contract says so."] },
}),

defineTerm({
  meta: {
  "id": "mean-time-between-failures",
  "term": "Mean time between failures",
  "slug": "mean-time-between-failures",
  "shortDefinition": "Mean time between failures is the average time from one failure to the next for a system.",
  "shortAnswer": "Mean time between failures describes the average time from one failure to the next for a system. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "reliability-metrics",
  "secondaryCategories": [],
  "acronym": "MTBF",
  "expandedName": "Mean Time Between Failures",
  "synonyms": [],
  "relatedTerms": [
    "reliability",
    "uptime",
    "mean-time-to-recovery"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "uptime-monitoring"
  ],
  "documentationLinks": [
    {
      "href": "/docs/reference/terminology",
      "label": "Terminology"
    }
  ],
  "productLinks": [
    {
      "href": "/features/uptime-monitoring",
      "label": "Uptime monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is mean time between failures",
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
  "cta": "documentation",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Mean time between failures? Definition and Examples",
  "description": "Mean time between failures: the average time from one failure to the next for a system. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Mean time between failures matters because teams need a precise shared meaning for the average time from one failure to the next for a system. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, the average time from one failure to the next for a system shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of mean time between failures is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around MTBF measured across production incidents. When observed behavior stops matching the definition of mean time between failures, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "MTBF proves a system will never fail again", body: ["That reading usually collapses distinct ideas into one slogan. Keep mean time between failures tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["MTBF is a reliability statistic, not a promise. Sample size matters."],
    
  }),
  faqs: undefined,
  formula: { label: "MTBF", expression: "MTBF = Total operating time ÷ Number of failures", notes: ["Define operating time carefully.", "Small samples produce misleading averages."] },
}),

defineTerm({
  meta: {
  "id": "service-level-indicator",
  "term": "Service-level indicator",
  "slug": "service-level-indicator",
  "shortDefinition": "Service-level indicator is a quantitative measure of some aspect of service level.",
  "shortAnswer": "Service-level indicator describes a quantitative measure of some aspect of service level. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "reliability-metrics",
  "secondaryCategories": [],
  "acronym": "SLI",
  "expandedName": "Service-Level Indicator",
  "synonyms": [],
  "relatedTerms": [
    "service-level-objective",
    "service-level-agreement",
    "error-rate"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "uptime-monitoring"
  ],
  "documentationLinks": [
    {
      "href": "/docs/reference/terminology",
      "label": "Terminology"
    }
  ],
  "productLinks": [
    {
      "href": "/features/uptime-monitoring",
      "label": "Uptime monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is service-level indicator",
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
  "cta": "documentation",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Service-level indicator? Definition and Examples",
  "description": "Service-level indicator: a quantitative measure of some aspect of service level. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Service-level indicator matters because teams need a precise shared meaning for a quantitative measure of some aspect of service level. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, a quantitative measure of some aspect of service level shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of service-level indicator is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around success rate of checkout API as an SLI. When observed behavior stops matching the definition of service-level indicator, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "An SLI is a legal contract", body: ["That reading usually collapses distinct ideas into one slogan. Keep service-level indicator tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Pick SLIs that reflect user happiness, then set objectives against them."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "service-level-objective",
  "term": "Service-level objective",
  "slug": "service-level-objective",
  "shortDefinition": "Service-level objective is a target value or range for a service-level indicator.",
  "shortAnswer": "Service-level objective describes a target value or range for a service-level indicator. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "reliability-metrics",
  "secondaryCategories": [],
  "acronym": "SLO",
  "expandedName": "Service-Level Objective",
  "synonyms": [],
  "relatedTerms": [
    "service-level-indicator",
    "service-level-agreement",
    "uptime-percentage"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "uptime-monitoring"
  ],
  "documentationLinks": [
    {
      "href": "/docs/reference/terminology",
      "label": "Terminology"
    }
  ],
  "productLinks": [
    {
      "href": "/features/uptime-monitoring",
      "label": "Uptime monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is service-level objective",
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
  "cta": "documentation",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Service-level objective? Definition and Examples",
  "description": "Service-level objective: a target value or range for a service-level indicator. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Service-level objective matters because teams need a precise shared meaning for a target value or range for a service-level indicator. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, a target value or range for a service-level indicator shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of service-level objective is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around 99.9% success over 28 days. When observed behavior stops matching the definition of service-level objective, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "An SLO is automatically refundable", body: ["That reading usually collapses distinct ideas into one slogan. Keep service-level objective tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["SLOs guide engineering tradeoffs. SLAs are contractual. Keep them distinct."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "service-level-agreement",
  "term": "Service-level agreement",
  "slug": "service-level-agreement",
  "shortDefinition": "Service-level agreement is a contractual commitment about service level between parties.",
  "shortAnswer": "Service-level agreement describes a contractual commitment about service level between parties. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "reliability-metrics",
  "secondaryCategories": [],
  "acronym": "SLA",
  "expandedName": "Service-Level Agreement",
  "synonyms": [],
  "relatedTerms": [
    "service-level-objective",
    "uptime-percentage",
    "service-level-indicator"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "uptime-monitoring"
  ],
  "documentationLinks": [
    {
      "href": "/docs/reference/terminology",
      "label": "Terminology"
    }
  ],
  "productLinks": [
    {
      "href": "/legal/terms",
      "label": "Terms"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is service-level agreement",
  "secondaryQueries": [],
  "status": "published",
  "owner": "glossary-editorial",
  "reviewers": [
    "product",
    "legal"
  ],
  "lastReviewedAt": "2026-07-17",
  "nextReviewDue": "2026-10-17",
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
  "requiresLegalReview": true,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Service-level agreement? Definition and Examples",
  "description": "Service-level agreement: a contractual commitment about service level between parties. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Service-level agreement matters because teams need a precise shared meaning for a contractual commitment about service level between parties. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, a contractual commitment about service level between parties shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of service-level agreement is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around contractual 99.9% monthly uptime with defined credits. When observed behavior stops matching the definition of service-level agreement, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "A glossary definition controls Fajita customer contracts", body: ["That reading usually collapses distinct ideas into one slogan. Keep service-level agreement tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["This glossary page provides a general explanation. The applicable agreement controls Fajita’s contractual obligations."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "recovery-time-objective",
  "term": "Recovery time objective",
  "slug": "recovery-time-objective",
  "shortDefinition": "Recovery time objective is the maximum acceptable time to restore a service after disruption.",
  "shortAnswer": "Recovery time objective describes the maximum acceptable time to restore a service after disruption. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "reliability-metrics",
  "secondaryCategories": [],
  "acronym": "RTO",
  "expandedName": "Recovery Time Objective",
  "synonyms": [],
  "relatedTerms": [
    "recovery-point-objective",
    "mean-time-to-recovery"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "uptime-monitoring"
  ],
  "documentationLinks": [
    {
      "href": "/docs/reference/terminology",
      "label": "Terminology"
    }
  ],
  "productLinks": [
    {
      "href": "/features/uptime-monitoring",
      "label": "Uptime monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is recovery time objective",
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
  "cta": "documentation",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Recovery time objective? Definition and Examples",
  "description": "Recovery time objective: the maximum acceptable time to restore a service after disruption. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Recovery time objective matters because teams need a precise shared meaning for the maximum acceptable time to restore a service after disruption. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, the maximum acceptable time to restore a service after disruption shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of recovery time objective is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around RTO of one hour for billing. When observed behavior stops matching the definition of recovery time objective, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "RTO is measured automatically by every uptime tool", body: ["That reading usually collapses distinct ideas into one slogan. Keep recovery time objective tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["RTO is a planning target. Measure actual recovery separately."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "recovery-point-objective",
  "term": "Recovery point objective",
  "slug": "recovery-point-objective",
  "shortDefinition": "Recovery point objective is the maximum acceptable amount of data loss measured in time.",
  "shortAnswer": "Recovery point objective describes the maximum acceptable amount of data loss measured in time. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "reliability-metrics",
  "secondaryCategories": [],
  "acronym": "RPO",
  "expandedName": "Recovery Point Objective",
  "synonyms": [],
  "relatedTerms": [
    "recovery-time-objective",
    "mean-time-to-recovery",
    "reliability"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "uptime-monitoring"
  ],
  "documentationLinks": [
    {
      "href": "/docs/reference/terminology",
      "label": "Terminology"
    }
  ],
  "productLinks": [
    {
      "href": "/features/uptime-monitoring",
      "label": "Uptime monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is recovery point objective",
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
  "cta": "documentation",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Recovery point objective? Definition and Examples",
  "description": "Recovery point objective: the maximum acceptable amount of data loss measured in time. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Recovery point objective matters because teams need a precise shared meaning for the maximum acceptable amount of data loss measured in time. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, the maximum acceptable amount of data loss measured in time shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of recovery point objective is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around RPO of fifteen minutes for order data. When observed behavior stops matching the definition of recovery point objective, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "RPO is the same as MTTR", body: ["That reading usually collapses distinct ideas into one slogan. Keep recovery point objective tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["RPO guides backup and replication design. Uptime monitoring does not set RPO by itself."],
    
  }),
  faqs: undefined,
  formula: undefined,
})
];
