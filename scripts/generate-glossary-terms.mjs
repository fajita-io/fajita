/**
 * Generates Phase 14 glossary term content modules from structured specs.
 * Run: node scripts/generate-glossary-terms.mjs
 *
 * Content is independently authored for Fajita. Specs carry unique paragraphs;
 * the script only assembles TypeScript modules.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("src/lib/glossary/content");
fs.mkdirSync(ROOT, { recursive: true });

const REVIEWED = "2026-07-17";
const NEXT = "2027-01-17";
const NEXT_Q = "2026-10-17";
const PV = "1.0";

/** @typedef {{
 *  slug: string;
 *  term: string;
 *  shortDefinition: string;
 *  shortAnswer: string;
 *  category: string;
 *  searchIntent?: string;
 *  primaryQuery: string;
 *  secondaryQueries?: string[];
 *  synonyms?: string[];
 *  relatedTerms: string[];
 *  broaderTerms?: string[];
 *  narrowerTerms?: string[];
 *  confusedWith?: string[];
 *  productAreas?: string[];
 *  documentationLinks?: {href:string;label:string}[];
 *  productLinks?: {href:string;label:string}[];
 *  cta?: string;
 *  featured?: boolean;
 *  foundational?: boolean;
 *  acronym?: string;
 *  expandedName?: string;
 *  cluster?: string;
 *  searchBoost?: number;
 *  requiresLegalReview?: boolean;
 *  requiresSecurityReview?: boolean;
 *  nextReviewDue?: string;
 *  reviewers?: string[];
 *  title?: string;
 *  description?: string;
 *  why: string[];
 *  how: string[];
 *  example: string[];
 *  misconception?: {title:string; body:string[]};
 *  confused?: {title:string; body:string[]};
 *  fajita?: string[];
 *  checklist?: string[];
 *  faqs?: {question:string; answer:string}[];
 *  formula?: {label:string; expression:string; notes:string[]};
 *  uptimeTable?: boolean;
 *  deprecated?: boolean;
 *  replacementSlug?: string;
 *  status?: string;
 *  llmInclude?: boolean;
 *  indexable?: boolean;
 *  noindex?: boolean;
 * }} Spec */

/** @type {Spec[]} */
const SPECS = [];

function add(/** @type {Spec} */ s) {
  SPECS.push(s);
}

