import { callout, code, h2, p, table, ul } from "../blocks";
import { defineDoc, type DocPage } from "../types";

const REVIEWED = "2026-07-17";
const PRODUCT_VERSION = "2026.07";

const base = {
  category: "monitors" as const,
  lastReviewedAt: REVIEWED,
  owner: "docs-monitoring",
  reviewers: ["engineering", "product"],
  productVersion: PRODUCT_VERSION,
};

export const monitorsPages: DocPage[] = [
  defineDoc({
    meta: {
      ...base,
      slug: "monitors/website-monitoring",
      title: "Website monitoring",
      description:
        "Monitor an HTTP or HTTPS URL: intervals, redirects, status expectations, keyword checks, and safe destinations.",
      model: "build",
      pageType: "task",
      order: 0,
      requiredPermission: "monitors:manage",
      productArea: ["monitors"],
      keywords: ["website", "http", "https", "url", "uptime", "keyword"],
      relatedPages: ["assertions/keyword", "monitors/retries", "troubleshooting/check-blocked"],
      searchBoost: 2,
    },
    body: [
      h2("Outcome"),
      p("A website monitor checks a public URL on a schedule and verifies the response before opening an incident."),
      h2("Supported URLs"),
      ul([
        "`https://` and `http://` schemes. Prefer HTTPS.",
        "Publicly resolvable hostnames only. Private addresses and `localhost` are blocked for safety.",
      ]),
      code("text", "https://example.com\nhttps://app.example.com/health", "Example endpoints"),
      h2("Request methods"),
      p("Website monitors use `GET` or `HEAD`. Use an API monitor when you need `POST` or a request body."),
      h2("What Fajita checks"),
      ul([
        "The request completed without a transport error.",
        "The status code is one you expect (a success code by default).",
        "The response time is under your threshold, if set.",
        "Any keyword assertions passed. See [Keyword assertions](/docs/assertions/keyword).",
      ]),
      h2("Redirects"),
      p(
        "Fajita follows redirects to a public destination. A redirect to a private or restricted address is treated as a blocked destination, not a success.",
      ),
      h2("Intervals and retries"),
      p(
        "Choose an interval from every minute to every hour. A failed request is retried before verification begins. See [Check intervals](/docs/monitors/check-intervals) and [Retries](/docs/monitors/retries).",
      ),
      callout("security", [
        p(
          "Do not put secrets in the URL query string. Use an authentication header instead, and keep secrets out of monitor names.",
        ),
      ]),
      h2("Pausing and archiving"),
      p(
        "Pause a monitor to stop checks without losing configuration. Archive it to retire it while keeping its history. See [Monitor states](/docs/monitors/monitor-states).",
      ),
    ],
  }),

  defineDoc({
    meta: {
      ...base,
      slug: "monitors/api-monitoring",
      title: "API monitoring",
      description:
        "Monitor a JSON or HTTP API: methods, headers, request bodies, status and JSON assertions, and stored secrets.",
      model: "build",
      pageType: "task",
      order: 1,
      requiredPermission: "monitors:manage",
      productArea: ["monitors", "assertions"],
      keywords: ["api", "json", "post", "headers", "authentication", "endpoint"],
      relatedPages: ["assertions/json-path", "monitors/authenticated-monitoring"],
      searchBoost: 2,
    },
    body: [
      h2("Outcome"),
      p("An API monitor sends a configured request and asserts on the status code, timing, headers, and JSON body."),
      h2("Methods"),
      p("API monitors support `GET`, `HEAD`, and `POST`. Set a request body for `POST`."),
      h2("Headers and authentication"),
      p("Add request headers, including an authorization header. Store the token as a secret so it is encrypted and masked."),
      code(
        "text",
        "Authorization: Bearer YOUR_API_TOKEN\nAccept: application/json",
        "Example request headers (placeholder token)",
      ),
      callout("security", [
        p(
          "`YOUR_API_TOKEN` is a placeholder. Never paste a real token into documentation, a monitor name, or a public component. See [Secret handling](/docs/security/secret-handling).",
        ),
      ]),
      h2("Assertions"),
      table(
        ["Assertion", "Use"],
        [
          ["Status code", "Require an exact code or accepted set"],
          ["Response time", "Fail or degrade past a threshold in milliseconds"],
          ["Header equals", "Require a response header value"],
          ["JSON path", "Check a value inside the JSON body"],
        ],
      ),
      p("For JSON checks, see [JSON path assertions](/docs/assertions/json-path)."),
      h2("Timeouts"),
      p("A request that does not complete within the monitor's timeout is a failure. The default timeout is 10 seconds."),
      h2("Example health endpoint"),
      code(
        "json",
        '{\n  "status": "ok",\n  "version": "2026.07",\n  "checks": { "database": "ok" }\n}',
        "A minimal health response",
      ),
    ],
  }),

  defineDoc({
    meta: {
      ...base,
      slug: "monitors/authenticated-monitoring",
      title: "Authenticated monitoring",
      description:
        "How Fajita stores and uses monitor secrets, which values are masked, and how header rules protect credentials.",
      model: "learn",
      pageType: "concept",
      order: 2,
      productArea: ["monitors", "security"],
      keywords: ["authenticated", "secret", "token", "header", "credentials", "rotation"],
      relatedPages: ["security/secret-handling", "monitors/api-monitoring"],
    },
    body: [
      p("Some endpoints require credentials. Fajita stores supported monitor secrets encrypted and uses them only for server-side checks."),
      h2("How secrets are handled"),
      ul([
        "Fajita encrypts supported monitor secrets at rest and limits decryption to authorized server-side monitoring operations.",
        "After you save a secret, its value is masked in the interface. You can replace it, not read it back.",
        "Manual tests use the stored secret so a test reflects real behavior.",
      ]),
      h2("Header rules"),
      ul([
        "You set an authorization header with your token.",
        "Certain protocol headers are managed by Fajita and cannot be overridden.",
        "On a redirect to a different origin, authorization headers are not forwarded.",
      ]),
      h2("Rotation"),
      p("Rotate a credential by replacing the stored secret. The next check uses the new value. Old values are not retained in check history."),
      callout("security", [
        p("Secrets are never written to check logs, alert payloads, or public status content."),
      ]),
    ],
  }),

  defineDoc({
    meta: {
      ...base,
      slug: "monitors/ssl-monitoring",
      title: "SSL monitoring",
      description:
        "Watch a TLS certificate for expiry, hostname mismatch, and chain errors, with warning and critical thresholds.",
      model: "build",
      pageType: "task",
      order: 3,
      requiredPermission: "monitors:manage",
      productArea: ["monitors"],
      keywords: ["ssl", "tls", "certificate", "expiry", "expiration", "https"],
      relatedPages: ["webhooks/event-types"],
    },
    body: [
      h2("Outcome"),
      p("An SSL monitor tracks a certificate's validity and warns you before it expires."),
      h2("What it checks"),
      ul([
        "The certificate is valid and trusted.",
        "The hostname matches the certificate.",
        "The chain resolves without errors.",
        "Days remaining until expiry, against your thresholds.",
      ]),
      h2("Thresholds"),
      p("Set a warning threshold and a critical threshold in days. Crossing the critical threshold opens an incident and can emit an SSL event."),
      h2("Renewal"),
      p("When a renewed certificate is detected, the expiry-based state clears automatically. Fajita deduplicates repeated expiry alerts for the same certificate."),
      callout("note", [
        p(
          "A valid certificate does not mean the application works. An HTTP monitor and an SSL monitor measure different risks. Run both for a public endpoint.",
        ),
      ]),
    ],
  }),

  defineDoc({
    meta: {
      ...base,
      slug: "monitors/heartbeat-monitoring",
      title: "Heartbeat monitoring",
      description:
        "Monitor a cron job or scheduled task by having it check in to a unique URL within an expected interval.",
      model: "build",
      pageType: "task",
      order: 4,
      requiredPermission: "monitors:manage",
      productArea: ["monitors"],
      keywords: ["heartbeat", "cron", "job", "scheduled task", "check-in", "curl"],
      relatedPages: ["security/secret-handling"],
      searchBoost: 2,
    },
    body: [
      h2("Outcome"),
      p("A heartbeat monitor expects your job to send a request on a schedule. When the check-in is late or missing, Fajita alerts you."),
      h2("How it works"),
      ul([
        "Fajita gives the monitor a unique heartbeat URL with a token.",
        "Your job sends a request to that URL at the end of a successful run.",
        "You set an expected interval and a grace period.",
        "A missing check-in past the grace period marks the monitor missed and can open an incident.",
      ]),
      h2("Send a heartbeat"),
      code(
        "bash",
        'curl --fail --silent --show-error "https://heartbeat.fajita.io/REPLACE_WITH_TOKEN"',
        "End your job with a check-in",
      ),
      h2("Cron example"),
      code(
        "bash",
        '# Run a backup, then check in only if it succeeded\n0 2 * * * /usr/local/bin/backup.sh && curl -fsS "https://heartbeat.fajita.io/REPLACE_WITH_TOKEN"',
        "crontab",
      ),
      callout("security", [
        p(
          "Treat the heartbeat URL like a secret. Do not commit it to a public repository. Rotate the token if it leaks.",
        ),
      ]),
      h2("States"),
      p("A heartbeat monitor is `healthy` while check-ins arrive on time, and `missed` once one is overdue past the grace period. Deleting the monitor revokes its token."),
    ],
  }),

  defineDoc({
    meta: {
      ...base,
      slug: "monitors/check-intervals",
      title: "Check intervals",
      description: "The available check intervals and how interval choice affects detection speed and volume.",
      model: "learn",
      pageType: "reference",
      order: 5,
      productArea: ["monitors"],
      keywords: ["interval", "frequency", "how often", "schedule"],
      relatedPages: ["monitors/retries", "billing/usage-limits"],
    },
    body: [
      p("A monitor's interval sets how often a scheduled check runs."),
      h2("Available intervals"),
      table(
        ["Interval", "Checks per hour"],
        [
          ["1 minute", "60"],
          ["5 minutes", "12"],
          ["10 minutes", "6"],
          ["15 minutes", "4"],
          ["30 minutes", "2"],
          ["1 hour", "1"],
        ],
      ),
      callout("note", [
        p("A shorter interval detects problems sooner and consumes more check volume. Availability of the shortest intervals can depend on your plan."),
      ]),
    ],
  }),

  defineDoc({
    meta: {
      ...base,
      slug: "monitors/retries",
      title: "Retries",
      description: "How a failed request is retried before verification begins, and why retries appear in history.",
      model: "learn",
      pageType: "concept",
      order: 6,
      productArea: ["monitors", "incidents"],
      keywords: ["retry", "retries", "transient", "flaky", "backoff"],
      relatedPages: ["incidents/verification"],
    },
    body: [
      p("A retry answers a narrow question: was one failed request just a blip?"),
      h2("How retries work"),
      ul([
        "When a scheduled check fails, Fajita retries the request after a short delay.",
        "The default is one retry; you can set up to five.",
        "Both the failure and the retry are recorded in history.",
      ]),
      callout("note", [
        p(
          "Retries are not the same as incident verification. A retry decides whether a single request was temporary. Verification decides whether the service is meaningfully unhealthy. See [Retries and verification](/docs/incidents/verification).",
        ),
      ]),
    ],
  }),

  defineDoc({
    meta: {
      ...base,
      slug: "monitors/monitor-states",
      title: "Monitor states",
      description: "The lifecycle states a monitor moves through, from draft to active, paused, archived, and deleted.",
      model: "reference",
      pageType: "reference",
      order: 7,
      productArea: ["monitors"],
      keywords: ["states", "status", "draft", "active", "paused", "archived", "lifecycle"],
      relatedPages: ["reference/monitor-states", "incidents/degraded-vs-down"],
    },
    body: [
      p("A monitor has a lifecycle state (is it running?) separate from its operational state (is the target healthy?)."),
      h2("Lifecycle states"),
      table(
        ["State", "Meaning"],
        [
          ["Draft", "Created but not yet activated. No scheduled checks."],
          ["Active", "Running on its schedule."],
          ["Paused", "Temporarily stopped. Configuration and history are kept."],
          ["Archived", "Retired. History is preserved, no new checks."],
          ["Pending deletion / Deleted", "Scheduled for removal, then removed."],
        ],
      ),
      p("For operational states like operational, degraded, and down, see [Monitor and incident states reference](/docs/reference/monitor-states)."),
    ],
  }),
];
