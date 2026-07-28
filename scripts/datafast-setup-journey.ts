#!/usr/bin/env tsx
/**
 * Create DataFast journey funnels and goal display customizations for fajita.io.
 *
 * Requires DATAFAST_API_KEY (df_ website key) in .env.local.
 * Optional DATAFAST_WEBSITE_ID (defaults to fajita.io admin id).
 *
 * Usage:
 *   npx tsx scripts/datafast-setup-journey.ts
 *   npx tsx scripts/datafast-setup-journey.ts --dry-run
 */
import { loadEnvConfig } from "@next/env";

import { DataFastGoals } from "@/lib/analytics/goals";

loadEnvConfig(process.cwd());

const DRY_RUN = process.argv.includes("--dry-run");
const API_KEY = process.env.DATAFAST_API_KEY?.trim();
/** Mongo ObjectId from GET /api/v1/admin/websites (not the dfid_ tracking id). */
const WEBSITE_ID =
  process.env.DATAFAST_WEBSITE_ID?.trim() ?? "6a590dc8d762e1ae10179867";

const ADMIN_BASE = "https://datafa.st/api/v1/admin";

const PALETTE = [
  "#f97316",
  "#8dcdff",
  "#84cc16",
  "#eab308",
  "#ec4899",
  "#ef4444",
  "#a855f7",
  "#14b8a6",
] as const;

type FunnelStep =
  | { name: string; type: "pageview"; url: string }
  | { name: string; type: "goal"; goalName: string };

interface FunnelDef {
  name: string;
  steps: FunnelStep[];
}

/** Journey funnels aligned with analytics-plan.md and critical-user-journeys.md. */
const FUNNELS: FunnelDef[] = [
  {
    name: "Marketing to signup",
    steps: [
      { name: "Landing page", type: "pageview", url: "/" },
      { name: "Demo started", type: "goal", goalName: DataFastGoals.demoStarted },
      { name: "Hero CTA click", type: "goal", goalName: DataFastGoals.heroCta },
      { name: "Signup page", type: "pageview", url: "/signup" },
      { name: "Account created", type: "goal", goalName: DataFastGoals.signup },
      { name: "Organization created", type: "goal", goalName: DataFastGoals.organizationCreated },
      { name: "Onboarding complete", type: "goal", goalName: DataFastGoals.onboardingComplete },
      { name: "First monitor live", type: "goal", goalName: DataFastGoals.monitorActivated },
    ],
  },
  {
    name: "Product activation",
    steps: [
      { name: "Signed up", type: "goal", goalName: DataFastGoals.signup },
      { name: "Organization created", type: "goal", goalName: DataFastGoals.organizationCreated },
      { name: "Onboarding started", type: "goal", goalName: DataFastGoals.onboardingStarted },
      { name: "Monitor created", type: "goal", goalName: DataFastGoals.monitorCreated },
      { name: "Monitor activated", type: "goal", goalName: DataFastGoals.monitorActivated },
      { name: "First check completed", type: "goal", goalName: DataFastGoals.firstRealCheckCompleted },
      { name: "Alert channel added", type: "goal", goalName: DataFastGoals.alertChannelAdded },
      { name: "Full activation", type: "goal", goalName: DataFastGoals.fullActivationCompleted },
    ],
  },
  {
    name: "Pricing to payment",
    steps: [
      { name: "Pricing page", type: "pageview", url: "/pricing" },
      { name: "Plan selected", type: "goal", goalName: DataFastGoals.planSelected },
      { name: "Checkout started", type: "goal", goalName: DataFastGoals.initiateCheckout },
      { name: "Payment completed", type: "goal", goalName: "payment" },
    ],
  },
  {
    name: "Homepage demo engagement",
    steps: [
      { name: "Landing page", type: "pageview", url: "/" },
      { name: "Demo started", type: "goal", goalName: DataFastGoals.demoStarted },
      { name: "Demo completed", type: "goal", goalName: DataFastGoals.demoCompleted },
      { name: "Hero CTA click", type: "goal", goalName: DataFastGoals.heroCta },
      { name: "Nav CTA click", type: "goal", goalName: DataFastGoals.navCta },
    ],
  },
  {
    name: "Contact inquiry",
    steps: [
      { name: "Contact page", type: "pageview", url: "/contact" },
      { name: "Form started", type: "goal", goalName: DataFastGoals.contactStarted },
      { name: "Inquiry submitted", type: "goal", goalName: DataFastGoals.contactSubmitted },
    ],
  },
  {
    name: "Status page launch",
    steps: [
      { name: "Creation started", type: "goal", goalName: DataFastGoals.statusPageCreationStarted },
      { name: "Status page created", type: "goal", goalName: DataFastGoals.statusPageCreated },
      { name: "Publish attempted", type: "goal", goalName: DataFastGoals.statusPagePublishAttempted },
      { name: "Publish succeeded", type: "goal", goalName: DataFastGoals.statusPagePublishSucceeded },
      { name: "Status page published", type: "goal", goalName: DataFastGoals.statusPagePublished },
    ],
  },
  {
    name: "Alert channel setup",
    steps: [
      { name: "Channel setup started", type: "goal", goalName: DataFastGoals.alertChannelCreationStarted },
      { name: "Channel created", type: "goal", goalName: DataFastGoals.alertChannelCreated },
      { name: "Channel test passed", type: "goal", goalName: DataFastGoals.alertChannelTestPassed },
      { name: "Channel activated", type: "goal", goalName: DataFastGoals.alertChannelActivated },
    ],
  },
  {
    name: "Team expansion",
    steps: [
      { name: "Invite initiated", type: "goal", goalName: DataFastGoals.teamInviteInitiated },
      { name: "Invite sent", type: "goal", goalName: DataFastGoals.teamInviteCreated },
      { name: "Invite accepted", type: "goal", goalName: DataFastGoals.teamInviteAccepted },
    ],
  },
];

