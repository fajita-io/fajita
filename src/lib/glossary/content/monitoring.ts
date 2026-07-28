import { h2, p, table } from "@/lib/docs/blocks";
import { buildTermBody } from "@/lib/glossary/authoring";
import { defineTerm, type GlossaryTerm } from "@/lib/glossary/types";

export const monitoringTerms: GlossaryTerm[] = [
defineTerm({
  meta: {
  "id": "uptime-monitoring",
  "term": "Uptime monitoring",
  "slug": "uptime-monitoring",
  "shortDefinition": "Uptime monitoring repeatedly checks whether a website, API, or service is reachable and behaving as expected from outside the system.",
  "shortAnswer": "Uptime monitoring is the repeated process of checking whether a website, API, or service is reachable and behaving as expected. Checks run on a schedule from external locations, evaluate responses against rules you define, and raise a signal when the service fails those rules so your team can respond before customers report the problem.",
  "category": "monitoring",
  "secondaryCategories": [],
  "synonyms": [
    "uptime checker",
    "availability monitoring"
  ],
  "relatedTerms": [
    "website-monitoring",
    "api-monitoring",
    "monitoring-interval",
    "retry",
    "incident-verification",
    "uptime-percentage"
  ],
  "broaderTerms": [],
  "narrowerTerms": [
    "website-monitoring",
    "api-monitoring",
    "ssl-certificate-monitoring"
  ],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "uptime-monitoring",
    "website-monitoring",
    "api-monitoring"
  ],
  "documentationLinks": [
    {
      "href": "/docs/getting-started/create-your-first-monitor",
      "label": "Create your first monitor"
    },
    {
      "href": "/docs/monitors/website-monitoring",
      "label": "Website monitoring"
    }
  ],
  "productLinks": [
    {
      "href": "/features/uptime-monitoring",
      "label": "Uptime monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is uptime monitoring",
  "secondaryQueries": [
    "uptime monitoring definition",
    "how uptime monitoring works"
  ],
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
  "cta": "monitor",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 3,
  "title": "What Is Uptime Monitoring? Definition and Examples",
  "description": "Uptime monitoring checks websites and APIs on a schedule so teams learn about failures before customers do.",
  "noindex": false,
  "deprecated": false,
  "cluster": "uptime"
},
  body: buildTermBody({
    whyItMatters: [
      "Software can look healthy on a developer's laptop and still fail for customers in another region. Uptime monitoring watches the service the way a user would: from outside the private network, on a recurring schedule.",
      "When a check fails, the goal is not noise. The goal is a verified signal that something important stopped working, so the team can investigate while the blast radius is still small.",
    ],
    howItWorks: [
      "A monitor stores a target such as `https://api.example.com/health`, a schedule, and success rules. At each interval the checker sends a request, records timing and status, and compares the result to those rules.",
      "Success rules often include HTTP status ranges, maximum response time, required keywords, or JSON fields. A single failure may trigger retries or confirmation from another region before an incident opens.",
      "History accumulates as a timeline of successes and failures. That history powers uptime calculations, incident evidence, and public status pages when you choose to share them.",
    ],
    example: [
      "A SaaS team monitors `https://api.example.com/health` every minute. The assertion requires status `200` and a JSON field `status` equal to `ok`. When the endpoint returns `503` twice and a second region confirms the failure, incident verification begins and the on-call channel receives an alert.",
    ],
    misconception: {
      title: "One failed check means the site is down",
      body: ["A single failed check can be a brief network blip, a cold start, or a regional path problem. Serious monitoring confirms failures before treating them as outages, which reduces false positives without hiding real downtime."],
    },
    commonlyConfused: {
      title: "Uptime monitoring versus observability",
      body: ["Uptime monitoring answers whether the service is reachable and meeting external expectations. Observability usually means deep internal telemetry such as logs, metrics, and traces. Both matter. They solve different jobs."],
    },
    fajita: ["Fajita can check websites and APIs on a recurring schedule, evaluate status-code, response-time, keyword, and JSON-path assertions, then begin [incident verification](/docs/incidents/verification) when a scheduled check fails.", "You can [create your first monitor](/docs/getting-started/create-your-first-monitor) and test it before monitoring begins."],
    checklist: ["Pick the URL or endpoint customers depend on.", "Set an interval that matches how quickly you need to know.", "Define assertions that match real success, not only HTTP 200.", "Confirm failures before paging people when false positives are costly.", "Connect an alert channel before you need it in an emergency."],
    
  }),
  faqs: [{ question: "How often should uptime checks run?", answer: "Common intervals range from thirty seconds to five minutes for customer-facing endpoints. Faster intervals detect problems sooner and use more check capacity. Match the interval to how quickly your team can respond." },
    { question: "Does one failed check mean a site is down?", answer: "Not always. Many teams retry or confirm from another location before opening an incident so brief network glitches do not become false outages." },
    { question: "Is uptime monitoring the same as performance monitoring?", answer: "They overlap. Uptime monitoring focuses on reachability and expected behavior. Performance monitoring focuses on how fast responses arrive. Response-time thresholds connect the two." },
    { question: "Can uptime monitoring check an authenticated API?", answer: "Yes, when the monitor can supply headers or other credentials securely. Never put long-lived secrets in a public status page or a shared screenshot." }],
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "website-monitoring",
  "term": "Website monitoring",
  "slug": "website-monitoring",
  "shortDefinition": "Website monitoring checks a public web page or site on a schedule to confirm it responds successfully for visitors.",
  "shortAnswer": "Website monitoring is uptime monitoring focused on web pages people open in a browser. A checker requests a URL on a schedule, evaluates whether the response looks healthy, and alerts the team when the page fails those checks so visitors are not the first people to notice an outage.",
  "category": "monitoring",
  "secondaryCategories": [],
  "synonyms": [
    "website checker",
    "website uptime monitoring"
  ],
  "relatedTerms": [
    "uptime-monitoring",
    "http-monitoring",
    "https-monitoring",
    "health-check",
    "status-page"
  ],
  "broaderTerms": [
    "uptime-monitoring"
  ],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "website-monitoring"
  ],
  "documentationLinks": [
    {
      "href": "/docs/monitors/website-monitoring",
      "label": "Website monitoring"
    }
  ],
  "productLinks": [
    {
      "href": "/features/uptime-monitoring",
      "label": "Uptime monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is website monitoring",
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
  "title": "What Is Website Monitoring? How Site Checks Work",
  "description": "Website monitoring checks public pages on a schedule and alerts teams when visitors would see a failure.",
  "noindex": false,
  "deprecated": false,
  "cluster": "uptime"
},
  body: buildTermBody({
    whyItMatters: [
      "Marketing sites, docs, and app shells are often the first place customers look. If the page returns an error or times out, trust erodes even when backend APIs are fine.",
      "Website monitoring gives the team an external witness for the pages that represent the product in public.",
    ],
    howItWorks: [
      "The monitor requests a URL such as `https://www.example.com` using HTTPS. It records status code, timing, and optionally whether a keyword appears in the HTML.",
      "Redirects, TLS problems, and DNS failures all surface as failed checks. Keyword assertions catch soft failures where a page returns 200 with an error message in the body.",
    ],
    example: [
      "An agency monitors each customer marketing site every two minutes. A keyword assertion looks for the customer brand name in the HTML. When a deploy ships a broken theme and the keyword disappears, the agency is alerted before the customer calls.",
    ],
    misconception: {
      title: "A 200 status always means the site is fine",
      body: ["Error pages, maintenance placeholders, and application failures can still return HTTP 200. Pair status checks with keyword or content assertions when the HTML matters."],
    },
    commonlyConfused: undefined,
    fajita: ["Fajita website monitors check availability, status codes, and response time. See [website monitoring](/docs/monitors/website-monitoring) for setup steps."],
    checklist: undefined,
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "api-monitoring",
  "term": "API monitoring",
  "slug": "api-monitoring",
  "shortDefinition": "API monitoring checks HTTP endpoints on a schedule to confirm status codes, timing, and response content still match expectations.",
  "shortAnswer": "API monitoring is the practice of sending scheduled HTTP requests to application endpoints and verifying that responses still meet agreed rules. Teams watch status codes, latency, headers, and JSON fields so broken backends surface through monitoring instead of through angry customer tickets.",
  "category": "monitoring",
  "secondaryCategories": [],
  "synonyms": [
    "api uptime monitoring",
    "api availability monitoring"
  ],
  "relatedTerms": [
    "uptime-monitoring",
    "endpoint-monitoring",
    "api-endpoint",
    "json-path",
    "http-status-code",
    "api-health-check"
  ],
  "broaderTerms": [
    "uptime-monitoring"
  ],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "api-monitoring"
  ],
  "documentationLinks": [
    {
      "href": "/docs/monitors/api-monitoring",
      "label": "API monitoring"
    }
  ],
  "productLinks": [
    {
      "href": "/features/api-monitoring",
      "label": "API monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is API monitoring",
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
  "cta": "monitor",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is API Monitoring? How Endpoint Checks Work",
  "description": "API monitoring verifies HTTP endpoints with status, timing, and content assertions on a schedule.",
  "noindex": false,
  "deprecated": false,
  "cluster": "uptime"
},
  body: buildTermBody({
    whyItMatters: [
      "Modern products expose most customer value through APIs. A homepage can stay up while checkout, auth, or billing APIs fail. API monitoring watches those contracts directly.",
    ],
    howItWorks: [
      "You choose a method, URL, headers, and assertions. Each interval the checker performs the request and evaluates rules such as status `2xx`, response time under 800ms, and a JSON path returning an expected value.",
      "Authenticated endpoints may require carefully stored headers. Rotate secrets the same way you rotate other production credentials.",
    ],
    example: [
      "A checkout team monitors `POST https://api.example.com/v1/checkout/quote` in a safe sandbox path that creates no charges. Assertions require status `200` and JSON path `$.currency` equal to `USD`. When the path starts returning `500`, verification opens an incident before shoppers abandon carts.",
    ],
    misconception: {
      title: "Hitting any URL is enough",
      body: ["A generic homepage check will not catch a broken `/v1/payments` route. Monitor the endpoints that represent revenue and login, not only the marketing site."],
    },
    commonlyConfused: undefined,
    fajita: ["Fajita API monitors support HTTP methods, status assertions, response-time thresholds, keyword and JSON assertions, and request headers. Start with [API monitoring](/docs/monitors/api-monitoring)."],
    checklist: undefined,
    
  }),
  faqs: [{ question: "Can API monitoring replace integration tests?", answer: "No. Monitoring watches live behavior over time. Integration tests verify code before release. Use both." },
    { question: "Should monitors call production write endpoints?", answer: "Prefer safe read or sandbox paths. Avoid creating real charges, emails, or irreversible side effects from a monitor." }],
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "endpoint-monitoring",
  "term": "Endpoint monitoring",
  "slug": "endpoint-monitoring",
  "shortDefinition": "Endpoint monitoring is watching a specific URL or route. Teams use the term to keep checks, alerts, and reviews precise.",
  "shortAnswer": "Endpoint monitoring describes watching a specific URL or route. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "monitoring",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "uptime-monitoring",
    "api-monitoring",
    "monitor",
    "incident-verification"
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
      "href": "/docs/getting-started/create-your-first-monitor",
      "label": "Create your first monitor"
    }
  ],
  "productLinks": [
    {
      "href": "/features/uptime-monitoring",
      "label": "Uptime monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is endpoint monitoring",
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
  "cta": "monitor",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Endpoint monitoring? Definition and Examples",
  "description": "Endpoint monitoring: watching a specific URL or route. Clear definition for software reliability teams.",
  "noindex": false,
  "deprecated": false,
  "cluster": "uptime"
},
  body: buildTermBody({
    whyItMatters: [
      "Endpoint monitoring matters because teams need a shared, precise meaning for watching a specific URL or route. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, watching a specific URL or route shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of endpoint monitoring is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team running checks against https://api.example.com/v1/session. When the observed behavior stops matching the definition of endpoint monitoring, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: {
      title: "Endpoint monitoring is only for public websites",
      body: ["That reading usually collapses distinct ideas into one slogan. Keep endpoint monitoring tied to observable behavior so the definition stays useful under pressure."],
    },
    commonlyConfused: undefined,
    fajita: ["Fajita monitors individual API and website endpoints with assertions. See [API monitoring](/docs/monitors/api-monitoring)."],
    checklist: undefined,
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "http-monitoring",
  "term": "HTTP monitoring",
  "slug": "http-monitoring",
  "shortDefinition": "HTTP monitoring is checking services over HTTP. Teams use the term to keep checks, alerts, and reviews precise.",
  "shortAnswer": "HTTP monitoring describes checking services over HTTP. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "monitoring",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "uptime-monitoring",
    "api-monitoring",
    "monitor",
    "incident-verification"
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
      "href": "/docs/getting-started/create-your-first-monitor",
      "label": "Create your first monitor"
    }
  ],
  "productLinks": [
    {
      "href": "/features/uptime-monitoring",
      "label": "Uptime monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is http monitoring",
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
  "cta": "monitor",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is HTTP monitoring? Definition and Examples",
  "description": "HTTP monitoring: checking services over HTTP. Clear definition for software reliability teams.",
  "noindex": false,
  "deprecated": false,
  "cluster": "uptime"
},
  body: buildTermBody({
    whyItMatters: [
      "HTTP monitoring matters because teams need a shared, precise meaning for checking services over HTTP. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, checking services over HTTP shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of http monitoring is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team running checks against http://status.example.com/health. When the observed behavior stops matching the definition of http monitoring, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: {
      title: "HTTP monitoring always means the connection is encrypted",
      body: ["That reading usually collapses distinct ideas into one slogan. Keep http monitoring tied to observable behavior so the definition stays useful under pressure."],
    },
    commonlyConfused: undefined,
    fajita: ["Fajita primarily monitors HTTPS targets; HTTP may appear during redirects or legacy endpoints. See [website monitoring](/docs/monitors/website-monitoring)."],
    checklist: undefined,
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "https-monitoring",
  "term": "HTTPS monitoring",
  "slug": "https-monitoring",
  "shortDefinition": "HTTPS monitoring is checking services over HTTPS with TLS. Teams use the term to keep checks, alerts, and reviews precise.",
  "shortAnswer": "HTTPS monitoring describes checking services over HTTPS with TLS. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "monitoring",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "uptime-monitoring",
    "api-monitoring",
    "monitor",
    "incident-verification"
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
      "href": "/docs/getting-started/create-your-first-monitor",
      "label": "Create your first monitor"
    }
  ],
  "productLinks": [
    {
      "href": "/features/uptime-monitoring",
      "label": "Uptime monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is https monitoring",
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
  "cta": "monitor",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is HTTPS monitoring? Definition and Examples",
  "description": "HTTPS monitoring: checking services over HTTPS with TLS. Clear definition for software reliability teams.",
  "noindex": false,
  "deprecated": false,
  "cluster": "uptime"
},
  body: buildTermBody({
    whyItMatters: [
      "HTTPS monitoring matters because teams need a shared, precise meaning for checking services over HTTPS with TLS. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, checking services over HTTPS with TLS shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of https monitoring is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team running checks against https://www.example.com. When the observed behavior stops matching the definition of https monitoring, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: {
      title: "HTTPS monitoring replaces certificate monitoring",
      body: ["That reading usually collapses distinct ideas into one slogan. Keep https monitoring tied to observable behavior so the definition stays useful under pressure."],
    },
    commonlyConfused: undefined,
    fajita: ["Fajita website and API monitors use HTTPS targets and can pair with [SSL monitoring](/docs/monitors/ssl-monitoring)."],
    checklist: undefined,
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "external-monitoring",
  "term": "External monitoring",
  "slug": "external-monitoring",
  "shortDefinition": "External monitoring is checking a service from outside its private network. Teams use the term to keep checks, alerts, and reviews precise.",
  "shortAnswer": "External monitoring describes checking a service from outside its private network. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "monitoring",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "uptime-monitoring",
    "api-monitoring",
    "monitor",
    "incident-verification"
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
      "href": "/docs/getting-started/create-your-first-monitor",
      "label": "Create your first monitor"
    }
  ],
  "productLinks": [
    {
      "href": "/features/uptime-monitoring",
      "label": "Uptime monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is external monitoring",
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
  "cta": "monitor",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is External monitoring? Definition and Examples",
  "description": "External monitoring: checking a service from outside its private network. Clear definition for software reliability teams.",
  "noindex": false,
  "deprecated": false,
  "cluster": "uptime"
},
  body: buildTermBody({
    whyItMatters: [
      "External monitoring matters because teams need a shared, precise meaning for checking a service from outside its private network. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, checking a service from outside its private network shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of external monitoring is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team running checks against https://app.example.com/login. When the observed behavior stops matching the definition of external monitoring, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: {
      title: "External monitoring sees everything inside the VPC",
      body: ["That reading usually collapses distinct ideas into one slogan. Keep external monitoring tied to observable behavior so the definition stays useful under pressure."],
    },
    commonlyConfused: undefined,
    fajita: ["Fajita checks targets from outside your network. It does not install agents inside private networks."],
    checklist: undefined,
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "service-monitoring",
  "term": "Service monitoring",
  "slug": "service-monitoring",
  "shortDefinition": "Service monitoring is watching a customer-facing service for health. Teams use the term to keep checks, alerts, and reviews precise.",
  "shortAnswer": "Service monitoring describes watching a customer-facing service for health. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "monitoring",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "uptime-monitoring",
    "api-monitoring",
    "monitor",
    "incident-verification"
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
      "href": "/docs/getting-started/create-your-first-monitor",
      "label": "Create your first monitor"
    }
  ],
  "productLinks": [
    {
      "href": "/features/uptime-monitoring",
      "label": "Uptime monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is service monitoring",
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
  "cta": "monitor",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Service monitoring? Definition and Examples",
  "description": "Service monitoring: watching a customer-facing service for health. Clear definition for software reliability teams.",
  "noindex": false,
  "deprecated": false,
  "cluster": "uptime"
},
  body: buildTermBody({
    whyItMatters: [
      "Service monitoring matters because teams need a shared, precise meaning for watching a customer-facing service for health. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, watching a customer-facing service for health shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of service monitoring is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team running checks against https://api.example.com/health. When the observed behavior stops matching the definition of service monitoring, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: {
      title: "Service monitoring requires a full observability stack",
      body: ["That reading usually collapses distinct ideas into one slogan. Keep service monitoring tied to observable behavior so the definition stays useful under pressure."],
    },
    commonlyConfused: undefined,
    fajita: ["Fajita focuses on external uptime, certificates, and heartbeats rather than host agents."],
    checklist: undefined,
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "availability-monitoring",
  "term": "Availability monitoring",
  "slug": "availability-monitoring",
  "shortDefinition": "Availability monitoring is measuring whether a service is usable when expected. Teams use the term to keep checks, alerts, and reviews precise.",
  "shortAnswer": "Availability monitoring describes measuring whether a service is usable when expected. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "monitoring",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "uptime-monitoring",
    "api-monitoring",
    "monitor",
    "incident-verification"
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
      "href": "/docs/getting-started/create-your-first-monitor",
      "label": "Create your first monitor"
    }
  ],
  "productLinks": [
    {
      "href": "/features/uptime-monitoring",
      "label": "Uptime monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is availability monitoring",
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
  "cta": "monitor",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Availability monitoring? Definition and Examples",
  "description": "Availability monitoring: measuring whether a service is usable when expected. Clear definition for software reliability teams.",
  "noindex": false,
  "deprecated": false,
  "cluster": "uptime"
},
  body: buildTermBody({
    whyItMatters: [
      "Availability monitoring matters because teams need a shared, precise meaning for measuring whether a service is usable when expected. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, measuring whether a service is usable when expected shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of availability monitoring is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team running checks against https://api.example.com/ready. When the observed behavior stops matching the definition of availability monitoring, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: {
      title: "Availability monitoring is identical to latency monitoring",
      body: ["That reading usually collapses distinct ideas into one slogan. Keep availability monitoring tied to observable behavior so the definition stays useful under pressure."],
    },
    commonlyConfused: undefined,
    fajita: ["Fajita availability signals come from scheduled checks and incident state. See [uptime monitoring](/features/uptime-monitoring)."],
    checklist: undefined,
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "synthetic-monitoring",
  "term": "Synthetic monitoring",
  "slug": "synthetic-monitoring",
  "shortDefinition": "Synthetic monitoring is running scripted checks that simulate user or client requests. Teams use the term to keep checks, alerts, and reviews precise.",
  "shortAnswer": "Synthetic monitoring describes running scripted checks that simulate user or client requests. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "monitoring",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "uptime-monitoring",
    "api-monitoring",
    "monitor",
    "incident-verification"
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
      "href": "/docs/getting-started/create-your-first-monitor",
      "label": "Create your first monitor"
    }
  ],
  "productLinks": [
    {
      "href": "/features/uptime-monitoring",
      "label": "Uptime monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is synthetic monitoring",
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
  "cta": "monitor",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Synthetic monitoring? Definition and Examples",
  "description": "Synthetic monitoring: running scripted checks that simulate user or client requests. Clear definition for software reliability teams.",
  "noindex": false,
  "deprecated": false,
  "cluster": "uptime"
},
  body: buildTermBody({
    whyItMatters: [
      "Synthetic monitoring matters because teams need a shared, precise meaning for running scripted checks that simulate user or client requests. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, running scripted checks that simulate user or client requests shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of synthetic monitoring is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team running checks against https://api.example.com/v1/cart. When the observed behavior stops matching the definition of synthetic monitoring, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: {
      title: "Synthetic monitoring is the same as real-user monitoring",
      body: ["That reading usually collapses distinct ideas into one slogan. Keep synthetic monitoring tied to observable behavior so the definition stays useful under pressure."],
    },
    commonlyConfused: undefined,
    fajita: ["Fajita runs synthetic HTTP checks on a schedule. It does not capture real-user browser sessions."],
    checklist: undefined,
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "monitor",
  "term": "Monitor",
  "slug": "monitor",
  "shortDefinition": "Monitor is a configured check that runs on a schedule. Teams use the term to keep checks, alerts, and reviews precise.",
  "shortAnswer": "Monitor describes a configured check that runs on a schedule. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "monitoring",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "uptime-monitoring",
    "api-monitoring",
    "incident-verification"
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
      "href": "/docs/getting-started/create-your-first-monitor",
      "label": "Create your first monitor"
    }
  ],
  "productLinks": [
    {
      "href": "/features/uptime-monitoring",
      "label": "Uptime monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is monitor",
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
  "cta": "monitor",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Monitor? Definition and Examples",
  "description": "Monitor: a configured check that runs on a schedule. Clear definition for software reliability teams.",
  "noindex": false,
  "deprecated": false,
  "cluster": "uptime"
},
  body: buildTermBody({
    whyItMatters: [
      "Monitor matters because teams need a shared, precise meaning for a configured check that runs on a schedule. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, a configured check that runs on a schedule shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of monitor is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team running checks against https://api.example.com/health. When the observed behavior stops matching the definition of monitor, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: {
      title: "A monitor is the same thing as an incident",
      body: ["That reading usually collapses distinct ideas into one slogan. Keep monitor tied to observable behavior so the definition stays useful under pressure."],
    },
    commonlyConfused: undefined,
    fajita: ["In Fajita, a monitor is the configured check. Incidents are opened when verified failures continue. Start with [create your first monitor](/docs/getting-started/create-your-first-monitor)."],
    checklist: undefined,
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "scheduled-check",
  "term": "Scheduled check",
  "slug": "scheduled-check",
  "shortDefinition": "Scheduled check is a single execution of a monitor on its interval. Teams use the term to keep checks, alerts, and reviews precise.",
  "shortAnswer": "Scheduled check describes a single execution of a monitor on its interval. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "monitoring",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "uptime-monitoring",
    "api-monitoring",
    "monitor",
    "incident-verification"
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
      "href": "/docs/getting-started/create-your-first-monitor",
      "label": "Create your first monitor"
    }
  ],
  "productLinks": [
    {
      "href": "/features/uptime-monitoring",
      "label": "Uptime monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is scheduled check",
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
  "cta": "monitor",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Scheduled check? Definition and Examples",
  "description": "Scheduled check: a single execution of a monitor on its interval. Clear definition for software reliability teams.",
  "noindex": false,
  "deprecated": false,
  "cluster": "uptime"
},
  body: buildTermBody({
    whyItMatters: [
      "Scheduled check matters because teams need a shared, precise meaning for a single execution of a monitor on its interval. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, a single execution of a monitor on its interval shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of scheduled check is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team running checks against https://api.example.com/health. When the observed behavior stops matching the definition of scheduled check, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: {
      title: "A scheduled check is a manual test you click",
      body: ["That reading usually collapses distinct ideas into one slogan. Keep scheduled check tied to observable behavior so the definition stays useful under pressure."],
    },
    commonlyConfused: undefined,
    fajita: ["Fajita records each scheduled check in monitor history. See [check intervals](/docs/monitors/check-intervals)."],
    checklist: undefined,
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "manual-check",
  "term": "Manual check",
  "slug": "manual-check",
  "shortDefinition": "Manual check is an on-demand test run outside the normal schedule. Teams use the term to keep checks, alerts, and reviews precise.",
  "shortAnswer": "Manual check describes an on-demand test run outside the normal schedule. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "monitoring",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "uptime-monitoring",
    "api-monitoring",
    "monitor",
    "incident-verification"
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
      "href": "/docs/getting-started/create-your-first-monitor",
      "label": "Create your first monitor"
    }
  ],
  "productLinks": [
    {
      "href": "/features/uptime-monitoring",
      "label": "Uptime monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is manual check",
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
  "cta": "monitor",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Manual check? Definition and Examples",
  "description": "Manual check: an on-demand test run outside the normal schedule. Clear definition for software reliability teams.",
  "noindex": false,
  "deprecated": false,
  "cluster": "uptime"
},
  body: buildTermBody({
    whyItMatters: [
      "Manual check matters because teams need a shared, precise meaning for an on-demand test run outside the normal schedule. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, an on-demand test run outside the normal schedule shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of manual check is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team running checks against https://api.example.com/health. When the observed behavior stops matching the definition of manual check, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: {
      title: "Manual checks replace scheduled monitoring",
      body: ["That reading usually collapses distinct ideas into one slogan. Keep manual check tied to observable behavior so the definition stays useful under pressure."],
    },
    commonlyConfused: undefined,
    fajita: ["Fajita lets you test a monitor before save and run manual checks later for diagnosis."],
    checklist: undefined,
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "monitoring-interval",
  "term": "Monitoring interval",
  "slug": "monitoring-interval",
  "shortDefinition": "Monitoring interval is how often a monitor runs its scheduled check. Teams use the term to keep checks, alerts, and reviews precise.",
  "shortAnswer": "Monitoring interval describes how often a monitor runs its scheduled check. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "monitoring",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "uptime-monitoring",
    "api-monitoring",
    "monitor",
    "incident-verification"
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
      "href": "/docs/getting-started/create-your-first-monitor",
      "label": "Create your first monitor"
    }
  ],
  "productLinks": [
    {
      "href": "/features/uptime-monitoring",
      "label": "Uptime monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is monitoring interval",
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
  "cta": "monitor",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Monitoring interval? Definition and Examples",
  "description": "Monitoring interval: how often a monitor runs its scheduled check. Clear definition for software reliability teams.",
  "noindex": false,
  "deprecated": false,
  "cluster": "uptime"
},
  body: buildTermBody({
    whyItMatters: [
      "Monitoring interval matters because teams need a shared, precise meaning for how often a monitor runs its scheduled check. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, how often a monitor runs its scheduled check shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of monitoring interval is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team running checks against every 60 seconds against https://api.example.com/health. When the observed behavior stops matching the definition of monitoring interval, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: {
      title: "Faster intervals always mean better reliability",
      body: ["That reading usually collapses distinct ideas into one slogan. Keep monitoring interval tied to observable behavior so the definition stays useful under pressure."],
    },
    commonlyConfused: undefined,
    fajita: ["Choose intervals in Fajita based on response needs and plan limits. See [check intervals](/docs/monitors/check-intervals)."],
    checklist: undefined,
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "monitoring-region",
  "term": "Monitoring region",
  "slug": "monitoring-region",
  "shortDefinition": "Monitoring region is the geographic or network location that runs a check. Teams use the term to keep checks, alerts, and reviews precise.",
  "shortAnswer": "Monitoring region describes the geographic or network location that runs a check. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "monitoring",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "uptime-monitoring",
    "api-monitoring",
    "monitor",
    "incident-verification"
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
      "href": "/docs/getting-started/create-your-first-monitor",
      "label": "Create your first monitor"
    }
  ],
  "productLinks": [
    {
      "href": "/features/uptime-monitoring",
      "label": "Uptime monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is monitoring region",
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
  "cta": "monitor",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Monitoring region? Definition and Examples",
  "description": "Monitoring region: the geographic or network location that runs a check. Clear definition for software reliability teams.",
  "noindex": false,
  "deprecated": false,
  "cluster": "uptime"
},
  body: buildTermBody({
    whyItMatters: [
      "Monitoring region matters because teams need a shared, precise meaning for the geographic or network location that runs a check. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, the geographic or network location that runs a check shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of monitoring region is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team running checks against a second region confirming https://api.example.com/health. When the observed behavior stops matching the definition of monitoring region, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: {
      title: "One region is always enough for global products",
      body: ["That reading usually collapses distinct ideas into one slogan. Keep monitoring region tied to observable behavior so the definition stays useful under pressure."],
    },
    commonlyConfused: undefined,
    fajita: ["Fajita can use additional locations during [incident verification](/docs/incidents/verification) to reduce false positives."],
    checklist: undefined,
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "monitoring-history",
  "term": "Monitoring history",
  "slug": "monitoring-history",
  "shortDefinition": "Monitoring history is the stored record of check results over time. Teams use the term to keep checks, alerts, and reviews precise.",
  "shortAnswer": "Monitoring history describes the stored record of check results over time. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "monitoring",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "uptime-monitoring",
    "api-monitoring",
    "monitor",
    "incident-verification"
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
      "href": "/docs/getting-started/create-your-first-monitor",
      "label": "Create your first monitor"
    }
  ],
  "productLinks": [
    {
      "href": "/features/uptime-monitoring",
      "label": "Uptime monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is monitoring history",
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
  "cta": "monitor",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Monitoring history? Definition and Examples",
  "description": "Monitoring history: the stored record of check results over time. Clear definition for software reliability teams.",
  "noindex": false,
  "deprecated": false,
  "cluster": "uptime"
},
  body: buildTermBody({
    whyItMatters: [
      "Monitoring history matters because teams need a shared, precise meaning for the stored record of check results over time. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, the stored record of check results over time shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of monitoring history is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team running checks against a week of checks for https://api.example.com/health. When the observed behavior stops matching the definition of monitoring history, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: {
      title: "Monitoring history is only for public status pages",
      body: ["That reading usually collapses distinct ideas into one slogan. Keep monitoring history tied to observable behavior so the definition stays useful under pressure."],
    },
    commonlyConfused: undefined,
    fajita: ["Fajita stores check history for diagnosis, uptime views, and incident evidence."],
    checklist: undefined,
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "health-endpoint",
  "term": "Health endpoint",
  "slug": "health-endpoint",
  "shortDefinition": "Health endpoint is a dedicated URL that reports whether a service is ready to work. Teams use the term to keep checks, alerts, and reviews precise.",
  "shortAnswer": "Health endpoint describes a dedicated URL that reports whether a service is ready to work. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "monitoring",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "uptime-monitoring",
    "api-monitoring",
    "monitor",
    "incident-verification"
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
      "href": "/docs/getting-started/create-your-first-monitor",
      "label": "Create your first monitor"
    }
  ],
  "productLinks": [
    {
      "href": "/features/uptime-monitoring",
      "label": "Uptime monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is health endpoint",
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
  "cta": "monitor",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Health endpoint? Definition and Examples",
  "description": "Health endpoint: a dedicated URL that reports whether a service is ready to work. Clear definition for software reliability teams.",
  "noindex": false,
  "deprecated": false,
  "cluster": "uptime"
},
  body: buildTermBody({
    whyItMatters: [
      "Health endpoint matters because teams need a shared, precise meaning for a dedicated URL that reports whether a service is ready to work. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, a dedicated URL that reports whether a service is ready to work shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of health endpoint is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team running checks against https://api.example.com/health. When the observed behavior stops matching the definition of health endpoint, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: {
      title: "A health endpoint should run expensive database migrations",
      body: ["That reading usually collapses distinct ideas into one slogan. Keep health endpoint tied to observable behavior so the definition stays useful under pressure."],
    },
    commonlyConfused: undefined,
    fajita: ["Point a Fajita monitor at a cheap, representative health endpoint. See [API monitoring](/docs/monitors/api-monitoring)."],
    checklist: undefined,
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "health-check",
  "term": "Health check",
  "slug": "health-check",
  "shortDefinition": "Health check is a request or probe that evaluates whether a service is healthy. Teams use the term to keep checks, alerts, and reviews precise.",
  "shortAnswer": "Health check describes a request or probe that evaluates whether a service is healthy. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "monitoring",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "uptime-monitoring",
    "api-monitoring",
    "monitor",
    "incident-verification"
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
      "href": "/docs/getting-started/create-your-first-monitor",
      "label": "Create your first monitor"
    }
  ],
  "productLinks": [
    {
      "href": "/features/uptime-monitoring",
      "label": "Uptime monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is health check",
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
  "cta": "monitor",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Health check? Definition and Examples",
  "description": "Health check: a request or probe that evaluates whether a service is healthy. Clear definition for software reliability teams.",
  "noindex": false,
  "deprecated": false,
  "cluster": "uptime"
},
  body: buildTermBody({
    whyItMatters: [
      "Health check matters because teams need a shared, precise meaning for a request or probe that evaluates whether a service is healthy. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, a request or probe that evaluates whether a service is healthy shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of health check is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team running checks against https://api.example.com/health. When the observed behavior stops matching the definition of health check, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: {
      title: "Health checks only belong inside load balancers",
      body: ["That reading usually collapses distinct ideas into one slogan. Keep health check tied to observable behavior so the definition stays useful under pressure."],
    },
    commonlyConfused: undefined,
    fajita: ["External health checks in Fajita complement infrastructure probes. They answer what customers experience from the public internet."],
    checklist: undefined,
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "service-health",
  "term": "Service health",
  "slug": "service-health",
  "shortDefinition": "Service health is the overall condition of a service relative to expected behavior. Teams use the term to keep checks, alerts, and reviews precise.",
  "shortAnswer": "Service health describes the overall condition of a service relative to expected behavior. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "monitoring",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "uptime-monitoring",
    "api-monitoring",
    "monitor",
    "incident-verification"
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
      "href": "/docs/getting-started/create-your-first-monitor",
      "label": "Create your first monitor"
    }
  ],
  "productLinks": [
    {
      "href": "/features/uptime-monitoring",
      "label": "Uptime monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is service health",
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
  "cta": "monitor",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Service health? Definition and Examples",
  "description": "Service health: the overall condition of a service relative to expected behavior. Clear definition for software reliability teams.",
  "noindex": false,
  "deprecated": false,
  "cluster": "uptime"
},
  body: buildTermBody({
    whyItMatters: [
      "Service health matters because teams need a shared, precise meaning for the overall condition of a service relative to expected behavior. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, the overall condition of a service relative to expected behavior shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of service health is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team running checks against operational versus degraded for api.example.com. When the observed behavior stops matching the definition of service health, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: {
      title: "Service health is a single binary up or down bit",
      body: ["That reading usually collapses distinct ideas into one slogan. Keep service health tied to observable behavior so the definition stays useful under pressure."],
    },
    commonlyConfused: undefined,
    fajita: ["Fajita expresses health through monitor state and status-page components, including degraded and down."],
    checklist: undefined,
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "availability-check",
  "term": "Availability check",
  "slug": "availability-check",
  "shortDefinition": "Availability check is a probe that asks whether a dependency or service is available now. Teams use the term to keep checks, alerts, and reviews precise.",
  "shortAnswer": "Availability check describes a probe that asks whether a dependency or service is available now. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "monitoring",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "uptime-monitoring",
    "api-monitoring",
    "monitor",
    "incident-verification"
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
      "href": "/docs/getting-started/create-your-first-monitor",
      "label": "Create your first monitor"
    }
  ],
  "productLinks": [
    {
      "href": "/features/uptime-monitoring",
      "label": "Uptime monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is availability check",
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
  "cta": "monitor",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Availability check? Definition and Examples",
  "description": "Availability check: a probe that asks whether a dependency or service is available now. Clear definition for software reliability teams.",
  "noindex": false,
  "deprecated": false,
  "cluster": "uptime"
},
  body: buildTermBody({
    whyItMatters: [
      "Availability check matters because teams need a shared, precise meaning for a probe that asks whether a dependency or service is available now. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, a probe that asks whether a dependency or service is available now shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of availability check is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team running checks against https://api.example.com/ready. When the observed behavior stops matching the definition of availability check, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: {
      title: "Availability checks measure customer satisfaction scores",
      body: ["That reading usually collapses distinct ideas into one slogan. Keep availability check tied to observable behavior so the definition stays useful under pressure."],
    },
    commonlyConfused: undefined,
    fajita: ["Use availability checks as monitor targets in Fajita when readiness is the contract you care about."],
    checklist: undefined,
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "retry",
  "term": "Retry",
  "slug": "retry",
  "shortDefinition": "Retry is repeating a failed check or delivery attempt before escalating. Teams use the term to keep checks, alerts, and reviews precise.",
  "shortAnswer": "Retry describes repeating a failed check or delivery attempt before escalating. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "monitoring",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "uptime-monitoring",
    "api-monitoring",
    "monitor",
    "incident-verification"
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
      "href": "/docs/getting-started/create-your-first-monitor",
      "label": "Create your first monitor"
    }
  ],
  "productLinks": [
    {
      "href": "/features/uptime-monitoring",
      "label": "Uptime monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is retry",
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
  "cta": "monitor",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Retry? Definition and Examples",
  "description": "Retry: repeating a failed check or delivery attempt before escalating. Clear definition for software reliability teams.",
  "noindex": false,
  "deprecated": false,
  "cluster": "uptime"
},
  body: buildTermBody({
    whyItMatters: [
      "Retry matters because teams need a shared, precise meaning for repeating a failed check or delivery attempt before escalating. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, repeating a failed check or delivery attempt before escalating shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of retry is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team running checks against two retries before opening an incident for api.example.com. When the observed behavior stops matching the definition of retry, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: {
      title: "Retries always hide real outages",
      body: ["That reading usually collapses distinct ideas into one slogan. Keep retry tied to observable behavior so the definition stays useful under pressure."],
    },
    commonlyConfused: undefined,
    fajita: ["Fajita can retry failed checks before incident verification. See [retries](/docs/monitors/retries)."],
    checklist: undefined,
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "timeout",
  "term": "Timeout",
  "slug": "timeout",
  "shortDefinition": "Timeout is the maximum time allowed for a request or check before it fails. Teams use the term to keep checks, alerts, and reviews precise.",
  "shortAnswer": "Timeout describes the maximum time allowed for a request or check before it fails. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "monitoring",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "uptime-monitoring",
    "api-monitoring",
    "monitor",
    "incident-verification"
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
      "href": "/docs/getting-started/create-your-first-monitor",
      "label": "Create your first monitor"
    }
  ],
  "productLinks": [
    {
      "href": "/features/uptime-monitoring",
      "label": "Uptime monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is timeout",
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
  "cta": "monitor",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Timeout? Definition and Examples",
  "description": "Timeout: the maximum time allowed for a request or check before it fails. Clear definition for software reliability teams.",
  "noindex": false,
  "deprecated": false,
  "cluster": "uptime"
},
  body: buildTermBody({
    whyItMatters: [
      "Timeout matters because teams need a shared, precise meaning for the maximum time allowed for a request or check before it fails. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, the maximum time allowed for a request or check before it fails shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of timeout is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team running checks against a 10s timeout on https://api.example.com/health. When the observed behavior stops matching the definition of timeout, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: {
      title: "Longer timeouts always improve reliability",
      body: ["That reading usually collapses distinct ideas into one slogan. Keep timeout tied to observable behavior so the definition stays useful under pressure."],
    },
    commonlyConfused: undefined,
    fajita: ["Set timeouts in monitors so hung connections fail clearly instead of waiting forever."],
    checklist: undefined,
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "response-time-threshold",
  "term": "Response-time threshold",
  "slug": "response-time-threshold",
  "shortDefinition": "Response-time threshold is the maximum acceptable duration for a successful response. Teams use the term to keep checks, alerts, and reviews precise.",
  "shortAnswer": "Response-time threshold describes the maximum acceptable duration for a successful response. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "monitoring",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "uptime-monitoring",
    "api-monitoring",
    "monitor",
    "incident-verification"
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
      "href": "/docs/getting-started/create-your-first-monitor",
      "label": "Create your first monitor"
    }
  ],
  "productLinks": [
    {
      "href": "/features/uptime-monitoring",
      "label": "Uptime monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is response-time threshold",
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
  "cta": "monitor",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Response-time threshold? Definition and Examples",
  "description": "Response-time threshold: the maximum acceptable duration for a successful response. Clear definition for software reliability teams.",
  "noindex": false,
  "deprecated": false,
  "cluster": "uptime"
},
  body: buildTermBody({
    whyItMatters: [
      "Response-time threshold matters because teams need a shared, precise meaning for the maximum acceptable duration for a successful response. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, the maximum acceptable duration for a successful response shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of response-time threshold is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team running checks against 800ms threshold for https://api.example.com/v1/search. When the observed behavior stops matching the definition of response-time threshold, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: {
      title: "Any response under five seconds is fine for every product",
      body: ["That reading usually collapses distinct ideas into one slogan. Keep response-time threshold tied to observable behavior so the definition stays useful under pressure."],
    },
    commonlyConfused: undefined,
    fajita: ["Fajita assertions can fail a check when response time exceeds your threshold."],
    checklist: undefined,
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "old-uptime-checker",
  "term": "Uptime checker (legacy term)",
  "slug": "old-uptime-checker",
  "shortDefinition": "Legacy label previously used for uptime monitoring. Retained only as a redirect target for old links.",
  "shortAnswer": "Uptime checker is a legacy phrase some teams used for the same idea as uptime monitoring. Fajita standardizes on uptime monitoring so definitions, documentation, and product language stay consistent. Use the canonical uptime monitoring page for the current definition and examples.",
  "category": "monitoring",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "uptime-monitoring"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [],
  "documentationLinks": [],
  "productLinks": [],
  "searchIntent": "definition",
  "primaryQuery": "uptime checker",
  "secondaryQueries": [],
  "status": "deprecated",
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
  "llmInclude": false,
  "indexable": false,
  "canonical": true,
  "redirects": [],
  "cta": "none",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "Uptime Checker (Legacy Term)",
  "description": "Legacy synonym for uptime monitoring. Redirects to the canonical glossary page.",
  "noindex": true,
  "deprecated": true,
  "replacementSlug": "uptime-monitoring"
},
  body: buildTermBody({
    whyItMatters: [
      "Legacy aliases create duplicate search intent if left as separate living pages.",
    ],
    howItWorks: [
      "Deprecated terms redirect to the canonical definition.",
    ],
    example: [
      "Old bookmarks to this slug should land on uptime monitoring.",
    ],
    misconception: undefined,
    commonlyConfused: undefined,
    fajita: undefined,
    checklist: undefined,
    
  }),
  faqs: undefined,
  formula: undefined,
})
];