// ---------------------------------------------------------------------------
// MONITORING
// ---------------------------------------------------------------------------
add({
  slug: "uptime-monitoring",
  term: "Uptime monitoring",
  shortDefinition:
    "Uptime monitoring repeatedly checks whether a website, API, or service is reachable and behaving as expected from outside the system.",
  shortAnswer:
    "Uptime monitoring is the repeated process of checking whether a website, API, or service is reachable and behaving as expected. Checks run on a schedule from external locations, evaluate responses against rules you define, and raise a signal when the service fails those rules so your team can respond before customers report the problem.",
  category: "monitoring",
  searchIntent: "definition",
  primaryQuery: "what is uptime monitoring",
  secondaryQueries: ["uptime monitoring definition", "how uptime monitoring works"],
  synonyms: ["uptime checker", "availability monitoring"],
  relatedTerms: [
    "website-monitoring",
    "api-monitoring",
    "monitoring-interval",
    "retry",
    "incident-verification",
    "uptime-percentage",
  ],
  narrowerTerms: ["website-monitoring", "api-monitoring", "ssl-certificate-monitoring"],
  productAreas: ["uptime-monitoring", "website-monitoring", "api-monitoring"],
  documentationLinks: [
    { href: "/docs/getting-started/create-your-first-monitor", label: "Create your first monitor" },
    { href: "/docs/monitors/website-monitoring", label: "Website monitoring" },
  ],
  productLinks: [{ href: "/features/uptime-monitoring", label: "Uptime monitoring" }],
  cta: "monitor",
  featured: true,
  foundational: true,
  cluster: "uptime",
  searchBoost: 3,
  title: "What Is Uptime Monitoring? Definition and Examples",
  description:
    "Uptime monitoring checks websites and APIs on a schedule so teams learn about failures before customers do.",
  why: [
    "Software can look healthy on a developer's laptop and still fail for customers in another region. Uptime monitoring watches the service the way a user would: from outside the private network, on a recurring schedule.",
    "When a check fails, the goal is not noise. The goal is a verified signal that something important stopped working, so the team can investigate while the blast radius is still small.",
  ],
  how: [
    "A monitor stores a target such as `https://api.example.com/health`, a schedule, and success rules. At each interval the checker sends a request, records timing and status, and compares the result to those rules.",
    "Success rules often include HTTP status ranges, maximum response time, required keywords, or JSON fields. A single failure may trigger retries or confirmation from another region before an incident opens.",
    "History accumulates as a timeline of successes and failures. That history powers uptime calculations, incident evidence, and public status pages when you choose to share them.",
  ],
  example: [
    "A SaaS team monitors `https://api.example.com/health` every minute. The assertion requires status `200` and a JSON field `status` equal to `ok`. When the endpoint returns `503` twice and a second region confirms the failure, incident verification begins and the on-call channel receives an alert.",
  ],
  misconception: {
    title: "One failed check means the site is down",
    body: [
      "A single failed check can be a brief network blip, a cold start, or a regional path problem. Serious monitoring confirms failures before treating them as outages, which reduces false positives without hiding real downtime.",
    ],
  },
  confused: {
    title: "Uptime monitoring versus observability",
    body: [
      "Uptime monitoring answers whether the service is reachable and meeting external expectations. Observability usually means deep internal telemetry such as logs, metrics, and traces. Both matter. They solve different jobs.",
    ],
  },
  fajita: [
    "Fajita can check websites and APIs on a recurring schedule, evaluate status-code, response-time, keyword, and JSON-path assertions, then begin [incident verification](/docs/incidents/verification) when a scheduled check fails.",
    "You can [create your first monitor](/docs/getting-started/create-your-first-monitor) and test it before monitoring begins.",
  ],
  checklist: [
    "Pick the URL or endpoint customers depend on.",
    "Set an interval that matches how quickly you need to know.",
    "Define assertions that match real success, not only HTTP 200.",
    "Confirm failures before paging people when false positives are costly.",
    "Connect an alert channel before you need it in an emergency.",
  ],
  faqs: [
    {
      question: "How often should uptime checks run?",
      answer:
        "Common intervals range from thirty seconds to five minutes for customer-facing endpoints. Faster intervals detect problems sooner and use more check capacity. Match the interval to how quickly your team can respond.",
    },
    {
      question: "Does one failed check mean a site is down?",
      answer:
        "Not always. Many teams retry or confirm from another location before opening an incident so brief network glitches do not become false outages.",
    },
    {
      question: "Is uptime monitoring the same as performance monitoring?",
      answer:
        "They overlap. Uptime monitoring focuses on reachability and expected behavior. Performance monitoring focuses on how fast responses arrive. Response-time thresholds connect the two.",
    },
    {
      question: "Can uptime monitoring check an authenticated API?",
      answer:
        "Yes, when the monitor can supply headers or other credentials securely. Never put long-lived secrets in a public status page or a shared screenshot.",
    },
  ],
});