/** Display labels for goals used in funnels and the Goals dashboard. */
const GOAL_CUSTOMIZATIONS: Array<{
  goalName: string;
  displayName: string;
  description: string;
}> = [
  { goalName: DataFastGoals.heroCta, displayName: "Hero CTA", description: "Primary hero call-to-action click" },
  { goalName: DataFastGoals.navCta, displayName: "Nav CTA", description: "Header get-started click" },
  { goalName: DataFastGoals.footerCta, displayName: "Footer CTA", description: "Footer conversion click" },
  { goalName: DataFastGoals.demoStarted, displayName: "Demo started", description: "First interaction with product demo" },
  { goalName: DataFastGoals.demoCompleted, displayName: "Demo completed", description: "Visitor finished the homepage journey demo" },
  { goalName: DataFastGoals.planSelected, displayName: "Plan selected", description: "Pricing plan CTA click" },
  { goalName: DataFastGoals.contactStarted, displayName: "Contact form started", description: "First focus in contact form" },
  { goalName: DataFastGoals.contactSubmitted, displayName: "Contact submitted", description: "Contact message stored server-side" },
  { goalName: DataFastGoals.signup, displayName: "Signup", description: "Account created (Clerk webhook confirmed)" },
  { goalName: DataFastGoals.signIn, displayName: "Sign in", description: "Returning user authenticated" },
  { goalName: DataFastGoals.organizationCreated, displayName: "Organization created", description: "First workspace provisioned" },
  { goalName: DataFastGoals.onboardingStarted, displayName: "Onboarding started", description: "User entered onboarding flow" },
  { goalName: DataFastGoals.onboardingStepCompleted, displayName: "Onboarding step done", description: "Single onboarding step completed" },
  { goalName: DataFastGoals.onboardingComplete, displayName: "Onboarding complete", description: "Onboarding checklist finished" },
  { goalName: DataFastGoals.monitorCreationStarted, displayName: "Monitor wizard opened", description: "User started creating a monitor" },
  { goalName: DataFastGoals.monitorCreated, displayName: "Monitor created", description: "Monitor saved to workspace" },
  { goalName: DataFastGoals.monitorTestPassed, displayName: "Monitor test passed", description: "Pre-flight check succeeded" },
  { goalName: DataFastGoals.monitorActivated, displayName: "Monitor activated", description: "Monitor is live and checking" },
  { goalName: DataFastGoals.firstMonitor, displayName: "First monitor", description: "First monitor milestone for workspace" },
  { goalName: DataFastGoals.firstRealCheckCompleted, displayName: "First check completed", description: "First scheduled check result received" },
  { goalName: DataFastGoals.alertChannelAdded, displayName: "Alert channel added", description: "Notification channel connected" },
  { goalName: DataFastGoals.alertChannelCreated, displayName: "Alert channel created", description: "New alert channel saved" },
  { goalName: DataFastGoals.alertChannelTestPassed, displayName: "Alert test passed", description: "Channel test delivery succeeded" },
  { goalName: DataFastGoals.alertChannelActivated, displayName: "Alert channel active", description: "Channel enabled for routing" },
  { goalName: DataFastGoals.statusPagePublished, displayName: "Status page published", description: "Public status page is live" },
  { goalName: DataFastGoals.statusPageCreated, displayName: "Status page created", description: "Status page draft saved" },
  { goalName: DataFastGoals.statusPagePublishSucceeded, displayName: "Status page publish OK", description: "Publish action succeeded" },
  { goalName: DataFastGoals.fullActivationCompleted, displayName: "Full activation", description: "Monitor, alerts, and status page milestones met" },
  { goalName: DataFastGoals.initiateCheckout, displayName: "Checkout started", description: "Stripe Checkout session opened" },
  { goalName: DataFastGoals.teamInviteCreated, displayName: "Team invite sent", description: "Teammate invitation created" },
  { goalName: DataFastGoals.teamInviteAccepted, displayName: "Team invite accepted", description: "Invitee joined workspace" },
  { goalName: "payment", displayName: "Payment", description: "Stripe payment completed (DataFast revenue attribution)" },
  { goalName: "free_trial", displayName: "Free trial", description: "Trial started via payment provider" },
  { goalName: "subscription_started", displayName: "Subscription started", description: "Paid subscription began" },
];

