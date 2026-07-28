import { h2, p, table } from "@/lib/docs/blocks";
import { buildTermBody } from "@/lib/glossary/authoring";
import { defineTerm, type GlossaryTerm } from "@/lib/glossary/types";

export const statusPageTerms: GlossaryTerm[] = [
defineTerm({
  meta: {
  "id": "status-page",
  "term": "Status page",
  "slug": "status-page",
  "shortDefinition": "Status page is a public or private page that communicates current service health and incidents.",
  "shortAnswer": "Status page describes a public or private page that communicates current service health and incidents. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "status-pages",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "status-page-component",
    "public-incident",
    "scheduled-maintenance",
    "status-page-subscriber",
    "uptime-history"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "status-pages"
  ],
  "documentationLinks": [
    {
      "href": "/docs/status-pages/create",
      "label": "Create a status page"
    },
    {
      "href": "/docs/getting-started/publish-a-status-page",
      "label": "Publish a status page"
    }
  ],
  "productLinks": [
    {
      "href": "/features/status-pages",
      "label": "Status pages"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is status page",
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
  "cta": "status-page",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Status page? Definition and Examples",
  "description": "Status page: a public or private page that communicates current service health and incidents. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false,
  "cluster": "status-page"
},
  body: buildTermBody({
    whyItMatters: [
      "Status page matters because teams need a precise shared meaning for a public or private page that communicates current service health and incidents. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, a public or private page that communicates current service health and incidents shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of status page is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around status.example.com during a checkout incident. When observed behavior stops matching the definition of status page, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "A status page is only a marketing site", body: ["That reading usually collapses distinct ideas into one slogan. Keep status page tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Fajita hosts status pages with components, incidents, maintenance, and uptime history. See [create a status page](/docs/status-pages/create)."],
    
  }),
  faqs: [{ question: "Should every outage appear on the status page?", answer: "Publish incidents that affect customers or stakeholders. Internal blips that never left verification may not belong in public view." }, { question: "What belongs in a status update?", answer: "What is affected, what you know, what you are doing, and when you will update again. Avoid speculation presented as fact." }],
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "hosted-status-page",
  "term": "Hosted status page",
  "slug": "hosted-status-page",
  "shortDefinition": "Hosted status page is a status page served on infrastructure managed by the monitoring provider.",
  "shortAnswer": "Hosted status page describes a status page served on infrastructure managed by the monitoring provider. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "status-pages",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "status-page",
    "custom-status-page-domain",
    "public-status-page"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "status-pages"
  ],
  "documentationLinks": [],
  "productLinks": [
    {
      "href": "/features/status-pages",
      "label": "Status pages"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is hosted status page",
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
  "cta": "status-page",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Hosted status page? Definition and Examples",
  "description": "Hosted status page: a status page served on infrastructure managed by the monitoring provider. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false,
  "cluster": "status-page"
},
  body: buildTermBody({
    whyItMatters: [
      "Hosted status page matters because teams need a precise shared meaning for a status page served on infrastructure managed by the monitoring provider. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, a status page served on infrastructure managed by the monitoring provider shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of hosted status page is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around https://example.fajita status hostname. When observed behavior stops matching the definition of hosted status page, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Hosted pages cannot use custom domains", body: ["That reading usually collapses distinct ideas into one slogan. Keep hosted status page tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Fajita provides hosted status pages and optional custom domains."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "public-status-page",
  "term": "Public status page",
  "slug": "public-status-page",
  "shortDefinition": "Public status page is a status page anyone can open without logging in.",
  "shortAnswer": "Public status page describes a status page anyone can open without logging in. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "status-pages",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "private-status-page",
    "public-incident",
    "status-page"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "status-pages"
  ],
  "documentationLinks": [],
  "productLinks": [
    {
      "href": "/features/status-pages",
      "label": "Status pages"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is public status page",
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
  "cta": "status-page",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Public status page? Definition and Examples",
  "description": "Public status page: a status page anyone can open without logging in. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false,
  "cluster": "status-page"
},
  body: buildTermBody({
    whyItMatters: [
      "Public status page matters because teams need a precise shared meaning for a status page anyone can open without logging in. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, a status page anyone can open without logging in shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of public status page is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around customers reading status.example.com. When observed behavior stops matching the definition of public status page, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Public pages must show internal notes", body: ["That reading usually collapses distinct ideas into one slogan. Keep public status page tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Publish only public-safe incident text. Keep internal diagnostics off the page."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "private-status-page",
  "term": "Private status page",
  "slug": "private-status-page",
  "shortDefinition": "Private status page is a status page limited to authorized viewers.",
  "shortAnswer": "Private status page describes a status page limited to authorized viewers. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "status-pages",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "public-status-page",
    "status-page"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "status-pages"
  ],
  "documentationLinks": [],
  "productLinks": [
    {
      "href": "/features/status-pages",
      "label": "Status pages"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is private status page",
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
  "cta": "status-page",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Private status page? Definition and Examples",
  "description": "Private status page: a status page limited to authorized viewers. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Private status page matters because teams need a precise shared meaning for a status page limited to authorized viewers. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, a status page limited to authorized viewers shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of private status page is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around partner-only status for a B2B API. When observed behavior stops matching the definition of private status page, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Private means it is not useful", body: ["That reading usually collapses distinct ideas into one slogan. Keep private status page tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Private pages still need clear components and honest updates for the audience that can see them."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "status-page-component",
  "term": "Status-page component",
  "slug": "status-page-component",
  "shortDefinition": "Status-page component is a named part of a product shown on a status page with its own health.",
  "shortAnswer": "Status-page component describes a named part of a product shown on a status page with its own health. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "status-pages",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "component-group",
    "operational-status",
    "status-page"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "status-pages"
  ],
  "documentationLinks": [
    {
      "href": "/docs/status-pages/components",
      "label": "Status page components"
    }
  ],
  "productLinks": [
    {
      "href": "/features/status-pages",
      "label": "Status pages"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is status-page component",
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
  "cta": "status-page",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Status-page component? Definition and Examples",
  "description": "Status-page component: a named part of a product shown on a status page with its own health. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false,
  "cluster": "status-page"
},
  body: buildTermBody({
    whyItMatters: [
      "Status-page component matters because teams need a precise shared meaning for a named part of a product shown on a status page with its own health. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, a named part of a product shown on a status page with its own health shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of status-page component is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around Checkout API component marked degraded. When observed behavior stops matching the definition of status-page component, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Components are only decorative labels", body: ["That reading usually collapses distinct ideas into one slogan. Keep status-page component tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Map monitors to components carefully. See [components](/docs/status-pages/components)."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "component-group",
  "term": "Component group",
  "slug": "component-group",
  "shortDefinition": "Component group is a collection of related status-page components shown together.",
  "shortAnswer": "Component group describes a collection of related status-page components shown together. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "status-pages",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "status-page-component",
    "status-page"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "status-pages"
  ],
  "documentationLinks": [],
  "productLinks": [
    {
      "href": "/features/status-pages",
      "label": "Status pages"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is component group",
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
  "cta": "status-page",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Component group? Definition and Examples",
  "description": "Component group: a collection of related status-page components shown together. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Component group matters because teams need a precise shared meaning for a collection of related status-page components shown together. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, a collection of related status-page components shown together shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of component group is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around group containing API, Dashboard, and Auth. When observed behavior stops matching the definition of component group, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Groups replace individual component status", body: ["That reading usually collapses distinct ideas into one slogan. Keep component group tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Groups improve scanning; each component should still have its own state."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "public-incident",
  "term": "Public incident",
  "slug": "public-incident",
  "shortDefinition": "Public incident is an incident projection written for customers on a status page.",
  "shortAnswer": "Public incident describes an incident projection written for customers on a status page. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "status-pages",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "incident",
    "status-page",
    "status-page-subscriber"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "status-pages"
  ],
  "documentationLinks": [],
  "productLinks": [
    {
      "href": "/features/status-pages",
      "label": "Status pages"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is public incident",
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
  "cta": "status-page",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Public incident? Definition and Examples",
  "description": "Public incident: an incident projection written for customers on a status page. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false,
  "cluster": "status-page"
},
  body: buildTermBody({
    whyItMatters: [
      "Public incident matters because teams need a precise shared meaning for an incident projection written for customers on a status page. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, an incident projection written for customers on a status page shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of public incident is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around investigating elevated errors on checkout. When observed behavior stops matching the definition of public incident, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Public incidents must include server logs", body: ["That reading usually collapses distinct ideas into one slogan. Keep public incident tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Write public-safe summaries. Keep stack traces and internal hosts off the page."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "status-page-subscriber",
  "term": "Status-page subscriber",
  "slug": "status-page-subscriber",
  "shortDefinition": "Status-page subscriber is a person who opts in to receive status updates by email.",
  "shortAnswer": "Status-page subscriber describes a person who opts in to receive status updates by email. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "status-pages",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "status-page",
    "public-incident",
    "scheduled-maintenance"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "status-pages"
  ],
  "documentationLinks": [
    {
      "href": "/docs/subscribers/double-opt-in",
      "label": "Double opt-in"
    }
  ],
  "productLinks": [
    {
      "href": "/features/status-pages",
      "label": "Status pages"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is status-page subscriber",
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
  "cta": "status-page",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Status-page subscriber? Definition and Examples",
  "description": "Status-page subscriber: a person who opts in to receive status updates by email. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false,
  "cluster": "status-page"
},
  body: buildTermBody({
    whyItMatters: [
      "Status-page subscriber matters because teams need a precise shared meaning for a person who opts in to receive status updates by email. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, a person who opts in to receive status updates by email shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of status-page subscriber is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around subscriber confirms via double opt-in. When observed behavior stops matching the definition of status-page subscriber, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Subscribers are the same as alert channels for engineers", body: ["That reading usually collapses distinct ideas into one slogan. Keep status-page subscriber tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Fajita uses verified double opt-in for subscribers. See [double opt-in](/docs/subscribers/double-opt-in)."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "operational-status",
  "term": "Operational status",
  "slug": "operational-status",
  "shortDefinition": "Operational status is the healthy state indicating a component is working as expected.",
  "shortAnswer": "Operational status describes the healthy state indicating a component is working as expected. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "status-pages",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "degraded-performance",
    "status-page-component"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "status-pages"
  ],
  "documentationLinks": [],
  "productLinks": [
    {
      "href": "/features/status-pages",
      "label": "Status pages"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is operational status",
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
  "cta": "status-page",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Operational status? Definition and Examples",
  "description": "Operational status: the healthy state indicating a component is working as expected. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Operational status matters because teams need a precise shared meaning for the healthy state indicating a component is working as expected. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, the healthy state indicating a component is working as expected shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of operational status is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around all components green on status.example.com. When observed behavior stops matching the definition of operational status, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Operational means perfect performance forever", body: ["That reading usually collapses distinct ideas into one slogan. Keep operational status tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Operational means within expected behavior, not that latency cannot improve."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "scheduled-maintenance",
  "term": "Scheduled maintenance",
  "slug": "scheduled-maintenance",
  "shortDefinition": "Scheduled maintenance is planned work communicated in advance on a status page.",
  "shortAnswer": "Scheduled maintenance describes planned work communicated in advance on a status page. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "status-pages",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "maintenance-window",
    "status-page",
    "uptime"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "status-pages"
  ],
  "documentationLinks": [
    {
      "href": "/docs/maintenance/create",
      "label": "Create maintenance"
    }
  ],
  "productLinks": [
    {
      "href": "/features/status-pages",
      "label": "Status pages"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is scheduled maintenance",
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
  "cta": "status-page",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Scheduled maintenance? Definition and Examples",
  "description": "Scheduled maintenance: planned work communicated in advance on a status page. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Scheduled maintenance matters because teams need a precise shared meaning for planned work communicated in advance on a status page. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, planned work communicated in advance on a status page shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of scheduled maintenance is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around database upgrade window Sunday 02:00 UTC. When observed behavior stops matching the definition of scheduled maintenance, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Maintenance is secret so customers are not worried", body: ["That reading usually collapses distinct ideas into one slogan. Keep scheduled maintenance tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Announce maintenance early. See [create maintenance](/docs/maintenance/create)."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "maintenance-window",
  "term": "Maintenance window",
  "slug": "maintenance-window",
  "shortDefinition": "Maintenance window is the time range when planned maintenance is expected to run.",
  "shortAnswer": "Maintenance window describes the time range when planned maintenance is expected to run. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "status-pages",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "scheduled-maintenance",
    "uptime-percentage"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "status-pages"
  ],
  "documentationLinks": [],
  "productLinks": [
    {
      "href": "/features/status-pages",
      "label": "Status pages"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is maintenance window",
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
  "cta": "status-page",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Maintenance window? Definition and Examples",
  "description": "Maintenance window: the time range when planned maintenance is expected to run. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Maintenance window matters because teams need a precise shared meaning for the time range when planned maintenance is expected to run. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, the time range when planned maintenance is expected to run shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of maintenance window is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around 02:00–04:00 UTC maintenance window. When observed behavior stops matching the definition of maintenance window, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Maintenance windows erase downtime from physics", body: ["That reading usually collapses distinct ideas into one slogan. Keep maintenance window tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Windows explain expected impact. Uptime eligibility rules may treat them specially."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "service-status-history",
  "term": "Service-status history",
  "slug": "service-status-history",
  "shortDefinition": "Service-status history is the historical record of component and incident states over time.",
  "shortAnswer": "Service-status history describes the historical record of component and incident states over time. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "status-pages",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "uptime-history",
    "status-page"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "status-pages"
  ],
  "documentationLinks": [],
  "productLinks": [
    {
      "href": "/features/status-pages",
      "label": "Status pages"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is service-status history",
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
  "cta": "status-page",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Service-status history? Definition and Examples",
  "description": "Service-status history: the historical record of component and incident states over time. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Service-status history matters because teams need a precise shared meaning for the historical record of component and incident states over time. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, the historical record of component and incident states over time shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of service-status history is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around ninety days of component history. When observed behavior stops matching the definition of service-status history, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "History is only a marketing chart", body: ["That reading usually collapses distinct ideas into one slogan. Keep service-status history tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["History helps customers judge reliability trends. Keep the methodology honest."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "uptime-history",
  "term": "Uptime history",
  "slug": "uptime-history",
  "shortDefinition": "Uptime history is a presentation of past availability for a service or component.",
  "shortAnswer": "Uptime history describes a presentation of past availability for a service or component. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "status-pages",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "uptime-percentage",
    "status-page",
    "service-status-history"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "status-pages"
  ],
  "documentationLinks": [
    {
      "href": "/docs/status-pages/uptime-history",
      "label": "Uptime history"
    }
  ],
  "productLinks": [
    {
      "href": "/features/status-pages",
      "label": "Status pages"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is uptime history",
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
  "cta": "status-page",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Uptime history? Definition and Examples",
  "description": "Uptime history: a presentation of past availability for a service or component. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false,
  "cluster": "status-page"
},
  body: buildTermBody({
    whyItMatters: [
      "Uptime history matters because teams need a precise shared meaning for a presentation of past availability for a service or component. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, a presentation of past availability for a service or component shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of uptime history is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around calendar of daily uptime for API. When observed behavior stops matching the definition of uptime history, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Uptime history is a contractual SLA by itself", body: ["That reading usually collapses distinct ideas into one slogan. Keep uptime history tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Fajita can show uptime history on status pages. See [uptime history](/docs/status-pages/uptime-history)."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "status-badge",
  "term": "Status badge",
  "slug": "status-badge",
  "shortDefinition": "Status badge is a compact embeddable indicator of current status.",
  "shortAnswer": "Status badge describes a compact embeddable indicator of current status. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "status-pages",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "status-page",
    "operational-status"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "status-pages"
  ],
  "documentationLinks": [],
  "productLinks": [
    {
      "href": "/features/status-pages",
      "label": "Status pages"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is status badge",
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
  "cta": "status-page",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Status badge? Definition and Examples",
  "description": "Status badge: a compact embeddable indicator of current status. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Status badge matters because teams need a precise shared meaning for a compact embeddable indicator of current status. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, a compact embeddable indicator of current status shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of status badge is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around badge on docs.example.com linking to the status page. When observed behavior stops matching the definition of status badge, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Badges replace full incident communication", body: ["That reading usually collapses distinct ideas into one slogan. Keep status badge tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Badges are shortcuts. Deep updates still belong on the status page."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "custom-status-page-domain",
  "term": "Custom status-page domain",
  "slug": "custom-status-page-domain",
  "shortDefinition": "Custom status-page domain is serving a status page on a domain you control such as status.example.com.",
  "shortAnswer": "Custom status-page domain describes serving a status page on a domain you control such as status.example.com. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "status-pages",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "hosted-status-page",
    "managed-tls",
    "cname-record"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "status-pages"
  ],
  "documentationLinks": [
    {
      "href": "/docs/status-pages/custom-domains",
      "label": "Custom domains"
    }
  ],
  "productLinks": [
    {
      "href": "/features/status-pages",
      "label": "Status pages"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is custom status-page domain",
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
  "cta": "status-page",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Custom status-page domain? Definition and Examples",
  "description": "Custom status-page domain: serving a status page on a domain you control such as status.example.com. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false,
  "cluster": "status-page"
},
  body: buildTermBody({
    whyItMatters: [
      "Custom status-page domain matters because teams need a precise shared meaning for serving a status page on a domain you control such as status.example.com. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, serving a status page on a domain you control such as status.example.com shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of custom status-page domain is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around CNAME for status.example.com. When observed behavior stops matching the definition of custom status-page domain, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Custom domains remove the need for TLS", body: ["That reading usually collapses distinct ideas into one slogan. Keep custom status-page domain tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Fajita supports custom domains with managed TLS. See [custom domains](/docs/status-pages/custom-domains)."],
    
  }),
  faqs: undefined,
  formula: undefined,
})
];
