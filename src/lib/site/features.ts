/**
 * Typed content source for the features hub and the six feature pages.
 * All customer-facing feature copy lives here, not in components, so a
 * future owner can revise the site's story in one file.
 *
 * Copy voice: /docs/website/public-copy-system.md
 * Claims discipline: statements here must be covered by src/lib/site/claims.ts
 */
import type { BrandIconName } from "@/components/design-system/icons";

export type FeatureSlug =
  | "uptime-monitoring"
  | "api-monitoring"
  | "ssl-monitoring"
  | "cron-monitoring"
  | "status-pages"
  | "incident-communication";

export interface FeatureObjection {
  question: string;
  answer: string;
}

export interface FeatureDefinition {
  slug: FeatureSlug;
  /** Nav and hub label. */
  name: string;
  icon: BrandIconName;
  /** Page H1. */
  headline: string;
  lede: string;
  /** <title> (site suffix added by template). */
  metaTitle: string;
  metaDescription: string;
  /** "What it checks / what failure looks like / what Fajita does / why it matters". */
  facts: { label: string; body: string }[];
  useCases: string[];
  objections: FeatureObjection[];
  related: FeatureSlug[];
}

export const features: Record<FeatureSlug, FeatureDefinition> = {
  "uptime-monitoring": {
    slug: "uptime-monitoring",
    name: "Uptime monitoring",
    icon: "monitor-http",
    headline: "Find the outage before your customers do.",
    lede: "Fajita requests your pages the way a visitor would, on a schedule, and treats every slow or wrong answer as a lead worth chasing.",
    metaTitle: "Website uptime monitoring",
    metaDescription:
      "Fajita checks your websites around the clock: availability, status codes, and response time. Failures are verified before anyone is alerted.",
    facts: [
      {
        label: "What it checks",
        body: "Availability, HTTP status codes, and response time for any public URL. Each check is a real request, not a ping.",
      },
      {
        label: "What failure looks like",
        body: "A timeout, a connection refused, a 500 where a 200 belongs, or a page that answers in four seconds instead of two hundred milliseconds.",
      },
      {
        label: "What Fajita does",
        body: "It re-checks before saying a word. A confirmed failure opens an incident, alerts your channels, and starts the clock on your uptime record.",
      },
      {
        label: "Why it matters",
        body: "Most small teams learn about downtime from a support ticket. The ticket arrives after the damage. A monitor arrives before it.",
      },
    ],
    useCases: [
      "A SaaS founder watching the app, the marketing site, and the docs from one account.",
      "An agency keeping thirty client sites honest without opening thirty dashboards.",
      "A side project that has real users now and no one on call.",
    ],
    objections: [
      {
        question: "Will one flaky network blip page me at 3 a.m.?",
        answer:
          "No. A failed check triggers verification, not an alarm. You hear about confirmed problems only.",
      },
      {
        question: "Do I need to install anything?",
        answer:
          "No agent, no SDK, no code change. Fajita checks from the outside, the same direction your customers arrive from.",
      },
      {
        question: "What happens when a monitor fails?",
        answer:
          "Fajita verifies the failure, opens an incident, alerts your configured channels, and sends one clear recovery message when checks pass again.",
      },
    ],
    related: ["api-monitoring", "ssl-monitoring", "status-pages"],
  },

  "api-monitoring": {
    slug: "api-monitoring",
    name: "API monitoring",
    icon: "monitor-api",
    headline: "A 200 can still be wrong. Check the answer, not just the door.",
    lede: "Assert on status codes, response time, keywords, and JSON values, so a broken endpoint is caught before it reaches the customers who depend on it.",
    metaTitle: "API monitoring",
    metaDescription:
      "Fajita checks API endpoints with status assertions, response-time thresholds, keyword and JSON assertions, and secure request headers.",
    facts: [
      {
        label: "What it checks",
        body: "Any HTTP method against any endpoint. Assert the status code, set a response-time threshold, and require a keyword or a JSON value in the body.",
      },
      {
        label: "What failure looks like",
        body: "An endpoint that returns 200 with an empty body. A payment API that slows from 180 ms to 4 seconds. A deploy that quietly renamed a field.",
      },
      {
        label: "What Fajita does",
        body: "Every assertion failure is treated like downtime: verified first, then routed to your team with the failing check and the response that broke it.",
      },
      {
        label: "Why it matters",
        body: "Your API is the product your integrations buy. The customers it fails do not file tickets. They leave.",
      },
    ],
    useCases: [
      "Asserting that /v1/health returns {\"status\":\"ok\"} and answers under 500 ms.",
      "Watching an authenticated endpoint with a header token that is stored encrypted.",
      "Catching the deploy that changed a response shape before the first integration breaks.",
    ],
    objections: [
      {
        question: "Can Fajita monitor authenticated APIs?",
        answer:
          "Yes. Add request headers, including authorization tokens. Credentials are encrypted at rest and never shown back in full.",
      },
      {
        question: "Is my token safe with a monitoring service?",
        answer:
          "Tokens are stored encrypted and used only to make the checks you configured. Use a scoped, read-only credential where your API supports one.",
      },
      {
        question: "Can I check more than the status code?",
        answer:
          "Yes. Response-time thresholds, keyword assertions, and JSON value assertions all count as pass or fail conditions.",
      },
    ],
    related: ["uptime-monitoring", "cron-monitoring", "incident-communication"],
  },

  "ssl-monitoring": {
    slug: "ssl-monitoring",
    name: "SSL monitoring",
    icon: "monitor-ssl",
    headline: "Do not let a certificate expire in public.",
    lede: "Certificates expire on weekends. Fajita reads the calendar, warns you at a distance, and catches invalid chains before browsers show your customers a warning screen.",
    metaTitle: "SSL certificate monitoring",
    metaDescription:
      "Fajita watches SSL certificates for upcoming expiry and invalid chains, with warnings before customers ever see a browser error.",
    facts: [
      {
        label: "What it checks",
        body: "Certificate expiry dates, validity, and the chain your visitors actually receive.",
      },
      {
        label: "What failure looks like",
        body: "The full-screen browser warning with your name on it. It converts nobody and screenshots forever.",
      },
      {
        label: "What Fajita does",
        body: "Warns at configurable distances before expiry and alerts immediately when a certificate is invalid, so renewal is a task instead of an incident.",
      },
      {
        label: "Why it matters",
        body: "An expired certificate is a total outage with a screenshot. It is also the single most preventable failure in software.",
      },
    ],
    useCases: [
      "Renewal reminders far enough out to fix DNS, CI, or the one machine that issues the cert.",
      "Agencies watching certificate health across every client domain in one list.",
      "Catching an auto-renewal that silently stopped working months ago.",
    ],
    objections: [
      {
        question: "My certificates auto-renew. Why monitor them?",
        answer:
          "Auto-renewal fails quietly: a changed DNS record, a moved server, an expired API key at the issuer. Monitoring catches the failure of the safety net itself.",
      },
      {
        question: "How early can I be warned?",
        answer:
          "You choose the warning thresholds. Set a comfortable distance and a final urgent one.",
      },
    ],
    related: ["uptime-monitoring", "status-pages", "incident-communication"],
  },

  "cron-monitoring": {
    slug: "cron-monitoring",
    name: "Cron monitoring",
    icon: "monitor-cron",
    headline: "Silent jobs deserve loud alarms.",
    lede: "Backups, billing runs, digests, syncs. When a scheduled job stops, nothing errors and nobody notices. Fajita listens for the jobs that stop reporting in.",
    metaTitle: "Cron and heartbeat monitoring",
    metaDescription:
      "Fajita monitors cron jobs and background work through heartbeat URLs and expected schedules, and alerts when a job goes quiet.",
    facts: [
      {
        label: "What it checks",
        body: "Each job gets a private heartbeat URL and an expected schedule. The job pings when it finishes; Fajita watches the clock.",
      },
      {
        label: "What failure looks like",
        body: "Nothing. That is the problem. A dead cron job produces no error, no log line, no page. Just an absence that compounds daily.",
      },
      {
        label: "What Fajita does",
        body: "A missed ping past its grace window counts as a failure: verified, alerted, and recorded like any outage. A resumed ping closes the incident.",
      },
      {
        label: "Why it matters",
        body: "The nightly backup that stopped in March is discovered during the restore in July. Heartbeats turn that discovery into a same-day alert.",
      },
    ],
    useCases: [
      "One curl line at the end of a backup script. That is the whole integration.",
      "Watching a queue worker that must run every five minutes.",
      "Monthly billing runs where a silent skip costs real revenue.",
    ],
    objections: [
      {
        question: "Does Fajita need access to my servers?",
        answer:
          "No. Your job makes an outbound request to its heartbeat URL. Fajita never connects into your infrastructure.",
      },
      {
        question: "What about jobs with loose schedules?",
        answer:
          "Every heartbeat has a grace window. A job that is occasionally slow will not page anyone; a job that is absent will.",
      },
    ],
    related: ["api-monitoring", "uptime-monitoring", "incident-communication"],
  },

  "status-pages": {
    slug: "status-pages",
    name: "Status pages",
    icon: "status-page",
    headline: "The page customers refresh when things go wrong. Make it worthy of them.",
    lede: "A hosted status page with your name on it: components, incident timelines, scheduled maintenance, subscriber updates, and uptime history you can point a sales deck at.",
    metaTitle: "Public status pages",
    metaDescription:
      "Publish a branded public status page with components, incident timelines, scheduled maintenance, subscriber updates, and uptime history.",
    facts: [
      {
        label: "What it shows",
        body: "Live component status, a timeline for every incident, planned maintenance windows, and ninety days of uptime history per component.",
      },
      {
        label: "What failure looks like",
        body: "An outage with no public answer. Customers refresh, guess, and email each other screenshots. Silence reads as not knowing.",
      },
      {
        label: "What Fajita does",
        body: "Incidents from your monitors appear on the page with your updates attached. Subscribers hear about incidents and recoveries without asking.",
      },
      {
        label: "Why it matters",
        body: "Trust is not built by never failing. It is built by being visibly in control when you do.",
      },
    ],
    useCases: [
      "status.yourproduct.com on your own domain, carrying your name and logo.",
      "A support team that answers 'is it down?' with a link instead of a promise.",
      "Uptime history that closes enterprise deals because the proof is public.",
    ],
    objections: [
      {
        question: "Can I use my own domain?",
        answer: "Yes. Point a subdomain at Fajita and the page is yours.",
      },
      {
        question: "Does the page advertise Fajita?",
        answer:
          "Your brand leads. A quiet attribution line sits in the footer; its removal is a plan option published with pricing.",
      },
      {
        question: "Do I have to write updates during an incident?",
        answer:
          "Monitors open and resolve incidents automatically. Your written updates are optional and always stronger. Two calm sentences beat an hour of silence.",
      },
    ],
    related: ["incident-communication", "uptime-monitoring", "ssl-monitoring"],
  },

  "incident-communication": {
    slug: "incident-communication",
    name: "Incident communication",
    icon: "incident",
    headline: "When production breaks, give customers an answer before they start asking.",
    lede: "From confirmed failure to public recovery notice: one incident record, one timeline, every audience informed in the register it needs.",
    metaTitle: "Incident communication",
    metaDescription:
      "Fajita opens incidents from verified failures, routes alerts to your team, publishes customer-facing updates, and records the full timeline.",
    facts: [
      {
        label: "What it does",
        body: "A verified failure opens an incident automatically. The team is alerted, the status page updates, and every action lands on one timeline.",
      },
      {
        label: "What failure looks like",
        body: "Three people debugging in one channel while support improvises answers in another, and nobody remembers afterward what was said to whom.",
      },
      {
        label: "What Fajita does",
        body: "Keeps the internal alert and the public story attached to the same incident. Post an update once; the page and subscribers get it.",
      },
      {
        label: "Why it matters",
        body: "During an incident the scarcest resource is attention. Communication should cost one decision, not a meeting.",
      },
    ],
    useCases: [
      "Auto-created incidents that are already public before the first customer email arrives.",
      "A resolution notice that goes to subscribers the moment checks pass again.",
      "A searchable history of every incident for the postmortem and the renewal call.",
    ],
    objections: [
      {
        question: "Can I edit or add updates manually?",
        answer:
          "Yes. Automatic detection opens and resolves incidents; your own updates can be posted at any point on the timeline.",
      },
      {
        question: "What tone do the automatic messages use?",
        answer:
          "Plain and factual. What happened, what is affected, what happens next. No mascots, no jokes, no blame.",
      },
    ],
    related: ["status-pages", "uptime-monitoring", "api-monitoring"],
  },
};