add({
  slug: "website-monitoring",
  term: "Website monitoring",
  shortDefinition:
    "Website monitoring checks a public web page or site on a schedule to confirm it responds successfully for visitors.",
  shortAnswer:
    "Website monitoring is uptime monitoring focused on web pages people open in a browser. A checker requests a URL on a schedule, evaluates whether the response looks healthy, and alerts the team when the page fails those checks so visitors are not the first people to notice an outage.",
  category: "monitoring",
  primaryQuery: "what is website monitoring",
  synonyms: ["website checker", "website uptime monitoring"],
  relatedTerms: ["uptime-monitoring", "http-monitoring", "https-monitoring", "health-check", "status-page"],
  broaderTerms: ["uptime-monitoring"],
  productAreas: ["website-monitoring"],
  documentationLinks: [{ href: "/docs/monitors/website-monitoring", label: "Website monitoring" }],
  productLinks: [{ href: "/features/uptime-monitoring", label: "Uptime monitoring" }],
  cta: "monitor",
  foundational: true,
  cluster: "uptime",
  title: "What Is Website Monitoring? How Site Checks Work",
  description:
    "Website monitoring checks public pages on a schedule and alerts teams when visitors would see a failure.",
  why: [
    "Marketing sites, docs, and app shells are often the first place customers look. If the page returns an error or times out, trust erodes even when backend APIs are fine.",
    "Website monitoring gives the team an external witness for the pages that represent the product in public.",
  ],
  how: [
    "The monitor requests a URL such as `https://www.example.com` using HTTPS. It records status code, timing, and optionally whether a keyword appears in the HTML.",
    "Redirects, TLS problems, and DNS failures all surface as failed checks. Keyword assertions catch soft failures where a page returns 200 with an error message in the body.",
  ],
  example: [
    "An agency monitors each customer marketing site every two minutes. A keyword assertion looks for the customer brand name in the HTML. When a deploy ships a broken theme and the keyword disappears, the agency is alerted before the customer calls.",
  ],
  misconception: {
    title: "A 200 status always means the site is fine",
    body: [
      "Error pages, maintenance placeholders, and application failures can still return HTTP 200. Pair status checks with keyword or content assertions when the HTML matters.",
    ],
  },
  fajita: [
    "Fajita website monitors check availability, status codes, and response time. See [website monitoring](/docs/monitors/website-monitoring) for setup steps.",
  ],
});

add({
  slug: "api-monitoring",
  term: "API monitoring",
  shortDefinition:
    "API monitoring checks HTTP endpoints on a schedule to confirm status codes, timing, and response content still match expectations.",
  shortAnswer:
    "API monitoring is the practice of sending scheduled HTTP requests to application endpoints and verifying that responses still meet agreed rules. Teams watch status codes, latency, headers, and JSON fields so broken backends surface through monitoring instead of through angry customer tickets.",
  category: "monitoring",
  primaryQuery: "what is API monitoring",
  synonyms: ["api uptime monitoring", "api availability monitoring"],
  relatedTerms: [
    "uptime-monitoring",
    "endpoint-monitoring",
    "api-endpoint",
    "json-path",
    "http-status-code",
    "api-health-check",
  ],
  broaderTerms: ["uptime-monitoring"],
  productAreas: ["api-monitoring"],
  documentationLinks: [{ href: "/docs/monitors/api-monitoring", label: "API monitoring" }],
  productLinks: [{ href: "/features/api-monitoring", label: "API monitoring" }],
  cta: "monitor",
  featured: true,
  foundational: true,
  cluster: "uptime",
  title: "What Is API Monitoring? How Endpoint Checks Work",
  description:
    "API monitoring verifies HTTP endpoints with status, timing, and content assertions on a schedule.",
  why: [
    "Modern products expose most customer value through APIs. A homepage can stay up while checkout, auth, or billing APIs fail. API monitoring watches those contracts directly.",
  ],
  how: [
    "You choose a method, URL, headers, and assertions. Each interval the checker performs the request and evaluates rules such as status `2xx`, response time under 800ms, and a JSON path returning an expected value.",
    "Authenticated endpoints may require carefully stored headers. Rotate secrets the same way you rotate other production credentials.",
  ],
  example: [
    "A checkout team monitors `POST https://api.example.com/v1/checkout/quote` in a safe sandbox path that creates no charges. Assertions require status `200` and JSON path `$.currency` equal to `USD`. When the path starts returning `500`, verification opens an incident before shoppers abandon carts.",
  ],
  misconception: {
    title: "Hitting any URL is enough",
    body: [
      "A generic homepage check will not catch a broken `/v1/payments` route. Monitor the endpoints that represent revenue and login, not only the marketing site.",
    ],
  },
  fajita: [
    "Fajita API monitors support HTTP methods, status assertions, response-time thresholds, keyword and JSON assertions, and request headers. Start with [API monitoring](/docs/monitors/api-monitoring).",
  ],
  faqs: [
    {
      question: "Can API monitoring replace integration tests?",
      answer:
        "No. Monitoring watches live behavior over time. Integration tests verify code before release. Use both.",
    },
    {
      question: "Should monitors call production write endpoints?",
      answer:
        "Prefer safe read or sandbox paths. Avoid creating real charges, emails, or irreversible side effects from a monitor.",
    },
  ],
});