async function adminFetch<T>(
  path: string,
  init?: RequestInit,
  attempt = 0,
): Promise<T & { status?: string; error?: { message?: string } }> {
  const res = await fetch(`${ADMIN_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const json = (await res.json()) as T & {
    status?: string;
    error?: { message?: string };
  };
  if (res.status === 429 && attempt < 5) {
    await sleep(1500 * (attempt + 1));
    return adminFetch(path, init, attempt + 1);
  }
  if (!res.ok || json.status === "error") {
    throw new Error(
      json.error?.message ?? `DataFast ${path} failed (${res.status})`,
    );
  }
  return json;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function listFunnels(): Promise<Array<{ id: string; name: string }>> {
  const json = await adminFetch<{ data: Array<{ id: string; name: string }> }>(
    `/websites/${WEBSITE_ID}/funnels`,
  );
  return json.data ?? [];
}

async function createFunnel(def: FunnelDef): Promise<string> {
  if (DRY_RUN) {
    console.log(`[dry-run] funnel: ${def.name} (${def.steps.length} steps)`);
    return "dry-run";
  }
  const json = await adminFetch<{ data: Array<{ id: string; slug: string }> }>(
    `/websites/${WEBSITE_ID}/funnels`,
    {
      method: "POST",
      body: JSON.stringify({ name: def.name, steps: def.steps }),
    },
  );
  const created = json.data?.[0];
  console.log(`Created funnel: ${def.name} (${created?.slug ?? created?.id})`);
  return created?.id ?? "";
}

async function customizeGoal(
  item: (typeof GOAL_CUSTOMIZATIONS)[number],
  color: string,
): Promise<void> {
  if (DRY_RUN) {
    console.log(`[dry-run] goal: ${item.goalName} → ${item.displayName}`);
    return;
  }
  await adminFetch(`/websites/${WEBSITE_ID}/goals/customizations`, {
    method: "PATCH",
    body: JSON.stringify({
      goalName: item.goalName,
      displayName: item.displayName,
      color,
      description: item.description,
    }),
  });
  console.log(`Customized goal: ${item.goalName}`);
}

async function main(): Promise<void> {
  if (!API_KEY?.startsWith("df_")) {
    console.error("DATAFAST_API_KEY (df_ website key) is required in .env.local");
    process.exit(1);
  }

  console.log(`DataFast journey setup for website ${WEBSITE_ID}${DRY_RUN ? " (dry run)" : ""}\n`);

  const existing = await listFunnels();
  const existingNames = new Set(existing.map((f) => f.name));

  let funnelsCreated = 0;
  for (const def of FUNNELS) {
    if (existingNames.has(def.name)) {
      console.log(`Skip funnel (exists): ${def.name}`);
      continue;
    }
    await createFunnel(def);
    funnelsCreated += 1;
  }

  let goalsCustomized = 0;
  for (let i = 0; i < GOAL_CUSTOMIZATIONS.length; i += 1) {
    const item = GOAL_CUSTOMIZATIONS[i];
    const color = PALETTE[i % PALETTE.length];
    await customizeGoal(item, color);
    goalsCustomized += 1;
    await sleep(350);
  }

  const finalFunnels = await listFunnels();
  console.log(`\nDone. Funnels: ${finalFunnels.length} active (${funnelsCreated} created). Goals customized: ${goalsCustomized}.`);
  console.log("\nActive funnels:");
  for (const f of finalFunnels) {
    console.log(`  - ${f.name}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
