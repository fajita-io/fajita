import { callout, code, diagram, h2, ol, p, steps, table, ul } from "../blocks";
import { defineDoc, type DocPage } from "../types";

const REVIEWED = "2026-07-17";
const PRODUCT_VERSION = "2026.07";

export const gettingStartedPages: DocPage[] = [
  defineDoc({
    meta: {
      slug: "getting-started/what-fajita-monitors",
      title: "What Fajita monitors",
      description:
        "The four things Fajita watches, how a check becomes an incident, and what you can build in your first session.",
      category: "getting-started",
      model: "learn",
      pageType: "overview",
      order: 0,
      difficulty: "intro",
      estimatedTime: "4 min",
      productArea: ["monitors", "incidents"],
      keywords: ["overview", "what is fajita", "monitoring", "getting started"],
      relatedPages: ["getting-started/create-your-first-monitor", "monitors/website-monitoring"],
      lastReviewedAt: REVIEWED,
      owner: "docs-product",
      reviewers: ["engineering", "product"],
      productVersion: PRODUCT_VERSION,
      searchBoost: 2,
    },
    body: [
      p(
        "Fajita watches four kinds of things and tells your team when one of them stops behaving. It checks on a schedule, confirms a real failure before it wakes anyone, and gives you a public place to communicate what is happening.",
      ),
      h2("The four monitor types"),
      table(
        ["Type", "Watches", "Opens an incident when"],
        [
          ["Website", "An HTTP or HTTPS URL", "Requests fail or an assertion fails"],
          ["API", "A JSON or HTTP endpoint with headers and a body", "Status, response time, or a JSON assertion fails"],
          ["SSL certificate", "A certificate's validity and expiry", "The certificate is invalid, mismatched, or near expiry"],
          ["Heartbeat", "A scheduled job that checks in", "The expected check-in does not arrive in time"],
        ],
      ),
      h2("How a check becomes an incident"),
      p(
        "A single failed request does not open an incident. Fajita retries first, then runs verification across consecutive checks. Only a confirmed failure opens an incident, which keeps alerts trustworthy.",
      ),
      diagram(
        "monitoring-flow",
        "From scheduled check to confirmed incident",
        "A scheduled check runs. On failure, Fajita retries the request. If the retry still fails, verification counts consecutive failing checks against the monitor's threshold. Once the threshold is met, an incident opens and alerts route to your channels. When checks pass again, recovery confirmation runs before the incident resolves.",
      ),
      callout("note", [
        p(
          "Manual tests never open incidents. Use `Test` freely while configuring a monitor. Only scheduled checks drive incident state.",
        ),
      ]),
      h2("What you can build in your first session"),
      ul([
        "One monitor for a real URL, tested before you save it",
        "An alert channel (email, Slack, Discord, or a signed webhook)",
        "A routing rule that decides which alerts reach which channel",
        "A public status page with one component mapped to your monitor",
      ]),
      p("Start with [Create your first monitor](/docs/getting-started/create-your-first-monitor)."),
    ],
  }),

  defineDoc({
    meta: {
      slug: "getting-started/create-your-first-monitor",
      title: "Create your first monitor",
      description:
        "Create, test, and activate a website monitor in a few minutes, then confirm your first scheduled result.",
      category: "getting-started",
      model: "build",
      pageType: "task",
      order: 1,
      difficulty: "intro",
      estimatedTime: "6 min",
      productArea: ["monitors"],
      requiredPermission: "monitors:manage",
      prerequisites: ["An organization", "A publicly reachable HTTPS URL"],
      keywords: ["first monitor", "create monitor", "website", "http", "test before save"],
      relatedPages: ["monitors/website-monitoring", "getting-started/understand-the-first-test"],
      lastReviewedAt: REVIEWED,
      owner: "docs-product",
      reviewers: ["engineering", "product"],
      productVersion: PRODUCT_VERSION,
      searchBoost: 3,
    },
    body: [
      h2("Outcome"),
      p(
        "A website monitor is active and running scheduled checks against a real URL, and you have seen its first result.",
      ),
      h2("Before you start"),
      ul([
        "You need the `monitors:manage` permission (Owner, Admin, or Member).",
        "Use a public HTTPS endpoint. Fajita cannot reach private networks or `localhost`.",
      ]),
      h2("Steps"),
      steps([
        {
          title: "Open the new monitor wizard",
          body: [p("Go to Monitors, then New monitor, and choose Website.")],
        },
        {
          title: "Enter the URL",
          body: [
            p("Use the full address, including the scheme."),
            code("text", "https://example.com/health", "Example URL"),
          ],
        },
        {
          title: "Set the check interval",
          body: [
            p(
              "Choose how often Fajita checks. Intervals run from every minute to every hour. A faster interval detects problems sooner and uses more of your check volume.",
            ),
          ],
        },
        {
          title: "Test before you save",
          body: [
            p(
              "Run a manual test. Fajita performs one real check and shows the response, timing, and whether each assertion passed. Fix anything red before saving.",
            ),
          ],
        },
        {
          title: "Activate",
          body: [
            p(
              "Save and activate the monitor. It moves from `draft` to `active` and begins its schedule.",
            ),
          ],
        },
      ]),
      h2("Verify the setup"),
      ol([
        "Wait for the first scheduled check to complete.",
        "Open the monitor's history and confirm a `success` result appears.",
        "Confirm the response time and status code match what you expect.",
      ]),
      callout("tip", [
        p(
          "A brand-new monitor has no history yet. The first scheduled result can take up to one interval to appear.",
        ),
      ]),
      h2("What happens next"),
      p(
        "Connect a channel so a confirmed failure reaches you: [Connect an alert channel](/docs/getting-started/connect-an-alert-channel).",
      ),
      h2("Common problems"),
      ul([
        "Destination blocked: the URL resolves to a private address. See [Why was my check blocked?](/docs/troubleshooting/check-blocked).",
        "Unexpected status: confirm the endpoint returns a success code without authentication, or add an auth header.",
      ]),
    ],
  }),

  defineDoc({
    meta: {
      slug: "getting-started/understand-the-first-test",
      title: "Understand the first test",
      description:
        "What a manual test does, how it differs from a scheduled check, and why a test never opens an incident.",
      category: "getting-started",
      model: "learn",
      pageType: "concept",
      order: 2,
      difficulty: "intro",
      estimatedTime: "3 min",
      productArea: ["monitors"],
      keywords: ["manual test", "test before save", "scheduled check", "difference"],
      relatedPages: ["incidents/verification", "monitors/monitor-states"],
      lastReviewedAt: REVIEWED,
      owner: "docs-product",
      reviewers: ["engineering"],
      productVersion: PRODUCT_VERSION,
    },
    body: [
      p("A manual test and a scheduled check run the same request, but they mean different things."),
      table(
        ["", "Manual test", "Scheduled check"],
        [
          ["Runs", "When you click Test", "On the monitor's interval"],
          ["Counts toward history", "No", "Yes"],
          ["Can open an incident", "No", "Yes, after verification"],
          ["Uses stored secrets", "Yes", "Yes"],
        ],
      ),
      callout("note", [
        p(
          "Because tests never affect incident state or uptime history, you can test as often as you like while configuring a monitor.",
        ),
      ]),
      p(
        "When you activate a monitor, scheduled checks begin. From then on, failing checks drive verification. See [Retries and verification](/docs/incidents/verification).",
      ),
    ],
  }),

  defineDoc({
    meta: {
      slug: "getting-started/connect-an-alert-channel",
      title: "Connect an alert channel",
      description:
        "Add and verify an alert channel so a confirmed incident reaches your team, then route it with a rule.",
      category: "getting-started",
      model: "build",
      pageType: "task",
      order: 3,
      difficulty: "intro",
      estimatedTime: "5 min",
      productArea: ["alerts"],
      requiredPermission: "integrations:manage",
      requiredRole: "admin",
      prerequisites: ["An active monitor"],
      keywords: ["alert channel", "notification", "slack", "email", "webhook", "routing"],
      relatedPages: ["alerts/slack", "alerts/routing-rules"],
      lastReviewedAt: REVIEWED,
      owner: "docs-product",
      reviewers: ["engineering", "product"],
      productVersion: PRODUCT_VERSION,
      searchBoost: 2,
    },
    body: [
      h2("Outcome"),
      p("A verified channel is active and a routing rule sends confirmed incidents to it."),
      h2("Before you start"),
      ul([
        "Connecting channels and routing needs the `integrations:manage` permission (Admin or Owner).",
        "Fajita supports email, Slack, Discord, and generic signed webhooks. It does not send SMS or phone calls.",
      ]),
      h2("Steps"),
      steps([
        {
          title: "Add a channel",
          body: [p("Go to Integrations, then New channel, and pick a provider.")],
        },
        {
          title: "Provide the destination",
          body: [
            p(
              "For email, add recipients. For Slack or Discord, paste the incoming webhook URL. For a generic webhook, enter your HTTPS endpoint.",
            ),
          ],
        },
        {
          title: "Send a test",
          body: [p("Fajita delivers a sample event so you can confirm it arrives before relying on it.")],
        },
        {
          title: "Create a routing rule",
          body: [
            p(
              "A channel only receives alerts through a rule. Create a rule that matches your monitor or the whole organization and points at the channel.",
            ),
          ],
        },
      ]),
      h2("Verify the setup"),
      ul([
        "The test message arrived in the destination.",
        "The channel shows `active`.",
        "A rule references the channel.",
      ]),
      h2("What happens next"),
      p("Give customers a public view: [Publish a status page](/docs/getting-started/publish-a-status-page)."),
    ],
  }),

  defineDoc({
    meta: {
      slug: "getting-started/publish-a-status-page",
      title: "Publish a status page",
      description:
        "Create a public status page, map a component to a monitor, and publish it on a hosted subdomain.",
      category: "getting-started",
      model: "build",
      pageType: "task",
      order: 4,
      difficulty: "intro",
      estimatedTime: "6 min",
      productArea: ["status-pages"],
      requiredPermission: "status_pages:publish",
      requiredRole: "admin",
      prerequisites: ["At least one monitor"],
      keywords: ["status page", "publish", "component", "public", "uptime"],
      relatedPages: ["status-pages/create", "status-pages/components"],
      lastReviewedAt: REVIEWED,
      owner: "docs-product",
      reviewers: ["engineering", "product"],
      productVersion: PRODUCT_VERSION,
      searchBoost: 2,
    },
    body: [
      h2("Outcome"),
      p("A public status page is live on a hosted subdomain with one component reflecting a monitor's state."),
      h2("Before you start"),
      ul([
        "Building a page needs `status_pages:manage`; making it public needs `status_pages:publish` (Admin or Owner).",
      ]),
      h2("Steps"),
      steps([
        {
          title: "Create the page",
          body: [p("Go to Status pages, then New status page, and name it for your customers.")],
        },
        {
          title: "Add a component",
          body: [
            p(
              "Components are the public names customers see. Give the component a plain name like `API` or `Website`, not your internal monitor name.",
            ),
          ],
        },
        {
          title: "Map the component to a monitor",
          body: [
            p(
              "Choose which monitor drives the component's state. Fajita calculates the public state from the monitor's operational state.",
            ),
          ],
        },
        {
          title: "Publish",
          body: [
            p(
              "Publish the page. It becomes available at your hosted subdomain, for example `your-page.status.fajita.io`.",
            ),
          ],
        },
      ]),
      h2("Verify the setup"),
      ul([
        "The hosted URL loads the page for a signed-out visitor.",
        "The component shows the expected state.",
      ]),
      h2("What happens next"),
      ul([
        "Add your own domain: [Custom domains](/docs/status-pages/custom-domains).",
        "Let customers subscribe: [Double opt-in subscribers](/docs/subscribers/double-opt-in).",
      ]),
    ],
  }),

  defineDoc({
    meta: {
      slug: "getting-started/next-steps",
      title: "Next steps",
      description:
        "Where to go after your first monitor, channel, and status page: assertions, teams, and plan limits.",
      category: "getting-started",
      model: "learn",
      pageType: "overview",
      order: 5,
      difficulty: "intro",
      estimatedTime: "2 min",
      productArea: ["monitors", "teams", "billing"],
      keywords: ["next steps", "after setup", "learn more"],
      relatedPages: ["teams/roles-and-permissions", "billing/plans"],
      lastReviewedAt: REVIEWED,
      owner: "docs-product",
      reviewers: ["product"],
      productVersion: PRODUCT_VERSION,
    },
    body: [
      p("You have the core loop running. Here is where teams usually go next."),
      table(
        ["Goal", "Read"],
        [
          ["Check a JSON API response", "[JSON path assertions](/docs/assertions/json-path)"],
          ["Watch a cron job", "[Heartbeat monitoring](/docs/monitors/heartbeat-monitoring)"],
          ["Add teammates", "[Roles and permissions](/docs/teams/roles-and-permissions)"],
          ["Understand limits", "[Plans and limits](/docs/billing/plans)"],
          ["Receive events in code", "[Webhook event reference](/docs/webhooks/event-types)"],
        ],
      ),
    ],
  }),
];