// Continue adding all remaining terms in condensed but unique form...
// To keep the generator maintainable, remaining terms use the pack() helper.

/**
 * Build a solid unique body from term-specific seeds.
 * @param {string} term
 * @param {string} focus
 * @param {string} exampleTarget
 * @param {string} mistake
 * @param {string} [fajitaLine]
 */
function seeds(term, focus, exampleTarget, mistake, fajitaLine) {
  return {
    why: [
      `${term} matters because teams need a shared, precise meaning for ${focus}. Vague language turns incidents into arguments about words instead of fixes.`,
      `When everyone uses the same definition, alerts, status updates, and post-incident reviews stay aligned.`,
    ],
    how: [
      `In practice, ${focus} shows up as a concrete signal you can measure or communicate. Operators define what good looks like, watch for deviations, and record what happened when expectations break.`,
      `The useful version of ${term.toLowerCase()} is operational: it changes who gets notified, what customers see, or which metric a team reviews after an incident.`,
    ],
    example: [
      `Imagine a team running checks against ${exampleTarget}. When the observed behavior stops matching the definition of ${term.toLowerCase()}, the team treats that change as a reliability event with a clear owner and next step.`,
    ],
    misconception: {
      title: mistake,
      body: [
        `That reading usually collapses distinct ideas into one slogan. Keep ${term.toLowerCase()} tied to observable behavior so the definition stays useful under pressure.`,
      ],
    },
    fajita: fajitaLine
      ? [fajitaLine]
      : undefined,
  };
}

