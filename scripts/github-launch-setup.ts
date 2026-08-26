#!/usr/bin/env tsx
/**
 * GitHub launch setup for Accomplish-Labs/fajita-io.
 * Works on private repos. Does NOT change visibility.
 *
 *   GITHUB_TOKEN=ghp_... npm run github:launch-setup
 *   GITHUB_TOKEN=ghp_... npm run github:launch-setup -- --issues-only
 *   GITHUB_TOKEN=ghp_... npm run github:launch-setup -- --dry-run
 *
 * Requires a fine-grained PAT with lifetime <= 366 days (Accomplish-Labs org policy)
 * and admin access to the repository.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const OWNER = "Accomplish-Labs";
const REPO = "fajita-io";
const API = "https://api.github.com";

const dryRun = process.argv.includes("--dry-run");
const issuesOnly = process.argv.includes("--issues-only");
const labelsOnly = process.argv.includes("--labels-only");

const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
if (!token) {
  console.error("Set GITHUB_TOKEN or GH_TOKEN with repo admin scope.");
  process.exit(1);
}

const headers = {
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${token}`,
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "fajita-github-launch-setup",
};

async function api<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<{ ok: boolean; status: number; data: T | null; text: string }> {
  const url = path.startsWith("http") ? path : `${API}${path}`;
  if (dryRun) {
    console.log(`[dry-run] ${method} ${path}`);
    if (body) console.log(JSON.stringify(body, null, 2));
    return { ok: true, status: 200, data: null, text: "" };
  }
  const res = await fetch(url, {
    method,
    headers: { ...headers, ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data: T | null = null;
  if (text) {
    try {
      data = JSON.parse(text) as T;
    } catch {
      /* non-json */
    }
  }
  return { ok: res.ok, status: res.status, data, text };
}

const LABELS: Array<{ name: string; color: string; description: string }> = [
  { name: "bug", color: "d73a4a", description: "Reproducible defects" },
  { name: "feature", color: "a2eeef", description: "New capability requests" },
  { name: "documentation", color: "0075ca", description: "Documentation changes" },
  { name: "security", color: "b60205", description: "Security fixes (not public vuln reports)" },
  { name: "good first issue", color: "7057ff", description: "Low-risk starter tasks" },
  { name: "help wanted", color: "008672", description: "Maintainer welcomes external help" },
  { name: "monitoring", color: "fbca04", description: "Check engine, verification, schedules" },
  { name: "status-pages", color: "5319e7", description: "Public status surfaces" },
  { name: "integrations", color: "1d76db", description: "Slack, Discord, webhooks, email" },
  { name: "self-hosting", color: "006b75", description: "Docker, compose, operator docs" },
  { name: "performance", color: "e99695", description: "Latency, worker throughput" },
  { name: "design", color: "d4c5f9", description: "UI/UX and visual system" },
];

const DESCRIPTION =
  "Open-source uptime monitoring for websites, APIs, SSL, and cron jobs with failure verification before alerts.";

const TOPICS = [
  "uptime",
  "monitoring",
  "uptime-monitoring",
  "status-page",
  "self-hosted",
  "open-source",
  "api-monitoring",
  "ssl-monitoring",
  "cron-monitoring",
  "devops",
  "observability",
];

type SeedIssue = {
  title: string;
  body: string;
  labels: string[];
};

