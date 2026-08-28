import { callout, code, h2, p, steps, table, ul } from "../blocks";
import { defineDoc, type DocPage } from "../types";

const REVIEWED = "2026-08-26";
const PRODUCT_VERSION = "2026.08";

export const selfHostingPages: DocPage[] = [
  defineDoc({
    meta: {
      slug: "self-hosting/quickstart",
      title: "Self-hosting quickstart",
      description:
        "Run Fajita locally with Docker Compose: clone, configure Clerk and secrets, start the stack, and create your first monitor.",
      category: "self-hosting",
      model: "learn",
      pageType: "task",
      order: 0,
      difficulty: "core",
      estimatedTime: "15 min",
      productArea: ["self-hosting"],
      keywords: ["self-host", "docker", "quickstart", "open source"],
      relatedPages: [
        "self-hosting/configuration",
        "self-hosting/authentication",
        "open-source/architecture",
      ],
      lastReviewedAt: REVIEWED,
      owner: "docs-product",
      reviewers: ["engineering"],
      productVersion: PRODUCT_VERSION,
      searchBoost: 3,
    },
    body: [
      p(
        "This guide boots a self-hosted Fajita stack on your machine. You need Docker, a Clerk application you control, and secrets for database access and monitor encryption.",
      ),
      h2("Prerequisites"),
      ul([
        "Docker and Docker Compose",
        "Node.js 22+ for helper scripts",
        "A [Clerk](https://clerk.com) application",
      ]),
      h2("Steps"),
      steps([
        {
          title: "Clone and copy environment file",
          body: [
            code(
              "bash",
              `git clone https://github.com/fajita-io/fajita.git
cd fajita
cp .env.example .env`,
            ),
          ],
        },
        {
          title: "Configure deployment mode and Clerk",
          body: [
            p("Set at minimum in `.env`:"),
            code(
              "text",
              `FAJITA_DEPLOYMENT_MODE=self_hosted
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CRON_SECRET=<long-random-string>
MONITOR_SECRET_KEYRING=1:<base64-of-32-bytes>`,
            ),
          ],
        },
        {
          title: "Start the stack",
          body: [
            code("bash", "docker compose up -d"),
            p("Run `npm run selfhost:doctor` to validate configuration without printing secrets."),
          ],
        },
        {
          title: "Sign in and create a monitor",
          body: [
            p("Open [http://localhost:3000](http://localhost:3000), sign in through Clerk, and create a monitor."),
          ],
        },
      ]),
      callout("note", [
        p(
          "Prefer not to operate the infrastructure? [Fajita Cloud](/signup) runs workers, upgrades, and backups for you.",
        ),
      ]),
    ],
  }),

  defineDoc({
    meta: {
      slug: "self-hosting/configuration",
      title: "Self-hosting configuration",
      description:
        "Environment variables for self-hosted Fajita: required keys, optional SMTP and worker tuning, and validation with selfhost:doctor.",
      category: "self-hosting",
      model: "reference",
      pageType: "reference",
      order: 1,
      difficulty: "core",
      estimatedTime: "8 min",
      productArea: ["self-hosting"],
      keywords: ["configuration", "environment", "self-host"],
      relatedPages: ["self-hosting/quickstart", "self-hosting/troubleshooting"],
      lastReviewedAt: REVIEWED,
      owner: "docs-product",
      reviewers: ["engineering"],
      productVersion: PRODUCT_VERSION,
    },
    body: [
      p("Set `FAJITA_DEPLOYMENT_MODE=self_hosted` first. All configuration flows through environment variables."),
      h2("Required variables"),
      table(
        ["Variable", "Purpose"],
        [
          ["`FAJITA_DEPLOYMENT_MODE`", "Must be `self_hosted`"],
          ["`NEXT_PUBLIC_APP_URL`", "Public URL for links, heartbeats, status pages"],
          ["`NEXT_PUBLIC_SUPABASE_URL`", "PostgREST API base URL"],
          ["`NEXT_PUBLIC_SUPABASE_ANON_KEY`", "Anon JWT for client reads"],
          ["`SUPABASE_SERVICE_ROLE_KEY`", "Service role for server mutations"],
          ["`DATABASE_URL`", "Postgres connection string"],
          ["`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`", "Your Clerk application"],
          ["`CLERK_SECRET_KEY`", "Your Clerk application"],
          ["`MONITOR_SECRET_KEYRING`", "AES-256-GCM keyring for monitor secrets"],
          ["`CRON_SECRET`", "Bearer token for cron routes"],
        ],
      ),
      h2("Email (optional)"),
      p("Use Resend (`RESEND_API_KEY`) or SMTP (`SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM`, and auth variables)."),
      h2("Validate configuration"),
      code("bash", "npm run selfhost:doctor"),
    ],
  }),

  defineDoc({
    meta: {
      slug: "self-hosting/authentication",
      title: "Self-hosting authentication",
      description:
        "Clerk setup for self-hosted Fajita: origins, redirects, JWT auth integration, and webhooks.",
      category: "self-hosting",
      model: "build",
      pageType: "task",
      order: 2,
      difficulty: "core",
      estimatedTime: "10 min",
      productArea: ["self-hosting"],
      keywords: ["clerk", "authentication", "self-host"],
      relatedPages: ["self-hosting/quickstart", "self-hosting/configuration"],
      lastReviewedAt: REVIEWED,
      owner: "docs-product",
      reviewers: ["engineering"],
      productVersion: PRODUCT_VERSION,
    },
    body: [
      p(
        "Self-hosted Fajita uses a Clerk application you operate. Fajita does not ship native self-hosted authentication yet.",
      ),
      h2("Clerk dashboard checklist"),
      ul([
        "Add your public URL to allowed origins",
        "Set sign-in redirect to `/app`",
        "Configure the Clerk JWT template integration for PostgREST",
        "Point the Clerk webhook to `/api/webhooks/clerk` (use a tunnel for local dev)",
      ]),
      callout("warning", [
        p("Use your own Clerk keys. Never reuse Fajita Cloud production credentials."),
      ]),
    ],
  }),

  defineDoc({
    meta: {
      slug: "self-hosting/backups",
      title: "Self-hosting backups",
      description:
        "PostgreSQL backup expectations for self-hosted operators: what Fajita Cloud manages for you and what you must schedule yourself.",
      category: "self-hosting",
      model: "operate",
      pageType: "concept",
      order: 3,
      difficulty: "core",
      estimatedTime: "5 min",
      productArea: ["self-hosting"],
      keywords: ["backups", "postgres", "self-host"],
      relatedPages: ["self-hosting/upgrades", "self-hosting/security"],
      lastReviewedAt: REVIEWED,
      owner: "docs-product",
      reviewers: ["engineering"],
      productVersion: PRODUCT_VERSION,
    },
    body: [
      p(
        "Self-hosted operators own PostgreSQL backups and restore testing. Fajita Cloud manages backups for managed customers.",
      ),
      ul([
        "Schedule logical or volume backups on a cadence you trust",
        "Test restores, not just backup jobs",
        "Protect backup storage with the same access controls as production",
      ]),
    ],
  }),

  defineDoc({
    meta: {
      slug: "self-hosting/upgrades",
      title: "Self-hosting upgrades",
      description:
        "How to upgrade a self-hosted Fajita install: pull releases, run migrations, and restart workers safely.",
      category: "self-hosting",
      model: "operate",
      pageType: "task",
      order: 4,
      difficulty: "core",
      estimatedTime: "6 min",
      productArea: ["self-hosting"],
      keywords: ["upgrades", "migrations", "self-host"],
      relatedPages: ["self-hosting/backups", "self-hosting/troubleshooting"],
      lastReviewedAt: REVIEWED,
      owner: "docs-product",
      reviewers: ["engineering"],
      productVersion: PRODUCT_VERSION,
    },
    body: [
      p("Upgrade by pulling a release tag, applying database migrations, and restarting Compose services."),
      steps([
        {
          title: "Back up PostgreSQL",
          body: [p("Take a backup before any upgrade.")],
        },
        {
          title: "Pull the release and rebuild",
          body: [
            code(
              "bash",
              `git fetch --tags
git checkout v0.1.0
docker compose build
docker compose up -d`,
            ),
          ],
        },
        {
          title: "Verify migrations",
          body: [
            code("bash", "npm run db:status"),
            p("Confirm the migrate service completed successfully in Compose logs."),
          ],
        },
      ]),
    ],
  }),

  defineDoc({
    meta: {
      slug: "self-hosting/troubleshooting",
      title: "Self-hosting troubleshooting",
      description:
        "Common self-hosted failures: doctor checks, worker health, Clerk auth, and email delivery.",
      category: "self-hosting",
      model: "reference",
      pageType: "troubleshooting",
      order: 5,
      difficulty: "advanced",
      estimatedTime: "8 min",
      productArea: ["self-hosting"],
      keywords: ["troubleshooting", "self-host", "docker"],
      relatedPages: ["self-hosting/configuration", "self-hosting/quickstart"],
      lastReviewedAt: REVIEWED,
      owner: "docs-product",
      reviewers: ["engineering"],
      productVersion: PRODUCT_VERSION,
    },
    body: [
      h2("Start here"),
      code("bash", "npm run selfhost:doctor"),
      h2("Checks never run"),
      ul([
        "Confirm the Go monitor worker container is healthy",
        "Verify `CRON_SECRET` matches between web and scheduler sidecar",
        "Inspect worker logs for lease or database errors",
      ]),
      h2("Cannot sign in"),
      ul([
        "Confirm Clerk allowed origins include your public URL",
        "Verify the Clerk JWT template integration for PostgREST in Clerk",
      ]),
    ],
  }),

  defineDoc({
    meta: {
      slug: "self-hosting/security",
      title: "Self-hosting security",
      description:
        "Security responsibilities for self-hosted operators: secrets, network boundaries, private monitoring opt-in, and disclosure.",
      category: "self-hosting",
      model: "reference",
      pageType: "policy",
      order: 6,
      difficulty: "core",
      estimatedTime: "6 min",
      productArea: ["self-hosting", "security"],
      keywords: ["security", "self-host", "private network"],
      relatedPages: ["security/overview", "open-source/contributing"],
      lastReviewedAt: REVIEWED,
      owner: "docs-product",
      reviewers: ["engineering", "security"],
      productVersion: PRODUCT_VERSION,
    },
    body: [
      p(
        "Self-hosted operators control infrastructure, secrets, backups, and access policies. Fajita ships strict defaults, but production security is a shared responsibility.",
      ),
      ul([
        "Rotate `CRON_SECRET`, Clerk keys, and monitor encryption keys on a schedule",
        "Keep PostgreSQL off the public internet",
        "Enable private network monitoring only with `FAJITA_ALLOW_PRIVATE_NETWORKS` when you understand the risk",
        "Report vulnerabilities through SECURITY.md, not public issues",
      ]),
    ],
  }),
];