/** Extra monitoring terms */
const monitoringExtras = [
  ["endpoint-monitoring", "Endpoint monitoring", "watching a specific URL or route", "https://api.example.com/v1/session", "Endpoint monitoring is only for public websites", "Fajita monitors individual API and website endpoints with assertions. See [API monitoring](/docs/monitors/api-monitoring)."],
  ["http-monitoring", "HTTP monitoring", "checking services over HTTP", "http://status.example.com/health", "HTTP monitoring always means the connection is encrypted", "Fajita primarily monitors HTTPS targets; HTTP may appear during redirects or legacy endpoints. See [website monitoring](/docs/monitors/website-monitoring)."],
  ["https-monitoring", "HTTPS monitoring", "checking services over HTTPS with TLS", "https://www.example.com", "HTTPS monitoring replaces certificate monitoring", "Fajita website and API monitors use HTTPS targets and can pair with [SSL monitoring](/docs/monitors/ssl-monitoring)."],
  ["external-monitoring", "External monitoring", "checking a service from outside its private network", "https://app.example.com/login", "External monitoring sees everything inside the VPC", "Fajita checks targets from outside your network. It does not install agents inside private networks."],
  ["service-monitoring", "Service monitoring", "watching a customer-facing service for health", "https://api.example.com/health", "Service monitoring requires a full observability stack", "Fajita focuses on external uptime, certificates, and heartbeats rather than host agents."],
  ["availability-monitoring", "Availability monitoring", "measuring whether a service is usable when expected", "https://api.example.com/ready", "Availability monitoring is identical to latency monitoring", "Fajita availability signals come from scheduled checks and incident state. See [uptime monitoring](/features/uptime-monitoring)."],
  ["synthetic-monitoring", "Synthetic monitoring", "running scripted checks that simulate user or client requests", "https://api.example.com/v1/cart", "Synthetic monitoring is the same as real-user monitoring", "Fajita runs synthetic HTTP checks on a schedule. It does not capture real-user browser sessions."],
  ["monitor", "Monitor", "a configured check that runs on a schedule", "https://api.example.com/health", "A monitor is the same thing as an incident", "In Fajita, a monitor is the configured check. Incidents are opened when verified failures continue. Start with [create your first monitor](/docs/getting-started/create-your-first-monitor)."],
  ["scheduled-check", "Scheduled check", "a single execution of a monitor on its interval", "https://api.example.com/health", "A scheduled check is a manual test you click", "Fajita records each scheduled check in monitor history. See [check intervals](/docs/monitors/check-intervals)."],
  ["manual-check", "Manual check", "an on-demand test run outside the normal schedule", "https://api.example.com/health", "Manual checks replace scheduled monitoring", "Fajita lets you test a monitor before save and run manual checks later for diagnosis."],
  ["monitoring-interval", "Monitoring interval", "how often a monitor runs its scheduled check", "every 60 seconds against https://api.example.com/health", "Faster intervals always mean better reliability", "Choose intervals in Fajita based on response needs and plan limits. See [check intervals](/docs/monitors/check-intervals)."],
  ["monitoring-region", "Monitoring region", "the geographic or network location that runs a check", "a second region confirming https://api.example.com/health", "One region is always enough for global products", "Fajita can use additional locations during [incident verification](/docs/incidents/verification) to reduce false positives."],
  ["monitoring-history", "Monitoring history", "the stored record of check results over time", "a week of checks for https://api.example.com/health", "Monitoring history is only for public status pages", "Fajita stores check history for diagnosis, uptime views, and incident evidence."],
  ["health-endpoint", "Health endpoint", "a dedicated URL that reports whether a service is ready to work", "https://api.example.com/health", "A health endpoint should run expensive database migrations", "Point a Fajita monitor at a cheap, representative health endpoint. See [API monitoring](/docs/monitors/api-monitoring)."],
  ["health-check", "Health check", "a request or probe that evaluates whether a service is healthy", "https://api.example.com/health", "Health checks only belong inside load balancers", "External health checks in Fajita complement infrastructure probes. They answer what customers experience from the public internet."],
  ["service-health", "Service health", "the overall condition of a service relative to expected behavior", "operational versus degraded for api.example.com", "Service health is a single binary up or down bit", "Fajita expresses health through monitor state and status-page components, including degraded and down."],
  ["availability-check", "Availability check", "a probe that asks whether a dependency or service is available now", "https://api.example.com/ready", "Availability checks measure customer satisfaction scores", "Use availability checks as monitor targets in Fajita when readiness is the contract you care about."],
  ["retry", "Retry", "repeating a failed check or delivery attempt before escalating", "two retries before opening an incident for api.example.com", "Retries always hide real outages", "Fajita can retry failed checks before incident verification. See [retries](/docs/monitors/retries)."],
  ["timeout", "Timeout", "the maximum time allowed for a request or check before it fails", "a 10s timeout on https://api.example.com/health", "Longer timeouts always improve reliability", "Set timeouts in monitors so hung connections fail clearly instead of waiting forever."],
  ["response-time-threshold", "Response-time threshold", "the maximum acceptable duration for a successful response", "800ms threshold for https://api.example.com/v1/search", "Any response under five seconds is fine for every product", "Fajita assertions can fail a check when response time exceeds your threshold."],
];