const SEED_ISSUES: SeedIssue[] = [
  {
    title: "docs: Add Traefik reverse proxy example for self-hosting",
    labels: ["documentation", "good first issue", "self-hosting"],
    body: `## Summary
Add a Traefik reverse proxy example mirroring the existing Caddy and Nginx patterns in self-hosting docs.

## Acceptance criteria
- [ ] New doc section or page under \`docs/self-hosting/\`
- [ ] Covers TLS termination and forwarding to the web container
- [ ] Links from the self-hosting quickstart or configuration index
- [ ] No production secrets or customer URLs

## References
- Existing reverse proxy examples in self-hosting documentation
`,
  },
  {
    title: "docs: FAQ for Clerk webhook tunnel setup during local dev",
    labels: ["documentation", "good first issue", "self-hosting"],
    body: `## Summary
Self-hosters need a clear FAQ entry for exposing \`/api/webhooks/clerk\` during local development.

## Acceptance criteria
- [ ] FAQ entry in self-hosting troubleshooting or authentication docs
- [ ] Mentions ngrok, Cloudflare Tunnel, or similar without endorsing one vendor exclusively
- [ ] Notes that production should use a real HTTPS URL

## References
- \`docs/self-hosting/AUTHENTICATION.md\`
`,
  },
  {
    title: "docs: Cross-link architecture docs from self-hosting README",
    labels: ["documentation", "good first issue"],
    body: `## Summary
The self-hosting doc index should link to open-source architecture docs so operators understand worker and verification flow.

## Acceptance criteria
- [ ] Links to \`/docs/open-source/architecture\` from self-hosting index or quickstart
- [ ] One-sentence explanation of why the link matters
`,
  },
  {
    title: "docs: Verify Quick Start commands on Linux and document OS notes",
    labels: ["documentation", "help wanted", "self-hosting"],
    body: `## Summary
Run the README and quickstart path on Linux and document any OS-specific differences (paths, Docker permissions, line endings).

## Acceptance criteria
- [ ] Commands verified on a clean Linux VM or container
- [ ] OS-specific notes added where needed
- [ ] No tribal knowledge required beyond documented steps
`,
  },
  {
    title: "integrations: Improve Discord alert error when webhook URL is invalid",
    labels: ["integrations", "good first issue", "help wanted"],
    body: `## Summary
When a Discord webhook URL is malformed or rejected, surface a clearer operator-facing error.

## Acceptance criteria
- [ ] Invalid URL format caught before send when possible
- [ ] Error message explains what to fix (no stack traces in UI)
- [ ] Unit test for the validation path
`,
  },
  {
    title: "docs: Signed webhook verification walkthrough with sample payload",
    labels: ["documentation", "good first issue", "integrations"],
    body: `## Summary
Document how to verify Fajita signed webhook payloads with a copy-paste example using \`example.com\`.

## Acceptance criteria
- [ ] Step-by-step doc with sample headers and body
- [ ] Uses fictional endpoint URLs only
- [ ] Links from integrations docs
`,
  },
  {
    title: "docs: Troubleshooting entry for SMTP STARTTLS vs SMTPS",
    labels: ["documentation", "good first issue", "integrations", "self-hosting"],
    body: `## Summary
Self-hosters often confuse STARTTLS (port 587) with implicit TLS/SMTPS (port 465). Add a troubleshooting entry.

## Acceptance criteria
- [ ] Explains both modes in plain language
- [ ] Maps to \`.env\` variables used by Fajita
- [ ] Common misconfiguration symptoms listed
`,
  },
  {
    title: "a11y: Fix focus ring or aria-label on monitor list",
    labels: ["design", "good first issue", "monitoring"],
    body: `## Summary
Identify and fix one accessibility defect on the monitor list route (\`/app/monitors\` or equivalent).

## Acceptance criteria
- [ ] Specific element identified in issue comments before PR
- [ ] Visible focus state or correct \`aria-label\`
- [ ] No visual regression at mobile width
`,
  },
  {
    title: "docs: Compose healthcheck notes for production Postgres hardening",
    labels: ["documentation", "self-hosting", "help wanted"],
    body: `## Summary
Document recommended Postgres healthcheck and hardening options for production Compose deployments.

## Acceptance criteria
- [ ] Covers healthcheck configuration in Compose
- [ ] Notes backup and volume persistence expectations
- [ ] Does not claim Fajita operates managed Postgres for self-hosters
`,
  },
  {
    title: "docs: Improve .env.example comments without duplicating quickstart",
    labels: ["documentation", "good first issue", "self-hosting"],
    body: `## Summary
Clarify non-obvious \`.env.example\` variables inline without repeating the full quickstart.

## Acceptance criteria
- [ ] Comments only; no new env vars unless necessary
- [ ] No overlap with QUICKSTART.md step-by-step
- [ ] \`npm run selfhost:doctor\` behavior unchanged
`,
  },
];

