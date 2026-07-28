import { h2, p, table } from "@/lib/docs/blocks";
import { buildTermBody } from "@/lib/glossary/authoring";
import { defineTerm, type GlossaryTerm } from "@/lib/glossary/types";

export const alertTerms: GlossaryTerm[] = [
defineTerm({
  meta: {
  "id": "alert",
  "term": "Alert",
  "slug": "alert",
  "shortDefinition": "Alert is a message that tells someone a monitored condition needs attention.",
  "shortAnswer": "Alert describes a message that tells someone a monitored condition needs attention. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "alerts",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "alert-channel",
    "alert-routing",
    "outage-alert",
    "recovery-alert"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "alerts"
  ],
  "documentationLinks": [
    {
      "href": "/docs/getting-started/connect-an-alert-channel",
      "label": "Connect an alert channel"
    }
  ],
  "productLinks": [
    {
      "href": "/integrations",
      "label": "Integrations"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is alert",
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
  "title": "What Is Alert? Definition and Examples",
  "description": "Alert: a message that tells someone a monitored condition needs attention. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Alert matters because teams need a precise shared meaning for a message that tells someone a monitored condition needs attention. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, a message that tells someone a monitored condition needs attention shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of alert is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around Slack notice that api.example.com is down. When observed behavior stops matching the definition of alert, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Every log line is an alert", body: ["That reading usually collapses distinct ideas into one slogan. Keep alert tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Fajita sends alerts through email, Slack, Discord, and webhooks after verification. See [connect an alert channel](/docs/getting-started/connect-an-alert-channel)."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "outage-alert",
  "term": "Outage alert",
  "slug": "outage-alert",
  "shortDefinition": "Outage alert is a notification that a service has entered a failed or down state.",
  "shortAnswer": "Outage alert describes a notification that a service has entered a failed or down state. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "alerts",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "alert",
    "recovery-alert",
    "incident"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "alerts"
  ],
  "documentationLinks": [],
  "productLinks": [
    {
      "href": "/integrations",
      "label": "Integrations"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is outage alert",
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
  "cta": "alert",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Outage alert? Definition and Examples",
  "description": "Outage alert: a notification that a service has entered a failed or down state. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Outage alert matters because teams need a precise shared meaning for a notification that a service has entered a failed or down state. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, a notification that a service has entered a failed or down state shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of outage alert is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around email that checkout is down. When observed behavior stops matching the definition of outage alert, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Outage alerts should fire on every retry", body: ["That reading usually collapses distinct ideas into one slogan. Keep outage alert tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Fajita outage alerts follow verified incident state, not every transient fail."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "recovery-alert",
  "term": "Recovery alert",
  "slug": "recovery-alert",
  "shortDefinition": "Recovery alert is a notification that a previously failing service is healthy again.",
  "shortAnswer": "Recovery alert describes a notification that a previously failing service is healthy again. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "alerts",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "outage-alert",
    "recovery-confirmation"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "alerts"
  ],
  "documentationLinks": [
    {
      "href": "/docs/alerts/recovery-notifications",
      "label": "Recovery notifications"
    }
  ],
  "productLinks": [
    {
      "href": "/integrations",
      "label": "Integrations"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is recovery alert",
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
  "cta": "alert",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Recovery alert? Definition and Examples",
  "description": "Recovery alert: a notification that a previously failing service is healthy again. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Recovery alert matters because teams need a precise shared meaning for a notification that a previously failing service is healthy again. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, a notification that a previously failing service is healthy again shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of recovery alert is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around Slack message that api.example.com recovered. When observed behavior stops matching the definition of recovery alert, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Recovery alerts are optional noise", body: ["That reading usually collapses distinct ideas into one slogan. Keep recovery alert tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Recovery notifications close the loop for responders. See [recovery notifications](/docs/alerts/recovery-notifications)."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "alert-channel",
  "term": "Alert channel",
  "slug": "alert-channel",
  "shortDefinition": "Alert channel is a configured destination for alert delivery such as email or Slack.",
  "shortAnswer": "Alert channel describes a configured destination for alert delivery such as email or Slack. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "alerts",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "alert-routing",
    "slack-alert",
    "discord-alert",
    "email-alert",
    "webhook-alert"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "alerts"
  ],
  "documentationLinks": [],
  "productLinks": [
    {
      "href": "/integrations",
      "label": "Integrations"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is alert channel",
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
  "title": "What Is Alert channel? Definition and Examples",
  "description": "Alert channel: a configured destination for alert delivery such as email or Slack. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Alert channel matters because teams need a precise shared meaning for a configured destination for alert delivery such as email or Slack. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, a configured destination for alert delivery such as email or Slack shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of alert channel is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around a Slack channel named #ops-alerts. When observed behavior stops matching the definition of alert channel, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "A channel is the same as a routing rule", body: ["That reading usually collapses distinct ideas into one slogan. Keep alert channel tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Fajita supports email, Slack, Discord, and generic webhooks as channels."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "alert-routing",
  "term": "Alert routing",
  "slug": "alert-routing",
  "shortDefinition": "Alert routing is rules that decide which channels receive which events.",
  "shortAnswer": "Alert routing describes rules that decide which channels receive which events. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "alerts",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "alert-rule",
    "alert-channel",
    "quiet-hours"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "alerts"
  ],
  "documentationLinks": [
    {
      "href": "/docs/alerts/routing-rules",
      "label": "Alert routing rules"
    }
  ],
  "productLinks": [
    {
      "href": "/integrations",
      "label": "Integrations"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is alert routing",
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
  "cta": "alert",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Alert routing? Definition and Examples",
  "description": "Alert routing: rules that decide which channels receive which events. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Alert routing matters because teams need a precise shared meaning for rules that decide which channels receive which events. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, rules that decide which channels receive which events shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of alert routing is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around payments monitors route to #payments-oncall. When observed behavior stops matching the definition of alert routing, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Routing means forwarding every alert everywhere", body: ["That reading usually collapses distinct ideas into one slogan. Keep alert routing tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Create routing rules so the right team hears the right failures. See [routing rules](/docs/alerts/routing-rules)."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "alert-rule",
  "term": "Alert rule",
  "slug": "alert-rule",
  "shortDefinition": "Alert rule is a specific condition that maps events to channels or suppression behavior.",
  "shortAnswer": "Alert rule describes a specific condition that maps events to channels or suppression behavior. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "alerts",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "alert-routing",
    "quiet-hours",
    "alert-deduplication"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "alerts"
  ],
  "documentationLinks": [],
  "productLinks": [
    {
      "href": "/integrations",
      "label": "Integrations"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is alert rule",
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
  "cta": "alert",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Alert rule? Definition and Examples",
  "description": "Alert rule: a specific condition that maps events to channels or suppression behavior. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Alert rule matters because teams need a precise shared meaning for a specific condition that maps events to channels or suppression behavior. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, a specific condition that maps events to channels or suppression behavior shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of alert rule is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around rule: severity high to email and Slack. When observed behavior stops matching the definition of alert rule, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Rules replace monitors", body: ["That reading usually collapses distinct ideas into one slogan. Keep alert rule tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Rules sit between incident events and channels so delivery stays intentional."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "alert-fatigue",
  "term": "Alert fatigue",
  "slug": "alert-fatigue",
  "shortDefinition": "Alert fatigue is desensitization caused by too many low-value alerts.",
  "shortAnswer": "Alert fatigue describes desensitization caused by too many low-value alerts. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "alerts",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "false-positive",
    "quiet-hours",
    "alert-deduplication"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "alerts"
  ],
  "documentationLinks": [],
  "productLinks": [
    {
      "href": "/integrations",
      "label": "Integrations"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is alert fatigue",
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
  "cta": "alert",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Alert fatigue? Definition and Examples",
  "description": "Alert fatigue: desensitization caused by too many low-value alerts. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Alert fatigue matters because teams need a precise shared meaning for desensitization caused by too many low-value alerts. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, desensitization caused by too many low-value alerts shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of alert fatigue is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around dozens of nightly flaky warnings. When observed behavior stops matching the definition of alert fatigue, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Fatigue means people need louder sounds", body: ["That reading usually collapses distinct ideas into one slogan. Keep alert fatigue tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Reduce fatigue with verification, routing, and quiet hours instead of more noise."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "alert-deduplication",
  "term": "Alert deduplication",
  "slug": "alert-deduplication",
  "shortDefinition": "Alert deduplication is suppressing repeated identical alerts while a condition remains open.",
  "shortAnswer": "Alert deduplication describes suppressing repeated identical alerts while a condition remains open. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "alerts",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "alert-fatigue",
    "alert-routing"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "alerts"
  ],
  "documentationLinks": [],
  "productLinks": [
    {
      "href": "/integrations",
      "label": "Integrations"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is alert deduplication",
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
  "cta": "alert",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Alert deduplication? Definition and Examples",
  "description": "Alert deduplication: suppressing repeated identical alerts while a condition remains open. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Alert deduplication matters because teams need a precise shared meaning for suppressing repeated identical alerts while a condition remains open. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, suppressing repeated identical alerts while a condition remains open shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of alert deduplication is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around one page for a continuing outage instead of fifty. When observed behavior stops matching the definition of alert deduplication, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Deduplication deletes incident history", body: ["That reading usually collapses distinct ideas into one slogan. Keep alert deduplication tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Deduplicate delivery, keep the timeline. Responders need one clear signal."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "quiet-hours",
  "term": "Quiet hours",
  "slug": "quiet-hours",
  "shortDefinition": "Quiet hours is a window when non-critical alerts are delayed or suppressed.",
  "shortAnswer": "Quiet hours describes a window when non-critical alerts are delayed or suppressed. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "alerts",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "alert-routing",
    "alert-fatigue"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "alerts"
  ],
  "documentationLinks": [
    {
      "href": "/docs/alerts/quiet-hours",
      "label": "Quiet hours"
    }
  ],
  "productLinks": [
    {
      "href": "/integrations",
      "label": "Integrations"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is quiet hours",
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
  "cta": "alert",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Quiet hours? Definition and Examples",
  "description": "Quiet hours: a window when non-critical alerts are delayed or suppressed. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Quiet hours matters because teams need a precise shared meaning for a window when non-critical alerts are delayed or suppressed. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, a window when non-critical alerts are delayed or suppressed shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of quiet hours is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around no low-severity pages between 22:00 and 07:00. When observed behavior stops matching the definition of quiet hours, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Quiet hours block all emergency alerts forever", body: ["That reading usually collapses distinct ideas into one slogan. Keep quiet hours tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Configure quiet hours carefully. Critical outages may still need to break through. See [quiet hours](/docs/alerts/quiet-hours)."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "alert-retry",
  "term": "Alert retry",
  "slug": "alert-retry",
  "shortDefinition": "Alert retry is sending an alert again after a delivery attempt failed.",
  "shortAnswer": "Alert retry describes sending an alert again after a delivery attempt failed. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "alerts",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "alert-delivery",
    "dead-letter-queue"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "alerts"
  ],
  "documentationLinks": [
    {
      "href": "/docs/alerts/retries-and-dead-letters",
      "label": "Retries and dead letters"
    }
  ],
  "productLinks": [
    {
      "href": "/integrations",
      "label": "Integrations"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is alert retry",
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
  "cta": "alert",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Alert retry? Definition and Examples",
  "description": "Alert retry: sending an alert again after a delivery attempt failed. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Alert retry matters because teams need a precise shared meaning for sending an alert again after a delivery attempt failed. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, sending an alert again after a delivery attempt failed shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of alert retry is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around retrying a Slack webhook after HTTP 500. When observed behavior stops matching the definition of alert retry, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Retries guarantee the human saw the message", body: ["That reading usually collapses distinct ideas into one slogan. Keep alert retry tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Retries improve delivery reliability. Dead letters capture lasting failures. See [retries and dead letters](/docs/alerts/retries-and-dead-letters)."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "alert-delivery",
  "term": "Alert delivery",
  "slug": "alert-delivery",
  "shortDefinition": "Alert delivery is the attempt to send an alert to a channel and record the outcome.",
  "shortAnswer": "Alert delivery describes the attempt to send an alert to a channel and record the outcome. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "alerts",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "alert-retry",
    "dead-letter-queue",
    "alert-channel"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "alerts"
  ],
  "documentationLinks": [],
  "productLinks": [
    {
      "href": "/integrations",
      "label": "Integrations"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is alert delivery",
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
  "cta": "alert",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Alert delivery? Definition and Examples",
  "description": "Alert delivery: the attempt to send an alert to a channel and record the outcome. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Alert delivery matters because teams need a precise shared meaning for the attempt to send an alert to a channel and record the outcome. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, the attempt to send an alert to a channel and record the outcome shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of alert delivery is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around successful Discord post for an outage. When observed behavior stops matching the definition of alert delivery, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Delivery means the outage is fixed", body: ["That reading usually collapses distinct ideas into one slogan. Keep alert delivery tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Delivery logs show whether the channel accepted the message."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "dead-letter-queue",
  "term": "Dead-letter queue",
  "slug": "dead-letter-queue",
  "shortDefinition": "Dead-letter queue is a holding place for alert deliveries that exhausted retries.",
  "shortAnswer": "Dead-letter queue describes a holding place for alert deliveries that exhausted retries. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "alerts",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "alert-retry",
    "alert-delivery",
    "webhook-alert"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "alerts"
  ],
  "documentationLinks": [
    {
      "href": "/docs/alerts/retries-and-dead-letters",
      "label": "Retries and dead letters"
    }
  ],
  "productLinks": [
    {
      "href": "/integrations",
      "label": "Integrations"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is dead-letter queue",
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
  "cta": "alert",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Dead-letter queue? Definition and Examples",
  "description": "Dead-letter queue: a holding place for alert deliveries that exhausted retries. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Dead-letter queue matters because teams need a precise shared meaning for a holding place for alert deliveries that exhausted retries. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, a holding place for alert deliveries that exhausted retries shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of dead-letter queue is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around failed webhook stored for operator review. When observed behavior stops matching the definition of dead-letter queue, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Dead letters are deleted customer emails", body: ["That reading usually collapses distinct ideas into one slogan. Keep dead-letter queue tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Inspect dead letters and fix the channel. See [retries and dead letters](/docs/alerts/retries-and-dead-letters)."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "webhook-alert",
  "term": "Webhook alert",
  "slug": "webhook-alert",
  "shortDefinition": "Webhook alert is an alert delivered as an HTTP POST to a URL you control.",
  "shortAnswer": "Webhook alert describes an alert delivered as an HTTP POST to a URL you control. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "alerts",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "webhook",
    "webhook-signature",
    "alert-channel"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "alerts"
  ],
  "documentationLinks": [
    {
      "href": "/docs/alerts/generic-webhooks",
      "label": "Generic webhooks"
    }
  ],
  "productLinks": [
    {
      "href": "/integrations",
      "label": "Integrations"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is webhook alert",
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
  "cta": "alert",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Webhook alert? Definition and Examples",
  "description": "Webhook alert: an alert delivered as an HTTP POST to a URL you control. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Webhook alert matters because teams need a precise shared meaning for an alert delivered as an HTTP POST to a URL you control. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, an alert delivered as an HTTP POST to a URL you control shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of webhook alert is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around POST to https://hooks.example.com/fajita. When observed behavior stops matching the definition of webhook alert, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Webhook alerts are unsigned by nature", body: ["That reading usually collapses distinct ideas into one slogan. Keep webhook alert tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Fajita generic webhooks can include signatures. See [generic webhooks](/docs/alerts/generic-webhooks)."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "slack-alert",
  "term": "Slack alert",
  "slug": "slack-alert",
  "shortDefinition": "Slack alert is an alert delivered into a Slack workspace channel or conversation.",
  "shortAnswer": "Slack alert describes an alert delivered into a Slack workspace channel or conversation. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "alerts",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "alert-channel",
    "discord-alert",
    "email-alert"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "alerts"
  ],
  "documentationLinks": [
    {
      "href": "/docs/alerts/slack",
      "label": "Slack alerts"
    }
  ],
  "productLinks": [
    {
      "href": "/integrations",
      "label": "Integrations"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is slack alert",
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
  "cta": "alert",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Slack alert? Definition and Examples",
  "description": "Slack alert: an alert delivered into a Slack workspace channel or conversation. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Slack alert matters because teams need a precise shared meaning for an alert delivered into a Slack workspace channel or conversation. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, an alert delivered into a Slack workspace channel or conversation shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of slack alert is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around #incidents receives a downtime notice. When observed behavior stops matching the definition of slack alert, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Slack alerts replace on-call ownership", body: ["That reading usually collapses distinct ideas into one slogan. Keep slack alert tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Connect Slack as a channel in Fajita. See [Slack alerts](/docs/alerts/slack)."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "discord-alert",
  "term": "Discord alert",
  "slug": "discord-alert",
  "shortDefinition": "Discord alert is an alert delivered into a Discord channel via webhook integration.",
  "shortAnswer": "Discord alert describes an alert delivered into a Discord channel via webhook integration. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "alerts",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "alert-channel",
    "slack-alert"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "alerts"
  ],
  "documentationLinks": [
    {
      "href": "/docs/alerts/discord",
      "label": "Discord alerts"
    }
  ],
  "productLinks": [
    {
      "href": "/integrations",
      "label": "Integrations"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is discord alert",
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
  "cta": "alert",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Discord alert? Definition and Examples",
  "description": "Discord alert: an alert delivered into a Discord channel via webhook integration. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Discord alert matters because teams need a precise shared meaning for an alert delivered into a Discord channel via webhook integration. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, an alert delivered into a Discord channel via webhook integration shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of discord alert is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around ops Discord channel receives recovery notice. When observed behavior stops matching the definition of discord alert, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Discord alerts are only for gaming communities", body: ["That reading usually collapses distinct ideas into one slogan. Keep discord alert tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Connect Discord in Fajita. See [Discord alerts](/docs/alerts/discord)."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "email-alert",
  "term": "Email alert",
  "slug": "email-alert",
  "shortDefinition": "Email alert is an alert delivered to one or more email addresses.",
  "shortAnswer": "Email alert describes an alert delivered to one or more email addresses. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "alerts",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "alert-channel",
    "slack-alert"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "alerts"
  ],
  "documentationLinks": [],
  "productLinks": [
    {
      "href": "/integrations",
      "label": "Integrations"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is email alert",
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
  "cta": "alert",
  "requiresLegalReview": false,
  "requiresSecurityReview": false,
  "searchBoost": 0,
  "title": "What Is Email alert? Definition and Examples",
  "description": "Email alert: an alert delivered to one or more email addresses. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Email alert matters because teams need a precise shared meaning for an alert delivered to one or more email addresses. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, an alert delivered to one or more email addresses shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of email alert is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around oncall@example.com receives an outage email. When observed behavior stops matching the definition of email alert, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Email alerts are always the fastest channel", body: ["That reading usually collapses distinct ideas into one slogan. Keep email alert tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Email remains a reliable baseline channel in Fajita alongside chat integrations."],
    
  }),
  faqs: undefined,
  formula: undefined,
})
];