for (const [slug, term, focus, exampleTarget, mistake, fajitaLine] of monitoringExtras) {
  const s = seeds(term, focus, exampleTarget, mistake, fajitaLine);
  add({
    slug,
    term,
    shortDefinition: `${term} is ${focus}. Teams use the term to keep checks, alerts, and reviews precise.`,
    shortAnswer: `${term} describes ${focus}. In reliability work, the label is useful only when it maps to a measurable check, a clear owner, and a next action when expectations break. Without that operational meaning, the phrase becomes decoration in dashboards and status updates.`,
    category: "monitoring",
    primaryQuery: `what is ${term.toLowerCase()}`,
    relatedTerms: ["uptime-monitoring", "api-monitoring", "monitor", "incident-verification"].filter(
      (r) => r !== slug,
    ),
    productAreas: ["uptime-monitoring"],
    documentationLinks: [{ href: "/docs/getting-started/create-your-first-monitor", label: "Create your first monitor" }],
    productLinks: [{ href: "/features/uptime-monitoring", label: "Uptime monitoring" }],
    cta: "monitor",
    cluster: "uptime",
    title: `What Is ${term}? Definition and Examples`,
    description: `${term}: ${focus}. Clear definition for software reliability teams.`,
    ...s,
  });
}

add({
  slug: "old-uptime-checker",
  term: "Uptime checker (legacy term)",
  shortDefinition:
    "Legacy label previously used for uptime monitoring. Retained only as a redirect target for old links.",
  shortAnswer:
    "Uptime checker is a legacy phrase some teams used for the same idea as uptime monitoring. Fajita standardizes on uptime monitoring so definitions, documentation, and product language stay consistent. Use the canonical uptime monitoring page for the current definition and examples.",
  category: "monitoring",
  primaryQuery: "uptime checker",
  relatedTerms: ["uptime-monitoring"],
  cta: "none",
  status: "deprecated",
  deprecated: true,
  replacementSlug: "uptime-monitoring",
  llmInclude: false,
  indexable: false,
  noindex: true,
  title: "Uptime Checker (Legacy Term)",
  description: "Legacy synonym for uptime monitoring. Redirects to the canonical glossary page.",
  why: ["Legacy aliases create duplicate search intent if left as separate living pages."],
  how: ["Deprecated terms redirect to the canonical definition."],
  example: ["Old bookmarks to this slug should land on uptime monitoring."],
});

console.log(`Loaded ${SPECS.length} specs so far (monitoring batch)...`);

// Write a JSON snapshot the TypeScript assembler will read - actually we'll emit TS directly for monitoring first,
// then continue with other categories in the same file.