export const featureOrder: FeatureSlug[] = [
  "uptime-monitoring",
  "api-monitoring",
  "ssl-monitoring",
  "cron-monitoring",
  "status-pages",
  "incident-communication",
];

/** The features hub workflow: watch, verify, alert, communicate, learn. */
export interface WorkflowStage {
  id: string;
  title: string;
  body: string;
  items: { label: string; href?: string }[];
}

export const workflowStages: WorkflowStage[] = [
  {
    id: "watch",
    title: "Watch",
    body: "Real requests against the things that can break, on a schedule that never gets bored.",
    items: [
      { label: "Website monitoring", href: "/features/uptime-monitoring" },
      { label: "API monitoring", href: "/features/api-monitoring" },
      { label: "SSL monitoring", href: "/features/ssl-monitoring" },
      { label: "Cron and heartbeat monitoring", href: "/features/cron-monitoring" },
    ],
  },
  {
    id: "verify",
    title: "Verify",
    body: "One bad request is noise. Fajita re-checks before it says a word, so an alert always means something.",
    items: [
      { label: "Automatic re-checks" },
      { label: "Failure thresholds" },
      { label: "Incident states: verifying, degraded, down, recovering" },
    ],
  },
  {
    id: "alert",
    title: "Alert",
    body: "Confirmed incidents go to the channels your team already watches. Recovery sends one clear all-clear.",
    items: [
      { label: "Email" },
      { label: "Slack" },
      { label: "Discord" },
      { label: "Webhooks" },
    ],
  },
  {
    id: "communicate",
    title: "Communicate",
    body: "The public side of an incident: a status page that answers customers before they ask.",
    items: [
      { label: "Public status pages", href: "/features/status-pages" },
      { label: "Incident timelines", href: "/features/incident-communication" },
      { label: "Scheduled maintenance" },
      { label: "Subscriber updates" },
    ],
  },
  {
    id: "learn",
    title: "Learn",
    body: "What actually happened, over time: the record you bring to the postmortem and the sales call.",
    items: [
      { label: "Uptime history" },
      { label: "Response-time trends" },
      { label: "Incident records" },
      { label: "Data export" },
    ],
  },
];
