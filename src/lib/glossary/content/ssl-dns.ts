import { h2, p, table } from "@/lib/docs/blocks";
import { buildTermBody } from "@/lib/glossary/authoring";
import { defineTerm, type GlossaryTerm } from "@/lib/glossary/types";

export const sslDnsTerms: GlossaryTerm[] = [
defineTerm({
  meta: {
  "id": "ssl-certificate",
  "term": "SSL certificate",
  "slug": "ssl-certificate",
  "shortDefinition": "SSL certificate is a digital certificate commonly used to enable HTTPS for a hostname.",
  "shortAnswer": "SSL certificate describes a digital certificate commonly used to enable HTTPS for a hostname. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "ssl-dns",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "tls-certificate",
    "ssl-certificate-monitoring",
    "https-certificate"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "ssl-monitoring"
  ],
  "documentationLinks": [],
  "productLinks": [
    {
      "href": "/features/ssl-monitoring",
      "label": "SSL monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is ssl certificate",
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
  "title": "What Is SSL certificate? Definition and Examples",
  "description": "SSL certificate: a digital certificate commonly used to enable HTTPS for a hostname. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "SSL certificate matters because teams need a precise shared meaning for a digital certificate commonly used to enable HTTPS for a hostname. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, a digital certificate commonly used to enable HTTPS for a hostname shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of ssl certificate is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around certificate for www.example.com. When observed behavior stops matching the definition of ssl certificate, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "SSL certificates are only for email encryption", body: ["That reading usually collapses distinct ideas into one slogan. Keep ssl certificate tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Fajita watches certificates for expiry and validity. See [SSL monitoring](/docs/monitors/ssl-monitoring)."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "tls-certificate",
  "term": "TLS certificate",
  "slug": "tls-certificate",
  "shortDefinition": "TLS certificate is a certificate used to authenticate a host during a TLS handshake.",
  "shortAnswer": "TLS certificate describes a certificate used to authenticate a host during a TLS handshake. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "ssl-dns",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "ssl-certificate",
    "tls-handshake",
    "ssl-certificate-monitoring"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "ssl-monitoring"
  ],
  "documentationLinks": [],
  "productLinks": [
    {
      "href": "/features/ssl-monitoring",
      "label": "SSL monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is tls certificate",
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
  "title": "What Is TLS certificate? Definition and Examples",
  "description": "TLS certificate: a certificate used to authenticate a host during a TLS handshake. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "TLS certificate matters because teams need a precise shared meaning for a certificate used to authenticate a host during a TLS handshake. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, a certificate used to authenticate a host during a TLS handshake shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of tls certificate is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around certificate presented by api.example.com. When observed behavior stops matching the definition of tls certificate, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "TLS and SSL are unrelated technologies", body: ["That reading usually collapses distinct ideas into one slogan. Keep tls certificate tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["People still say SSL in conversation. Modern HTTPS uses TLS. Monitor the certificate customers depend on."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "ssl-certificate-monitoring",
  "term": "SSL certificate monitoring",
  "slug": "ssl-certificate-monitoring",
  "shortDefinition": "SSL certificate monitoring is watching certificates for upcoming expiration and validity problems.",
  "shortAnswer": "SSL certificate monitoring describes watching certificates for upcoming expiration and validity problems. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "ssl-dns",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "certificate-expiration",
    "certificate-chain",
    "hostname-mismatch",
    "ssl-certificate"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "ssl-monitoring"
  ],
  "documentationLinks": [
    {
      "href": "/docs/monitors/ssl-monitoring",
      "label": "SSL monitoring"
    }
  ],
  "productLinks": [
    {
      "href": "/features/ssl-monitoring",
      "label": "SSL monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is ssl certificate monitoring",
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
  "title": "What Is SSL certificate monitoring? Definition and Examples",
  "description": "SSL certificate monitoring: watching certificates for upcoming expiration and validity problems. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "SSL certificate monitoring matters because teams need a precise shared meaning for watching certificates for upcoming expiration and validity problems. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, watching certificates for upcoming expiration and validity problems shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of ssl certificate monitoring is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around alert 21 days before example.com expires. When observed behavior stops matching the definition of ssl certificate monitoring, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Browsers will always warn your team first", body: ["That reading usually collapses distinct ideas into one slogan. Keep ssl certificate monitoring tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Fajita SSL monitors warn before customers see certificate errors. See [SSL monitoring](/docs/monitors/ssl-monitoring)."],
    
  }),
  faqs: [{ question: "How early should certificate alerts fire?", answer: "Many teams alert at 30 and 14 days before expiry so renewals are not last-minute emergencies." }, { question: "Does SSL monitoring replace uptime monitoring?", answer: "No. Certificates can be valid while the application is down, and the reverse can also happen." }],
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "certificate-expiration",
  "term": "Certificate expiration",
  "slug": "certificate-expiration",
  "shortDefinition": "Certificate expiration is the moment after which a certificate should no longer be trusted.",
  "shortAnswer": "Certificate expiration describes the moment after which a certificate should no longer be trusted. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "ssl-dns",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "ssl-certificate-monitoring",
    "ssl-certificate"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "ssl-monitoring"
  ],
  "documentationLinks": [],
  "productLinks": [
    {
      "href": "/features/ssl-monitoring",
      "label": "SSL monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is certificate expiration",
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
  "title": "What Is Certificate expiration? Definition and Examples",
  "description": "Certificate expiration: the moment after which a certificate should no longer be trusted. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Certificate expiration matters because teams need a precise shared meaning for the moment after which a certificate should no longer be trusted. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, the moment after which a certificate should no longer be trusted shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of certificate expiration is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around example.com certificate ends on a calendar date. When observed behavior stops matching the definition of certificate expiration, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Expiration is only a billing event", body: ["That reading usually collapses distinct ideas into one slogan. Keep certificate expiration tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Expired certificates break HTTPS for visitors. Monitor expiry dates deliberately."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "certificate-chain",
  "term": "Certificate chain",
  "slug": "certificate-chain",
  "shortDefinition": "Certificate chain is the sequence of certificates from a server cert up to a trusted root.",
  "shortAnswer": "Certificate chain describes the sequence of certificates from a server cert up to a trusted root. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "ssl-dns",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "ssl-certificate",
    "tls-handshake"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "ssl-monitoring"
  ],
  "documentationLinks": [],
  "productLinks": [
    {
      "href": "/features/ssl-monitoring",
      "label": "SSL monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is certificate chain",
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
  "title": "What Is Certificate chain? Definition and Examples",
  "description": "Certificate chain: the sequence of certificates from a server cert up to a trusted root. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Certificate chain matters because teams need a precise shared meaning for the sequence of certificates from a server cert up to a trusted root. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, the sequence of certificates from a server cert up to a trusted root shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of certificate chain is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around leaf, intermediate, and root for api.example.com. When observed behavior stops matching the definition of certificate chain, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Browsers invent missing intermediates forever", body: ["That reading usually collapses distinct ideas into one slogan. Keep certificate chain tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Incomplete chains cause trust errors on some clients. Monitor chain validity, not only dates."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "hostname-mismatch",
  "term": "Hostname mismatch",
  "slug": "hostname-mismatch",
  "shortDefinition": "Hostname mismatch is when a certificate does not cover the hostname being visited.",
  "shortAnswer": "Hostname mismatch describes when a certificate does not cover the hostname being visited. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "ssl-dns",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "ssl-certificate-monitoring",
    "dns"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "ssl-monitoring"
  ],
  "documentationLinks": [],
  "productLinks": [
    {
      "href": "/features/ssl-monitoring",
      "label": "SSL monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is hostname mismatch",
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
  "title": "What Is Hostname mismatch? Definition and Examples",
  "description": "Hostname mismatch: when a certificate does not cover the hostname being visited. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Hostname mismatch matters because teams need a precise shared meaning for when a certificate does not cover the hostname being visited. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, when a certificate does not cover the hostname being visited shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of hostname mismatch is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around certificate for example.com served on api.example.com. When observed behavior stops matching the definition of hostname mismatch, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Mismatch is the same as expiration", body: ["That reading usually collapses distinct ideas into one slogan. Keep hostname mismatch tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Match certificate names to every hostname customers use, including www and api hosts."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "tls-handshake",
  "term": "TLS handshake",
  "slug": "tls-handshake",
  "shortDefinition": "TLS handshake is the negotiation that establishes a secure TLS session.",
  "shortAnswer": "TLS handshake describes the negotiation that establishes a secure TLS session. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "ssl-dns",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "tls-certificate",
    "https-monitoring"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "ssl-monitoring"
  ],
  "documentationLinks": [],
  "productLinks": [
    {
      "href": "/features/ssl-monitoring",
      "label": "SSL monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is tls handshake",
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
  "title": "What Is TLS handshake? Definition and Examples",
  "description": "TLS handshake: the negotiation that establishes a secure TLS session. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "TLS handshake matters because teams need a precise shared meaning for the negotiation that establishes a secure TLS session. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, the negotiation that establishes a secure TLS session shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of tls handshake is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around client connecting to https://api.example.com. When observed behavior stops matching the definition of tls handshake, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Handshakes only happen once per year", body: ["That reading usually collapses distinct ideas into one slogan. Keep tls handshake tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Handshake failures appear as HTTPS errors in monitors and browsers."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "dns",
  "term": "DNS",
  "slug": "dns",
  "shortDefinition": "DNS is the system that resolves human hostnames into addresses machines use.",
  "shortAnswer": "DNS describes the system that resolves human hostnames into addresses machines use. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "ssl-dns",
  "secondaryCategories": [],
  "acronym": "DNS",
  "expandedName": "Domain Name System",
  "synonyms": [],
  "relatedTerms": [
    "dns-resolution",
    "dns-record",
    "cname-record"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "ssl-monitoring"
  ],
  "documentationLinks": [],
  "productLinks": [
    {
      "href": "/features/ssl-monitoring",
      "label": "SSL monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is dns",
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
  "title": "What Is DNS? Definition and Examples",
  "description": "DNS: the system that resolves human hostnames into addresses machines use. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "DNS matters because teams need a precise shared meaning for the system that resolves human hostnames into addresses machines use. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, the system that resolves human hostnames into addresses machines use shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of dns is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around resolving api.example.com. When observed behavior stops matching the definition of dns, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "DNS is only a domain registrar control panel", body: ["That reading usually collapses distinct ideas into one slogan. Keep dns tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["DNS failures look like total outages even when servers are healthy."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "dns-resolution",
  "term": "DNS resolution",
  "slug": "dns-resolution",
  "shortDefinition": "DNS resolution is the process of looking up records for a hostname.",
  "shortAnswer": "DNS resolution describes the process of looking up records for a hostname. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "ssl-dns",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "dns",
    "dns-record"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "ssl-monitoring"
  ],
  "documentationLinks": [],
  "productLinks": [
    {
      "href": "/features/ssl-monitoring",
      "label": "SSL monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is dns resolution",
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
  "title": "What Is DNS resolution? Definition and Examples",
  "description": "DNS resolution: the process of looking up records for a hostname. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "DNS resolution matters because teams need a precise shared meaning for the process of looking up records for a hostname. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, the process of looking up records for a hostname shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of dns resolution is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around resolving status.example.com to an address. When observed behavior stops matching the definition of dns resolution, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Resolution always succeeds if the site worked yesterday", body: ["That reading usually collapses distinct ideas into one slogan. Keep dns resolution tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Monitor HTTPS targets after DNS changes. Propagation mistakes are common."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "dns-record",
  "term": "DNS record",
  "slug": "dns-record",
  "shortDefinition": "DNS record is a typed piece of DNS data such as A, AAAA, CNAME, or TXT.",
  "shortAnswer": "DNS record describes a typed piece of DNS data such as A, AAAA, CNAME, or TXT. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "ssl-dns",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "cname-record",
    "txt-record",
    "dns"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "ssl-monitoring"
  ],
  "documentationLinks": [],
  "productLinks": [
    {
      "href": "/features/ssl-monitoring",
      "label": "SSL monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is dns record",
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
  "title": "What Is DNS record? Definition and Examples",
  "description": "DNS record: a typed piece of DNS data such as A, AAAA, CNAME, or TXT. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "DNS record matters because teams need a precise shared meaning for a typed piece of DNS data such as A, AAAA, CNAME, or TXT. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, a typed piece of DNS data such as A, AAAA, CNAME, or TXT shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of dns record is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around A record for example.com. When observed behavior stops matching the definition of dns record, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Records are decorative metadata", body: ["That reading usually collapses distinct ideas into one slogan. Keep dns record tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Wrong records take sites offline or break verification."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "cname-record",
  "term": "CNAME record",
  "slug": "cname-record",
  "shortDefinition": "CNAME record is a DNS record that aliases one hostname to another.",
  "shortAnswer": "CNAME record describes a DNS record that aliases one hostname to another. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "ssl-dns",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "custom-status-page-domain",
    "dns-record"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "ssl-monitoring"
  ],
  "documentationLinks": [],
  "productLinks": [
    {
      "href": "/features/ssl-monitoring",
      "label": "SSL monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is cname record",
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
  "title": "What Is CNAME record? Definition and Examples",
  "description": "CNAME record: a DNS record that aliases one hostname to another. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "CNAME record matters because teams need a precise shared meaning for a DNS record that aliases one hostname to another. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, a DNS record that aliases one hostname to another shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of cname record is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around status.example.com CNAME to a hosted status target. When observed behavior stops matching the definition of cname record, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "CNAME always replaces every other record at the zone apex safely", body: ["That reading usually collapses distinct ideas into one slogan. Keep cname record tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Use CNAMEs where your DNS provider supports them, especially for status subdomains."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "txt-record",
  "term": "TXT record",
  "slug": "txt-record",
  "shortDefinition": "TXT record is a DNS record that stores text, often for domain verification.",
  "shortAnswer": "TXT record describes a DNS record that stores text, often for domain verification. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "ssl-dns",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "domain-verification",
    "dns-record"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "ssl-monitoring"
  ],
  "documentationLinks": [],
  "productLinks": [
    {
      "href": "/features/ssl-monitoring",
      "label": "SSL monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is txt record",
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
  "title": "What Is TXT record? Definition and Examples",
  "description": "TXT record: a DNS record that stores text, often for domain verification. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "TXT record matters because teams need a precise shared meaning for a DNS record that stores text, often for domain verification. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, a DNS record that stores text, often for domain verification shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of txt record is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around TXT verification token for example.com. When observed behavior stops matching the definition of txt record, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "TXT records configure TLS ciphers", body: ["That reading usually collapses distinct ideas into one slogan. Keep txt record tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Follow provider instructions for verification TXT values and remove stale tokens when done."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "domain-verification",
  "term": "Domain verification",
  "slug": "domain-verification",
  "shortDefinition": "Domain verification is proving control of a domain, often via DNS or HTTP challenges.",
  "shortAnswer": "Domain verification describes proving control of a domain, often via DNS or HTTP challenges. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "ssl-dns",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "txt-record",
    "custom-status-page-domain",
    "managed-tls"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "ssl-monitoring"
  ],
  "documentationLinks": [],
  "productLinks": [
    {
      "href": "/features/ssl-monitoring",
      "label": "SSL monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is domain verification",
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
  "title": "What Is Domain verification? Definition and Examples",
  "description": "Domain verification: proving control of a domain, often via DNS or HTTP challenges. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Domain verification matters because teams need a precise shared meaning for proving control of a domain, often via DNS or HTTP challenges. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, proving control of a domain, often via DNS or HTTP challenges shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of domain verification is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around creating a TXT record for status.example.com. When observed behavior stops matching the definition of domain verification, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Verification means the site is secure forever", body: ["That reading usually collapses distinct ideas into one slogan. Keep domain verification tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Verification proves control at a moment in time. Keep DNS access tightly controlled."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "managed-tls",
  "term": "Managed TLS",
  "slug": "managed-tls",
  "shortDefinition": "Managed TLS is automatic certificate provisioning and renewal for a hostname you control.",
  "shortAnswer": "Managed TLS describes automatic certificate provisioning and renewal for a hostname you control. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "ssl-dns",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "custom-status-page-domain",
    "ssl-certificate",
    "domain-verification"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "ssl-monitoring"
  ],
  "documentationLinks": [],
  "productLinks": [
    {
      "href": "/features/ssl-monitoring",
      "label": "SSL monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is managed tls",
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
  "title": "What Is Managed TLS? Definition and Examples",
  "description": "Managed TLS: automatic certificate provisioning and renewal for a hostname you control. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "Managed TLS matters because teams need a precise shared meaning for automatic certificate provisioning and renewal for a hostname you control. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, automatic certificate provisioning and renewal for a hostname you control shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of managed tls is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around managed cert for status.example.com. When observed behavior stops matching the definition of managed tls, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "Managed TLS removes the need for DNS", body: ["That reading usually collapses distinct ideas into one slogan. Keep managed tls tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["Fajita can manage TLS for custom status domains after DNS is correct."],
    
  }),
  faqs: undefined,
  formula: undefined,
}),

defineTerm({
  meta: {
  "id": "https-certificate",
  "term": "HTTPS certificate",
  "slug": "https-certificate",
  "shortDefinition": "HTTPS certificate is the certificate presented by a site serving HTTPS.",
  "shortAnswer": "HTTPS certificate describes the certificate presented by a site serving HTTPS. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.",
  "category": "ssl-dns",
  "secondaryCategories": [],
  "synonyms": [],
  "relatedTerms": [
    "ssl-certificate",
    "https-monitoring"
  ],
  "broaderTerms": [],
  "narrowerTerms": [],
  "oppositeTerms": [],
  "confusedWith": [],
  "productAreas": [
    "ssl-monitoring"
  ],
  "documentationLinks": [],
  "productLinks": [
    {
      "href": "/features/ssl-monitoring",
      "label": "SSL monitoring"
    }
  ],
  "searchIntent": "definition",
  "primaryQuery": "what is https certificate",
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
  "title": "What Is HTTPS certificate? Definition and Examples",
  "description": "HTTPS certificate: the certificate presented by a site serving HTTPS. A clear Fajita glossary definition for software teams.",
  "noindex": false,
  "deprecated": false
},
  body: buildTermBody({
    whyItMatters: [
      "HTTPS certificate matters because teams need a precise shared meaning for the certificate presented by a site serving HTTPS. Vague language turns incidents into arguments about words instead of fixes.",
      "When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.",
    ],
    howItWorks: [
      "In practice, the certificate presented by a site serving HTTPS shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.",
      "The useful version of https certificate is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.",
    ],
    example: [
      "Imagine a team operating around certificate for https://www.example.com. When observed behavior stops matching the definition of https certificate, the team treats that change as a reliability event with a clear owner and next step.",
    ],
    misconception: { title: "HTTPS certificates are different from SSL certificates in every case", body: ["That reading usually collapses distinct ideas into one slogan. Keep https certificate tied to observable behavior so the definition stays useful under pressure."] },
    fajita: ["In everyday speech HTTPS certificate and SSL certificate refer to the same operational object."],
    
  }),
  faqs: undefined,
  formula: undefined,
})
];