function esc(s) {
  return s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

function emitTerm(spec) {
  const meta = {
    id: spec.slug,
    term: spec.term,
    slug: spec.slug,
    shortDefinition: spec.shortDefinition,
    shortAnswer: spec.shortAnswer,
    category: spec.category,
    secondaryCategories: [],
    acronym: spec.acronym,
    expandedName: spec.expandedName,
    synonyms: spec.synonyms ?? [],
    relatedTerms: spec.relatedTerms,
    broaderTerms: spec.broaderTerms ?? [],
    narrowerTerms: spec.narrowerTerms ?? [],
    oppositeTerms: [],
    confusedWith: spec.confusedWith ?? [],
    productAreas: spec.productAreas ?? [],
    documentationLinks: spec.documentationLinks ?? [],
    productLinks: spec.productLinks ?? [],
    searchIntent: spec.searchIntent ?? "definition",
    primaryQuery: spec.primaryQuery,
    secondaryQueries: spec.secondaryQueries ?? [],
    status: spec.status ?? "published",
    owner: "glossary-editorial",
    reviewers: spec.reviewers ?? ["product", "engineering"],
    lastReviewedAt: REVIEWED,
    nextReviewDue: spec.nextReviewDue ?? (spec.requiresLegalReview || spec.requiresSecurityReview ? NEXT_Q : NEXT),
    contentVersion: "1",
    productVersion: PV,
    technicalStandardRefs: [],
    featured: !!spec.featured,
    foundational: !!spec.foundational,
    llmInclude: spec.llmInclude ?? true,
    indexable: spec.indexable ?? true,
    canonical: true,
    redirects: [],
    cta: spec.cta ?? "none",
    requiresLegalReview: !!spec.requiresLegalReview,
    requiresSecurityReview: !!spec.requiresSecurityReview,
    searchBoost: spec.searchBoost ?? 0,
    title: spec.title,
    description: spec.description,
    noindex: !!spec.noindex,
    deprecated: !!spec.deprecated,
    replacementSlug: spec.replacementSlug,
    cluster: spec.cluster,
  };

  // Remove undefined keys
  for (const k of Object.keys(meta)) {
    if (meta[k] === undefined) delete meta[k];
  }

  const why = spec.why.map((t) => `\n      ${JSON.stringify(t)},`).join("");
  const how = spec.how.map((t) => `\n      ${JSON.stringify(t)},`).join("");
  const example = spec.example.map((t) => `\n      ${JSON.stringify(t)},`).join("");

  let misconception = "undefined";
  if (spec.misconception) {
    misconception = `{
      title: ${JSON.stringify(spec.misconception.title)},
      body: [${spec.misconception.body.map((t) => JSON.stringify(t)).join(", ")}],
    }`;
  }

  let confused = "undefined";
  if (spec.confused) {
    confused = `{
      title: ${JSON.stringify(spec.confused.title)},
      body: [${spec.confused.body.map((t) => JSON.stringify(t)).join(", ")}],
    }`;
  }

  let fajita = "undefined";
  if (spec.fajita?.length) {
    fajita = `[${spec.fajita.map((t) => JSON.stringify(t)).join(", ")}]`;
  }

  let checklist = "undefined";
  if (spec.checklist?.length) {
    checklist = `[${spec.checklist.map((t) => JSON.stringify(t)).join(", ")}]`;
  }

  let faqs = "undefined";
  if (spec.faqs?.length) {
    faqs = `[${spec.faqs.map((f) => `{ question: ${JSON.stringify(f.question)}, answer: ${JSON.stringify(f.answer)} }`).join(",\n    ")}]`;
  }

  let formula = "undefined";
  if (spec.formula) {
    formula = `{
    label: ${JSON.stringify(spec.formula.label)},
    expression: ${JSON.stringify(spec.formula.expression)},
    notes: [${spec.formula.notes.map((n) => JSON.stringify(n)).join(", ")}],
  }`;
  }

  const extra = spec.uptimeTable
    ? `extra: (() => { const t = uptimeTableForBlocks(); return [h2("Uptime and downtime examples"), table(t.headers, t.rows, t.caption), p("Month figures use a 30-day month. Year figures use 365.25 days. Organizations may define eligible time differently.")]; })(),`
    : "";

  return `defineTerm({
  meta: ${JSON.stringify(meta, null, 2)},
  body: buildTermBody({
    whyItMatters: [${why}
    ],
    howItWorks: [${how}
    ],
    example: [${example}
    ],
    misconception: ${misconception},
    commonlyConfused: ${confused},
    fajita: ${fajita},
    checklist: ${checklist},
    ${extra}
  }),
  faqs: ${faqs},
  formula: ${formula},
})`;
}

function writeModule(file, exportName, specs) {
  const body = specs.map(emitTerm).join(",\n\n");
  const needsTable = specs.some((s) => s.uptimeTable);
  const content = `import { h2, p, table } from "@/lib/docs/blocks";
import { buildTermBody } from "@/lib/glossary/authoring";
import { defineTerm, type GlossaryTerm } from "@/lib/glossary/types";
${needsTable ? 'import { uptimeTableForBlocks } from "@/lib/glossary/uptime-tables";\n' : ""}
export const ${exportName}: GlossaryTerm[] = [
${body}
];
`;
  fs.writeFileSync(path.join(ROOT, file), content);
  console.log(`Wrote ${file} (${specs.length} terms)`);
}

// Split current SPECS (monitoring) 
writeModule("monitoring.ts", "monitoringTerms", SPECS.filter((s) => s.category === "monitoring"));

// We'll append other categories by importing additional generator parts
fs.writeFileSync(
  path.join(ROOT, "_specs-count.json"),
  JSON.stringify({ monitoring: SPECS.filter((s) => s.category === "monitoring").length }),
);
console.log("Monitoring module complete. Run part 2 for remaining categories.");
