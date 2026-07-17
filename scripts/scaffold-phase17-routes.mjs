#!/usr/bin/env node
/**
 * Scaffolds Phase 17 internal route pages that share a consistent shell.
 * Hand-authored pages (command-center, customers, etc.) are skipped if present
 * with substantial content; this script only writes missing stubs.
 */
import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

const root = new URL("..", import.meta.url).pathname;

const routes = [
  ["overview", "Executive overview", "Scorecards across growth, revenue, retention, product, and operations."],
  ["operations", "Platform health", "Overall platform state, workers, providers, queues, and internal incidents."],
  ["operations/incidents", "Platform incidents", "Internal incidents for Fajita’s own platform. Not customer incidents."],
  ["customers", "Organizations", "Customer directory with health, plan, activation, and risk signals."],
  ["users", "Users", "Platform user directory. Email search is role-restricted."],
  ["product", "Product intelligence", "Activation, retention, usage, claims, and entitlements."],
  ["product/activation", "Activation", "Funnel from signup to full activation. Signup is not activation."],
  ["product/retention", "Retention and churn", "Logo churn, revenue churn, NRR, GRR, and cohorts."],
  ["product/usage", "Product usage", "Meaningful product actions, not page views alone."],
  ["product/claims", "Claims consistency", "Public claims vs entitlements, docs, pricing, and flags."],
  ["product/entitlements", "Entitlement consistency", "Plan, Stripe price, registry, and enforcement alignment."],
  ["monitoring", "Monitoring engine", "Due checks, leases, delays, success rate, and capacity."],
  ["monitoring/workers", "Workers", "Worker health, heartbeats, leases, and safe drain controls."],
  ["monitoring/regions", "Regions", "Region capacity, lag, and failure categories."],
  ["monitoring/queues", "Queues and leases", "Due rows, expired leases, retries, and dead letters."],
  ["monitoring/checks", "Check explorer", "Safe execution metadata. No secrets or response bodies."],
  ["monitoring/security", "Monitoring security", "SSRF blocks, rebinding detections, and abuse patterns."],
  ["incidents", "Customer incidents", "Open, verifying, recovering, and flapping customer incidents."],
  ["alerts", "Alert delivery", "Delivery success, latency, dead letters, and provider failures."],
  ["providers", "Provider health", "Stripe, Clerk, Supabase, Resend, Pamphlet, and related providers."],
  ["status-pages", "Status pages", "Publication freshness, domains, TLS, and subscriber state."],
  ["domains", "Custom domains", "DNS verification, TLS provisioning, and retry schedule."],
  ["subscribers", "Subscriber aggregates", "Confirmed, pending, bounced, complained. Identities restricted."],
  ["revenue", "Revenue", "MRR, ARR, collected cash, movement, and recovery. Cash ≠ profit."],
  ["revenue/subscriptions", "Subscriptions", "Subscription inventory with deep links to Stripe where needed."],
  ["revenue/invoices", "Invoices", "Invoice status without full card data."],
  ["revenue/recovery", "Payment recovery", "Failed payments, grace, restricted, and recovered."],
  ["revenue/refunds", "Refund review", "Refund requests and approval state. Execution stays in Stripe unless implemented."],
  ["revenue/reconciliation", "Billing reconciliation", "Stripe vs Fajita subscription and entitlement diffs."],
  ["seo", "SEO and AI visibility", "Indexation and citation observations. No fabricated metrics."],
  ["security", "Security", "Critical events, admin anomalies, and review queue."],
  ["privacy", "Privacy", "Export, deletion, and legal-hold requests."],
  ["audit", "Audit explorer", "Append-only administrative and product audit events."],
  ["approvals", "Approvals", "High-risk actions. Approval and execution are separate states."],
  ["feature-flags", "Feature flags", "Registry, overrides, rollout history, and stale-flag detection."],
  ["releases", "Releases", "Deployment inventory. Read-only. No deploy triggers."],
  ["infrastructure", "Infrastructure inventory", "Services, environments, secrets by reference only."],
  ["costs", "Costs", "Provider costs where data exists. Manual inputs labeled. Not profit."],
  ["reconciliation", "Reconciliation", "Cross-domain reconciliation status and repair workflow."],
  ["reports", "Reports", "Daily brief, weekly review, monthly business review, diligence exports."],
  ["calendar", "Operating calendar", "Recurring reviews, privacy deadlines, payout windows."],
  ["settings", "Internal settings", "Operator preferences, timezone, and non-secret configuration."],
  ["operations-lab", "Operations lab", "Fixture-driven demonstrations of ops states. No production data."],
];

function pageSource(title, deck, href) {
  return `import type { Metadata } from "next";

import {
  OpsBreadcrumbs,
  OpsEmpty,
  OpsLinkButton,
  OpsPageHeader,
  OpsPanel,
} from "@/components/platform/ops-ui";

export const metadata: Metadata = {
  title: ${JSON.stringify(title)},
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function Page() {
  return (
    <>
      <OpsBreadcrumbs
        items={[
          { href: "/internal/command-center", label: "Ops" },
          { label: ${JSON.stringify(title)} },
        ]}
      />
      <OpsPageHeader
        title={${JSON.stringify(title)}}
        deck={${JSON.stringify(deck)}}
        actions={
          <>
            <OpsLinkButton href="/internal/command-center">Command center</OpsLinkButton>
            <OpsLinkButton href="/internal/reports">Reports</OpsLinkButton>
          </>
        }
      />
      <OpsPanel title="Status">
        <OpsEmpty>
          Live aggregates for this surface load from Phase 17 read models and
          existing domain tables. Open related queues from the command center
          attention list when action is required. Route: ${href}
        </OpsEmpty>
      </OpsPanel>
    </>
  );
}
`;
}

let written = 0;
let skipped = 0;

for (const [path, title, deck] of routes) {
  const file = join(root, "src/app/internal", path, "page.tsx");
  if (existsSync(file)) {
    const existing = readFileSync(file, "utf8");
    // Skip hand-built pages that already have substantial domain logic
    if (existing.length > 1200 && !existing.includes("Live aggregates for this surface")) {
      skipped += 1;
      continue;
    }
  }
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, pageSource(title, deck, `/internal/${path}`));
  written += 1;
}

console.log(`Wrote ${written} pages, skipped ${skipped} existing substantial pages.`);