async function verifyToken(): Promise<void> {
  const res = await api<{ login: string }>("GET", "/user");
  if (!res.ok) {
    console.error(`GitHub auth failed (${res.status}): ${res.text.slice(0, 300)}`);
    process.exit(1);
  }
  console.log(`Authenticated as ${res.data?.login ?? "unknown"}`);
}

async function updateRepositoryMetadata(): Promise<void> {
  console.log("\nUpdating repository metadata…");
  const res = await api("PATCH", `/repos/${OWNER}/${REPO}`, {
    description: DESCRIPTION,
    homepage: "https://fajita.io",
  });
  if (!res.ok) {
    console.error(`Metadata update failed (${res.status}): ${res.text.slice(0, 300)}`);
    process.exit(1);
  }
  console.log("  description + homepage updated");

  const topicsRes = await api(
    "PUT",
    `/repos/${OWNER}/${REPO}/topics`,
    { names: TOPICS },
  );
  if (!topicsRes.ok) {
    console.error(`Topics update failed (${topicsRes.status}): ${topicsRes.text.slice(0, 300)}`);
    process.exit(1);
  }
  console.log(`  topics applied (${TOPICS.length})`);
  console.log(
    "\n  Manual step: upload .github/assets/github-social-preview.png in Settings → General → Social preview",
  );
}

async function createLabels(): Promise<void> {
  console.log("\nCreating labels…");
  for (const label of LABELS) {
    const res = await api("POST", `/repos/${OWNER}/${REPO}/labels`, label);
    if (res.ok) {
      console.log(`  created ${label.name}`);
      continue;
    }
    if (res.status === 422) {
      const patch = await api("PATCH", `/repos/${OWNER}/${REPO}/labels/${encodeURIComponent(label.name)}`, {
        color: label.color,
        description: label.description,
      });
      if (patch.ok) {
        console.log(`  updated ${label.name}`);
      } else {
        console.warn(`  skip ${label.name} (${patch.status})`);
      }
      continue;
    }
    console.warn(`  failed ${label.name} (${res.status})`);
  }
}

async function createSeedIssues(): Promise<void> {
  console.log("\nCreating seed issues…");
  const existing = await api<Array<{ title: string }>>(
    "GET",
    `/repos/${OWNER}/${REPO}/issues?state=all&per_page=100`,
  );
  const titles = new Set(
    (existing.data ?? []).map((i) => i.title.toLowerCase()),
  );

  for (const issue of SEED_ISSUES) {
    if (titles.has(issue.title.toLowerCase())) {
      console.log(`  skip (exists): ${issue.title}`);
      continue;
    }
    const res = await api<{ number: number; html_url: string }>(
      "POST",
      `/repos/${OWNER}/${REPO}/issues`,
      { title: issue.title, body: issue.body, labels: issue.labels },
    );
    if (res.ok && res.data) {
      console.log(`  #${res.data.number} ${res.data.html_url}`);
    } else {
      console.warn(`  failed: ${issue.title} (${res.status})`);
    }
  }
}

async function printDiscussionsReminder(): Promise<void> {
  const guide = readFileSync(
    join(process.cwd(), "docs/open-source/DISCUSSIONS.md"),
    "utf8",
  );
  console.log("\nDiscussions (manual — no REST shortcut in this script):");
  console.log("  Settings → General → Features → Discussions → Enable");
  console.log("  Categories: General, Ideas, Q&A, Show and tell, Integrations");
  console.log("  See docs/open-source/DISCUSSIONS.md");
  void guide;
}

async function main(): Promise<void> {
  console.log(`GitHub launch setup for ${OWNER}/${REPO}`);
  console.log("Repository visibility is NOT changed by this script.\n");

  await verifyToken();

  if (!issuesOnly) {
    if (!labelsOnly) {
      await updateRepositoryMetadata();
    }
    await createLabels();
  }

  if (!labelsOnly) {
    await createSeedIssues();
  }

  await printDiscussionsReminder();

  console.log("\nDone. Make the repository public when you are ready to review.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
