import { h2, p, table } from "@/lib/docs/blocks";
import { buildTermBody } from "@/lib/glossary/authoring";
import { defineTerm, type GlossaryTerm } from "@/lib/glossary/types";

export const performanceTerms: GlossaryTerm[] = [
defineTerm({
  meta: {
  "id": "latency",
  "term": "Latency",
  "slug": "latency",
  "shortDefinition": "Latency is the delay between starting a request and observing a response milestone.",
  "shortAnswer": "Latency describes the delay between starting a request and observing a response milestone. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "performance",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "response-time",
    "time-to-first-byte",
    "response-time-threshold"
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
      "href": "/docs/assertions/overview",
      "label": "Assertions overview"
    }
  ],
  "productLinks": [
    {
      "href": "/features/uptime-monitoring",
      "label": "Uptime monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is latency",
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
  "cta": "monitor",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Latency? Definition and Examples",
  "description": "Latency: the delay between starting a request and observing a response milestone. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Latency matters because teams need a precise shared meaning for the delay between starting a request and observing a response milestone. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, the delay between starting a request and observing a response milestone shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of latency is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around p95 latency of 240ms for /v1/search. When observed behavior stops matching the definition of latency, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Latency is the same as downtime", body: ["That reading usually collapses distinct ideas into one slogan. Keep latency tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Watch latency with response-time thresholds so slowdowns page someone before full failure."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "response-time",
  "term": "Response time",
  "slug": "response-time",
  "shortDefinition": "Response time is how long a request takes until a complete response is received.",
  "shortAnswer": "Response time describes how long a request takes until a complete response is received. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "performance",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "latency",
    "timeout",
    "response-time-threshold"
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
      "href": "/docs/assertions/overview",
      "label": "Assertions overview"
    }
  ],
  "productLinks": [
    {
      "href": "/features/uptime-monitoring",
      "label": "Uptime monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is response time",
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
  "cta": "monitor",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Response time? Definition and Examples",
  "description": "Response time: how long a request takes until a complete response is received. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Response time matters because teams need a precise shared meaning for how long a request takes until a complete response is received. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, how long a request takes until a complete response is received shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of response time is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around 820ms response time on a health check. When observed behavior stops matching the definition of response time, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Response time only matters for marketing sites", body: ["That reading usually collapses distinct ideas into one slogan. Keep response time tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Fajita can fail checks that exceed a response-time threshold."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "time-to-first-byte",
  "term": "Time to first byte",
  "slug": "time-to-first-byte",
  "shortDefinition": "Time to first byte is the time until the client receives the first byte of the response.",
  "shortAnswer": "Time to first byte describes the time until the client receives the first byte of the response. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "performance",
  "secondaryCategories": [],
  "acronym": "TTFB",
  "expandedName": "Time to First Byte",
  "synonyms": [],
  "relatedTerms": [
    "latency",
    "response-time"
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
      "href": "/docs/assertions/overview",
      "label": "Assertions overview"
    }
  ],
  "productLinks": [
    {
      "href": "/features/uptime-monitoring",
      "label": "Uptime monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is time to first byte",
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
  "cta": "monitor",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Time to first byte? Definition and Examples",
  "description": "Time to first byte: the time until the client receives the first byte of the response. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Time to first byte matters because teams need a precise shared meaning for the time until the client receives the first byte of the response. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, the time until the client receives the first byte of the response shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of time to first byte is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around TTFB of 120ms for https://www.example.com. When observed behavior stops matching the definition of time to first byte, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "TTFB always equals full page load time", body: ["That reading usually collapses distinct ideas into one slogan. Keep time to first byte tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["TTFB helps separate connection and server delay from download time."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "error-rate",
  "term": "Error rate",
  "slug": "error-rate",
  "shortDefinition": "Error rate is the share of requests that fail within a period.",
  "shortAnswer": "Error rate describes the share of requests that fail within a period. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "performance",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "availability",
    "http-status-code",
    "uptime"
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
      "href": "/docs/assertions/overview",
      "label": "Assertions overview"
    }
  ],
  "productLinks": [
    {
      "href": "/features/uptime-monitoring",
      "label": "Uptime monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is error rate",
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
  "cta": "monitor",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Error rate? Definition and Examples",
  "description": "Error rate: the share of requests that fail within a period. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Error rate matters because teams need a precise shared meaning for the share of requests that fail within a period. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, the share of requests that fail within a period shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of error rate is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around 2% of checkout API calls returning 5xx. When observed behavior stops matching the definition of error rate, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Error rate is the same as uptime percentage", body: ["That reading usually collapses distinct ideas into one slogan. Keep error rate tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Define which statuses count as errors before comparing periods."],
    
  }),
  faqs: undefined,
  formula: undefined,
})
];
