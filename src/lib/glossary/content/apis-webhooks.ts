import { h2, p, table } from "@/lib/docs/blocks";
import { buildTermBody } from "@/lib/glossary/authoring";
import { defineTerm, type GlossaryTerm } from "@/lib/glossary/types";

export const apiWebhookTerms: GlossaryTerm[] = [
defineTerm({
  meta: {
  "id": "api",
  "term": "API",
  "slug": "api",
  "shortDefinition": "API is an interface that lets software request work from other software over a defined contract.",
  "shortAnswer": "API describes an interface that lets software request work from other software over a defined contract. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "apis-webhooks",
  "secondaryCategories": [],
  "acronym": "API",
  "expandedName": "Application Programming Interface",
  "synonyms": [],
  "relatedTerms": [
    "api-endpoint",
    "api-monitoring",
    "http-status-code"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "api-monitoring",
    "webhooks"
  ],
  "documentationLinks": [],
  "productLinks": [
    {
      "href": "/features/api-monitoring",
      "label": "API monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is api",
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
  "cta": "monitor",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is API? Definition and Examples",
  "description": "API: an interface that lets software request work from other software over a defined contract. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "API matters because teams need a precise shared meaning for an interface that lets software request work from other software over a defined contract. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, an interface that lets software request work from other software over a defined contract shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of api is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around https://api.example.com/v1. When observed behavior stops matching the definition of api, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "APIs are only public partner portals", body: ["That reading usually collapses distinct ideas into one slogan. Keep api tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Fajita monitors API endpoints with HTTP assertions. See [API monitoring](/docs/monitors/api-monitoring)."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "api-endpoint",
  "term": "API endpoint",
  "slug": "api-endpoint",
  "shortDefinition": "API endpoint is a specific URL and method that performs one API operation.",
  "shortAnswer": "API endpoint describes a specific URL and method that performs one API operation. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "apis-webhooks",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "api",
    "api-health-check",
    "endpoint-monitoring"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "api-monitoring",
    "webhooks"
  ],
  "documentationLinks": [],
  "productLinks": [
    {
      "href": "/features/api-monitoring",
      "label": "API monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is api endpoint",
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
  "title": "What Is API endpoint? Definition and Examples",
  "description": "API endpoint: a specific URL and method that performs one API operation. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "API endpoint matters because teams need a precise shared meaning for a specific URL and method that performs one API operation. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, a specific URL and method that performs one API operation shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of api endpoint is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around GET https://api.example.com/v1/health. When observed behavior stops matching the definition of api endpoint, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "An endpoint is the entire API product", body: ["That reading usually collapses distinct ideas into one slogan. Keep api endpoint tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Monitor the endpoints that represent real customer journeys."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "api-health-check",
  "term": "API health check",
  "slug": "api-health-check",
  "shortDefinition": "API health check is a request that reports whether an API is ready to serve traffic.",
  "shortAnswer": "API health check describes a request that reports whether an API is ready to serve traffic. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "apis-webhooks",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "health-endpoint",
    "api-monitoring",
    "json-response"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "api-monitoring",
    "webhooks"
  ],
  "documentationLinks": [],
  "productLinks": [
    {
      "href": "/features/api-monitoring",
      "label": "API monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is api health check",
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
  "title": "What Is API health check? Definition and Examples",
  "description": "API health check: a request that reports whether an API is ready to serve traffic. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "API health check matters because teams need a precise shared meaning for a request that reports whether an API is ready to serve traffic. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, a request that reports whether an API is ready to serve traffic shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of api health check is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around GET /health returning {\"status\":\"ok\"}. When observed behavior stops matching the definition of api health check, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Health checks should create real purchases", body: ["That reading usually collapses distinct ideas into one slogan. Keep api health check tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Point monitors at cheap health checks that still reflect dependency readiness."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "http-status-code",
  "term": "HTTP status code",
  "slug": "http-status-code",
  "shortDefinition": "HTTP status code is a three-digit code describing the result of an HTTP request.",
  "shortAnswer": "HTTP status code describes a three-digit code describing the result of an HTTP request. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "apis-webhooks",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "api-monitoring",
    "http-redirect",
    "http-timeout"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "api-monitoring",
    "webhooks"
  ],
  "documentationLinks": [],
  "productLinks": [
    {
      "href": "/features/api-monitoring",
      "label": "API monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is http status code",
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
  "cta": "documentation",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is HTTP status code? Definition and Examples",
  "description": "HTTP status code: a three-digit code describing the result of an HTTP request. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "HTTP status code matters because teams need a precise shared meaning for a three-digit code describing the result of an HTTP request. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, a three-digit code describing the result of an HTTP request shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of http status code is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
      "2xx usually means success, 3xx redirects, 4xx client problems, and 5xx server problems. Monitoring rules should match what your API actually returns for healthy traffic.",
    ],
    example: [
      "Imagine a team operating around 503 from https://api.example.com/health. When observed behavior stops matching the definition of http status code, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Status codes alone explain every failure", body: ["That reading usually collapses distinct ideas into one slogan. Keep http status code tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Use status classes for monitoring rules, then inspect bodies when needed."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "json-response",
  "term": "JSON response",
  "slug": "json-response",
  "shortDefinition": "JSON response is an HTTP response body encoded as JSON.",
  "shortAnswer": "JSON response describes an HTTP response body encoded as JSON. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "apis-webhooks",
  "secondaryCategories": [],
  "acronym": "JSON",
  "expandedName": "JavaScript Object Notation",
  "synonyms": [],
  "relatedTerms": [
    "json-path",
    "api-health-check"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "api-monitoring",
    "webhooks"
  ],
  "documentationLinks": [],
  "productLinks": [
    {
      "href": "/features/api-monitoring",
      "label": "API monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is json response",
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
  "title": "What Is JSON response? Definition and Examples",
  "description": "JSON response: an HTTP response body encoded as JSON. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "JSON response matters because teams need a precise shared meaning for an HTTP response body encoded as JSON. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, an HTTP response body encoded as JSON shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of json response is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around {\"status\":\"ok\"} from a health endpoint. When observed behavior stops matching the definition of json response, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "JSON responses are always small and safe to log whole", body: ["That reading usually collapses distinct ideas into one slogan. Keep json response tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Assert on specific fields. Avoid storing sensitive payloads in screenshots or tickets."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "json-path",
  "term": "JSON path",
  "slug": "json-path",
  "shortDefinition": "JSON path is an expression that selects a value inside a JSON document.",
  "shortAnswer": "JSON path describes an expression that selects a value inside a JSON document. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "apis-webhooks",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "json-response",
    "api-monitoring"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "api-monitoring",
    "webhooks"
  ],
  "documentationLinks": [
    {
      "href": "/docs/assertions/json-path",
      "label": "JSON path assertions"
    }
  ],
  "productLinks": [
    {
      "href": "/features/api-monitoring",
      "label": "API monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is json path",
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
  "title": "What Is JSON path? Definition and Examples",
  "description": "JSON path: an expression that selects a value inside a JSON document. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "JSON path matters because teams need a precise shared meaning for an expression that selects a value inside a JSON document. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, an expression that selects a value inside a JSON document shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of json path is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around $.status equals ok. When observed behavior stops matching the definition of json path, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "JSON path is a database query language", body: ["That reading usually collapses distinct ideas into one slogan. Keep json path tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Fajita can assert JSON paths on API monitors. See [JSON path assertions](/docs/assertions/json-path)."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "response-header",
  "term": "Response header",
  "slug": "response-header",
  "shortDefinition": "Response header is metadata returned by a server with an HTTP response.",
  "shortAnswer": "Response header describes metadata returned by a server with an HTTP response. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "apis-webhooks",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "request-header",
    "http-status-code"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "api-monitoring",
    "webhooks"
  ],
  "documentationLinks": [],
  "productLinks": [
    {
      "href": "/features/api-monitoring",
      "label": "API monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is response header",
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
  "title": "What Is Response header? Definition and Examples",
  "description": "Response header: metadata returned by a server with an HTTP response. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Response header matters because teams need a precise shared meaning for metadata returned by a server with an HTTP response. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, metadata returned by a server with an HTTP response shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of response header is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around content-type: application/json. When observed behavior stops matching the definition of response header, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Headers never matter for monitoring", body: ["That reading usually collapses distinct ideas into one slogan. Keep response header tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Some monitors assert on headers when they encode cache or auth behavior."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "request-header",
  "term": "Request header",
  "slug": "request-header",
  "shortDefinition": "Request header is metadata sent by a client with an HTTP request.",
  "shortAnswer": "Request header describes metadata sent by a client with an HTTP request. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "apis-webhooks",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "response-header",
    "api-monitoring"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "api-monitoring",
    "webhooks"
  ],
  "documentationLinks": [],
  "productLinks": [
    {
      "href": "/features/api-monitoring",
      "label": "API monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is request header",
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
  "title": "What Is Request header? Definition and Examples",
  "description": "Request header: metadata sent by a client with an HTTP request. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Request header matters because teams need a precise shared meaning for metadata sent by a client with an HTTP request. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, metadata sent by a client with an HTTP request shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of request header is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around authorization header on an API check. When observed behavior stops matching the definition of request header, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Put long-lived secrets in public docs examples", body: ["That reading usually collapses distinct ideas into one slogan. Keep request header tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Store monitor credentials as secrets. Rotate them like production keys."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "webhook",
  "term": "Webhook",
  "slug": "webhook",
  "shortDefinition": "Webhook is an HTTP callback that delivers an event to a URL you provide.",
  "shortAnswer": "Webhook describes an HTTP callback that delivers an event to a URL you provide. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "apis-webhooks",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "webhook-payload",
    "webhook-signature",
    "webhook-retry"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "api-monitoring",
    "webhooks"
  ],
  "documentationLinks": [
    {
      "href": "/docs/webhooks/overview",
      "label": "Webhooks overview"
    }
  ],
  "productLinks": [
    {
      "href": "/features/api-monitoring",
      "label": "API monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is webhook",
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
  "cta": "alert",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Webhook? Definition and Examples",
  "description": "Webhook: an HTTP callback that delivers an event to a URL you provide. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Webhook matters because teams need a precise shared meaning for an HTTP callback that delivers an event to a URL you provide. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, an HTTP callback that delivers an event to a URL you provide shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of webhook is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around POST incident.opened to https://hooks.example.com/fajita. When observed behavior stops matching the definition of webhook, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Webhooks are the same as polling APIs", body: ["That reading usually collapses distinct ideas into one slogan. Keep webhook tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Fajita can send webhook alerts and documents verification. See [webhooks overview](/docs/webhooks/overview)."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "webhook-payload",
  "term": "Webhook payload",
  "slug": "webhook-payload",
  "shortDefinition": "Webhook payload is the body of a webhook HTTP request describing an event.",
  "shortAnswer": "Webhook payload describes the body of a webhook HTTP request describing an event. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "apis-webhooks",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "webhook",
    "webhook-signature"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "api-monitoring",
    "webhooks"
  ],
  "documentationLinks": [],
  "productLinks": [
    {
      "href": "/features/api-monitoring",
      "label": "API monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is webhook payload",
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
  "title": "What Is Webhook payload? Definition and Examples",
  "description": "Webhook payload: the body of a webhook HTTP request describing an event. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Webhook payload matters because teams need a precise shared meaning for the body of a webhook HTTP request describing an event. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, the body of a webhook HTTP request describing an event shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of webhook payload is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around JSON describing incident.opened. When observed behavior stops matching the definition of webhook payload, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Payloads should include raw secrets for convenience", body: ["That reading usually collapses distinct ideas into one slogan. Keep webhook payload tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Keep payloads public-safe. Verify signatures before trusting content."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "webhook-signature",
  "term": "Webhook signature",
  "slug": "webhook-signature",
  "shortDefinition": "Webhook signature is a cryptographic proof that a webhook came from the expected sender.",
  "shortAnswer": "Webhook signature describes a cryptographic proof that a webhook came from the expected sender. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "apis-webhooks",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "hmac",
    "webhook",
    "webhook-payload"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "api-monitoring",
    "webhooks"
  ],
  "documentationLinks": [
    {
      "href": "/docs/webhooks/signatures",
      "label": "Webhook signatures"
    },
    {
      "href": "/docs/security/webhook-security",
      "label": "Webhook security"
    }
  ],
  "productLinks": [
    {
      "href": "/features/api-monitoring",
      "label": "API monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is webhook signature",
  "secondaryQueries": [],
  "status": "published",
  "owner": "glossary-editorial",
  "reviewers": [
    "product",
    "engineering",
    "security"
  ],
  "lastReviewedAt": "2026-07-17",
  "nextReviewDue": "2026-10-17",
  "contentVersion": "1",
  "productVersion": "1.0",
  "technicalStandardRefs": [],
  "featured": true,
  "foundational": false,
  "llmInclude": true,
  "indexable": true,
  "canonical": true,
  "redirects": [],
  "cta": "documentation",
  "requiresLegalReview": false,
  "requiresSecurityReview": true,
  "searchBoost": 0,
  "title": "What Is Webhook signature? Definition and Examples",
  "description": "Webhook signature: a cryptographic proof that a webhook came from the expected sender. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Webhook signature matters because teams need a precise shared meaning for a cryptographic proof that a webhook came from the expected sender. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, a cryptographic proof that a webhook came from the expected sender shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of webhook signature is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around HMAC signature header on a webhook POST. When observed behavior stops matching the definition of webhook signature, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Signatures are optional decoration", body: ["That reading usually collapses distinct ideas into one slogan. Keep webhook signature tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Verify signatures before acting on webhooks. See [signatures](/docs/webhooks/signatures) and [webhook security](/docs/security/webhook-security)."],
    
  }),
  faqs: [{ question: "What happens if I skip signature checks?", answer: "Anyone who discovers the URL can post forged events. Always verify signatures with your signing secret." }, { question: "Is HTTPS enough without signatures?", answer: "HTTPS protects the channel. Signatures prove the sender. You want both." }],
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "hmac",
  "term": "HMAC",
  "slug": "hmac",
  "shortDefinition": "HMAC is a keyed hash used to authenticate a message such as a webhook body.",
  "shortAnswer": "HMAC describes a keyed hash used to authenticate a message such as a webhook body. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "apis-webhooks",
  "secondaryCategories": [],
  "acronym": "HMAC",
  "expandedName": "Hash-based Message Authentication Code",
  "synonyms": [],
  "relatedTerms": [
    "webhook-signature",
    "webhook"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "api-monitoring",
    "webhooks"
  ],
  "documentationLinks": [],
  "productLinks": [
    {
      "href": "/features/api-monitoring",
      "label": "API monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is hmac",
  "secondaryQueries": [],
  "status": "published",
  "owner": "glossary-editorial",
  "reviewers": [
    "product",
    "engineering",
    "security"
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
  "cta": "documentation",
  "requiresLegalReview": false,
  "requiresSecurityReview": true,
  "searchBoost": 0,
  "title": "What Is HMAC? Definition and Examples",
  "description": "HMAC: a keyed hash used to authenticate a message such as a webhook body. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "HMAC matters because teams need a precise shared meaning for a keyed hash used to authenticate a message such as a webhook body. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, a keyed hash used to authenticate a message such as a webhook body shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of hmac is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around HMAC-SHA256 over the raw webhook body. When observed behavior stops matching the definition of hmac, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "HMAC encrypts the payload so nobody can read it", body: ["That reading usually collapses distinct ideas into one slogan. Keep hmac tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["HMAC authenticates integrity and origin when used with a shared secret. It is not encryption by itself."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "webhook-retry",
  "term": "Webhook retry",
  "slug": "webhook-retry",
  "shortDefinition": "Webhook retry is sending a webhook again after the receiver failed or timed out.",
  "shortAnswer": "Webhook retry describes sending a webhook again after the receiver failed or timed out. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "apis-webhooks",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "webhook-idempotency",
    "idempotency-key",
    "alert-retry"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "api-monitoring",
    "webhooks"
  ],
  "documentationLinks": [
    {
      "href": "/docs/webhooks/retries",
      "label": "Webhook retries"
    }
  ],
  "productLinks": [
    {
      "href": "/features/api-monitoring",
      "label": "API monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is webhook retry",
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
  "title": "What Is Webhook retry? Definition and Examples",
  "description": "Webhook retry: sending a webhook again after the receiver failed or timed out. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Webhook retry matters because teams need a precise shared meaning for sending a webhook again after the receiver failed or timed out. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, sending a webhook again after the receiver failed or timed out shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of webhook retry is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around retry after the receiver returned 500. When observed behavior stops matching the definition of webhook retry, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Retries mean duplicate side effects are impossible", body: ["That reading usually collapses distinct ideas into one slogan. Keep webhook retry tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Receivers should be idempotent because retries happen. See [webhook retries](/docs/webhooks/retries)."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "webhook-idempotency",
  "term": "Webhook idempotency",
  "slug": "webhook-idempotency",
  "shortDefinition": "Webhook idempotency is designing receivers so duplicate webhook deliveries do not cause duplicate effects.",
  "shortAnswer": "Webhook idempotency describes designing receivers so duplicate webhook deliveries do not cause duplicate effects. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "apis-webhooks",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "idempotency-key",
    "webhook-retry"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "api-monitoring",
    "webhooks"
  ],
  "documentationLinks": [],
  "productLinks": [
    {
      "href": "/features/api-monitoring",
      "label": "API monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is webhook idempotency",
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
  "title": "What Is Webhook idempotency? Definition and Examples",
  "description": "Webhook idempotency: designing receivers so duplicate webhook deliveries do not cause duplicate effects. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Webhook idempotency matters because teams need a precise shared meaning for designing receivers so duplicate webhook deliveries do not cause duplicate effects. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, designing receivers so duplicate webhook deliveries do not cause duplicate effects shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of webhook idempotency is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around ignoring a second incident.opened with the same id. When observed behavior stops matching the definition of webhook idempotency, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Idempotency is only a Fajita setting on the sender", body: ["That reading usually collapses distinct ideas into one slogan. Keep webhook idempotency tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Build receivers to key on event ids. Retries will occur on real networks."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "idempotency-key",
  "term": "Idempotency key",
  "slug": "idempotency-key",
  "shortDefinition": "Idempotency key is a unique key that lets a system recognize and ignore duplicate requests.",
  "shortAnswer": "Idempotency key describes a unique key that lets a system recognize and ignore duplicate requests. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "apis-webhooks",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "webhook-idempotency",
    "webhook-retry"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "api-monitoring",
    "webhooks"
  ],
  "documentationLinks": [],
  "productLinks": [
    {
      "href": "/features/api-monitoring",
      "label": "API monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is idempotency key",
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
  "title": "What Is Idempotency key? Definition and Examples",
  "description": "Idempotency key: a unique key that lets a system recognize and ignore duplicate requests. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Idempotency key matters because teams need a precise shared meaning for a unique key that lets a system recognize and ignore duplicate requests. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, a unique key that lets a system recognize and ignore duplicate requests shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of idempotency key is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around Idempotency-Key header on a POST. When observed behavior stops matching the definition of idempotency key, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Keys make every request slower forever", body: ["That reading usually collapses distinct ideas into one slogan. Keep idempotency key tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Use keys for safely retryable writes and event processing."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "http-timeout",
  "term": "HTTP timeout",
  "slug": "http-timeout",
  "shortDefinition": "HTTP timeout is the client-side limit on how long to wait for an HTTP response.",
  "shortAnswer": "HTTP timeout describes the client-side limit on how long to wait for an HTTP response. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "apis-webhooks",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "timeout",
    "api-monitoring",
    "latency"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "api-monitoring",
    "webhooks"
  ],
  "documentationLinks": [],
  "productLinks": [
    {
      "href": "/features/api-monitoring",
      "label": "API monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is http timeout",
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
  "title": "What Is HTTP timeout? Definition and Examples",
  "description": "HTTP timeout: the client-side limit on how long to wait for an HTTP response. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "HTTP timeout matters because teams need a precise shared meaning for the client-side limit on how long to wait for an HTTP response. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, the client-side limit on how long to wait for an HTTP response shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of http timeout is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around 10 second timeout on a health check. When observed behavior stops matching the definition of http timeout, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Timeouts are server status codes", body: ["That reading usually collapses distinct ideas into one slogan. Keep http timeout tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Timeouts are client decisions. They appear as failed checks when exceeded."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "http-redirect",
  "term": "HTTP redirect",
  "slug": "http-redirect",
  "shortDefinition": "HTTP redirect is an HTTP response that tells the client to continue at another URL.",
  "shortAnswer": "HTTP redirect describes an HTTP response that tells the client to continue at another URL. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "apis-webhooks",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "http-status-code",
    "https-monitoring"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "api-monitoring",
    "webhooks"
  ],
  "documentationLinks": [],
  "productLinks": [
    {
      "href": "/features/api-monitoring",
      "label": "API monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is http redirect",
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
  "title": "What Is HTTP redirect? Definition and Examples",
  "description": "HTTP redirect: an HTTP response that tells the client to continue at another URL. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "HTTP redirect matters because teams need a precise shared meaning for an HTTP response that tells the client to continue at another URL. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, an HTTP response that tells the client to continue at another URL shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of http redirect is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around 301 from http://example.com to https://example.com. When observed behavior stops matching the definition of http redirect, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Redirects always mean the monitor should fail", body: ["That reading usually collapses distinct ideas into one slogan. Keep http redirect tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Decide whether monitors should follow redirects based on what customer success means."],
    
  }),
  faqs: undefined,
  formula: undefined,
})
];
