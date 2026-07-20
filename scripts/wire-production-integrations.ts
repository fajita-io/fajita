#!/usr/bin/env npx tsx
/**
 * Wire production integrations: webhooks (Clerk, Stripe, Resend), env files,
 * and Vercel Production. Does not print secret values.
 *
 * Usage:
 *   npx tsx scripts/wire-production-integrations.ts
 *   npx tsx scripts/wire-production-integrations.ts --skip-vercel
 *   npx tsx scripts/wire-production-integrations.ts --skip-webhooks
 */
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { loadEnvConfig } from "@next/env";

import { STRIPE_HANDLED_EVENTS } from "../src/lib/billing/webhook-inbox";

const ROOT = resolve(import.meta.dirname ?? fileURLToPath(new URL(".", import.meta.url)), "..");
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://fajita.io";
const RESEND_EVENTS = [
  "email.delivered",
  "email.bounced",
  "email.complained",
] as const;

loadEnvConfig(ROOT);

const prodFile = resolve(ROOT, ".env.production.local");
if (existsSync(prodFile)) {
  for (const line of readFileSync(prodFile, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq);
    let val = trimmed.slice(eq + 1);
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key] || prodFile) process.env[key] = val;
  }
}

const skipVercel = process.argv.includes("--skip-vercel");
const skipWebhooks = process.argv.includes("--skip-webhooks");

function requireEnv(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

function upsertEnvFile(file: string, entries: Record<string, string>): void {
  const path = resolve(ROOT, file);
  const lines = existsSync(path) ? readFileSync(path, "utf8").split("\n") : [];
  const map = new Map<string, string>();
  for (const line of lines) {
    const m = line.match(/^([A-Z0-9_]+)=/);
    if (m) map.set(m[1], line);
  }
  for (const [key, value] of Object.entries(entries)) {
    const needsQuotes = /[\s<>]/.test(value);
    map.set(key, needsQuotes ? `${key}="${value.replace(/"/g, "")}"` : `${key}=${value}`);
  }
  const out = [...map.values()].filter(Boolean).join("\n") + "\n";
  writeFileSync(path, out);
  console.log(`Updated ${file} (${Object.keys(entries).length} keys)`);
}

async function stripeRequest<T>(
  path: string,
  method: "GET" | "POST" | "DELETE" = "GET",
  body?: URLSearchParams,
): Promise<T> {
  const key = requireEnv("STRIPE_SECRET_KEY");
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body?.toString(),
  });
  const json = (await res.json()) as T & { error?: { message?: string } };
  if (!res.ok) {
    throw new Error(json.error?.message ?? `Stripe ${path} failed (${res.status})`);
  }
  return json;
}

async function ensureStripeWebhook(): Promise<string> {
  const target = `${APP_URL.replace(/\/$/, "")}/api/webhooks/stripe`;
  const existingSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (existingSecret?.startsWith("whsec_")) {
    console.log("Stripe webhook secret already in env");
    return existingSecret;
  }

  const listed = await stripeRequest<{
    data: Array<{ id: string; url: string; secret?: string }>;
  }>("/webhook_endpoints?limit=100");

  const matches = listed.data.filter((e) => e.url === target);
  for (const dup of matches.slice(1)) {
    await stripeRequest(`/webhook_endpoints/${dup.id}`, "POST", new URLSearchParams({ disabled: "true" }));
    console.log(`Disabled duplicate Stripe webhook (${dup.id})`);
  }

  const existing = matches[0];
  if (existing?.secret) {
    console.log(`Stripe webhook already exists (${existing.id})`);
    return existing.secret;
  }

  if (existing) {
    const key = requireEnv("STRIPE_SECRET_KEY");
    const del = await fetch(`https://api.stripe.com/v1/webhook_endpoints/${existing.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!del.ok) throw new Error(`Failed to delete Stripe webhook ${existing.id}`);
    console.log(`Deleted Stripe webhook without secret (${existing.id}) to recreate`);
  }

  const params = new URLSearchParams();
  params.set("url", target);
  params.set("description", "Fajita production billing sync");
  for (const ev of STRIPE_HANDLED_EVENTS) {
    params.append("enabled_events[]", ev);
  }

  const created = await stripeRequest<{ id: string; secret: string }>(
    "/webhook_endpoints",
    "POST",
    params,
  );
  console.log(`Created Stripe webhook (${created.id})`);
  return created.secret;
}

async function ensureClerkWebhook(): Promise<string> {
  const existing = process.env.CLERK_WEBHOOK_SIGNING_SECRET?.trim();
  if (existing?.startsWith("whsec_")) {
    console.log("Clerk webhook secret already in env");
    return existing;
  }

  console.log("Configuring Clerk webhook via Svix portal…");
  const result = spawnSync("npx", ["tsx", "scripts/setup-clerk-webhook-playwright.ts"], {
    cwd: ROOT,
    encoding: "utf8",
    env: process.env as NodeJS.ProcessEnv,
    timeout: 180_000,
  });
  if (result.status !== 0) {
    throw new Error(
      result.stderr?.trim() ||
        result.stdout?.trim() ||
        "Clerk webhook setup failed",
    );
  }
  const line = (result.stdout ?? "")
    .split("\n")
    .find((l) => l.startsWith("WHSEC="));
  const secret = line?.slice("WHSEC=".length).trim();
  if (!secret?.startsWith("whsec_")) {
    throw new Error("Clerk webhook script did not return WHSEC=");
  }
  console.log("Clerk webhook signing secret captured");
  return secret;
}

async function resendRequest<T>(
  path: string,
  init?: RequestInit,
  apiKey?: string,
): Promise<T> {
  const key = apiKey?.trim() || requireEnv("RESEND_API_KEY");
  const res = await fetch(`https://api.resend.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const json = (await res.json()) as T & { message?: string };
  if (!res.ok) {
    throw new Error(json.message ?? `Resend ${path} failed (${res.status})`);
  }
  return json;
}

async function ensureResendWebhook(): Promise<string> {
  const existing = process.env.SUBSCRIBER_EMAIL_WEBHOOK_SECRET?.trim();
  if (existing?.startsWith("whsec_")) {
    console.log("Resend webhook secret already in env");
    return existing;
  }

  const fullKey = process.env.RESEND_FULL_API_KEY?.trim();
  const sendKey = requireEnv("RESEND_API_KEY");
  const apiKey = fullKey || sendKey;

  const target = `${APP_URL.replace(/\/$/, "")}/api/webhooks/subscriber-email`;

  const listed = await resendRequest<{
    data?: Array<{ id: string; endpoint: string; signing_secret?: string }>;
  }>("/webhooks", undefined, apiKey);

  const match = (listed.data ?? []).find((w) => w.endpoint === target);
  if (match?.signing_secret) {
    console.log(`Resend webhook already exists (${match.id})`);
    return match.signing_secret;
  }

  if (!fullKey) {
    console.warn(
      "Resend API key is send-only; set RESEND_FULL_API_KEY to auto-create subscriber webhooks.",
    );
    return existing ?? "";
  }

  const created = await resendRequest<{ id: string; signing_secret: string }>(
    "/webhooks",
    {
      method: "POST",
      body: JSON.stringify({
        endpoint: target,
        events: [...RESEND_EVENTS],
      }),
    },
    apiKey,
  );
  console.log(`Created Resend webhook (${created.id})`);
  return created.signing_secret;
}

function pushVercel(name: string, value: string): void {
  const r = spawnSync(
    "vercel",
    ["env", "add", name, "production", "--force", "--yes", "--sensitive"],
    { cwd: ROOT, encoding: "utf8", input: value },
  );
  if (r.status !== 0) {
    const out = `${r.stderr || ""}${r.stdout || ""}`;
    if (out.includes("already exists")) {
      console.log(`Vercel production: ${name} (unchanged)`);
      return;
    }
    throw new Error(`vercel env add ${name} failed: ${out}`);
  }
  console.log(`Vercel production: ${name}`);
}

async function ensureSupabaseClerkIntegration(): Promise<void> {
  const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
  if (!token) {
    console.warn("SUPABASE_ACCESS_TOKEN missing; skip Supabase Clerk TPA setup");
    return;
  }

  const projectRef = requireEnv("SUPABASE_PROJECT_REF");
  const listRes = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/config/auth/third-party-auth`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (listRes.ok) {
    const existing = (await listRes.json()) as unknown[];
    if (Array.isArray(existing) && existing.length > 0) {
      console.log("Supabase Clerk third-party auth already configured");
      return;
    }
  }

  const jwksRes = await fetch("https://api.clerk.com/v1/jwks", {
    headers: { Authorization: `Bearer ${requireEnv("CLERK_SECRET_KEY")}` },
  });
  if (!jwksRes.ok) {
    console.warn(`Clerk JWKS fetch failed (${jwksRes.status}); skip Supabase TPA`);
    return;
  }
  const customJwks = await jwksRes.json();

  const res = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/config/auth/third-party-auth`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ custom_jwks: customJwks }),
    },
  );
  if (res.ok || res.status === 409) {
    console.log("Supabase Clerk third-party auth configured");
    return;
  }
  const text = await res.text();
  console.warn(`Supabase Clerk TPA setup returned ${res.status}: ${text.slice(0, 200)}`);
}

async function ensureClerkDns(): Promise<void> {
  const token = process.env.CLOUDFLARE_API_TOKEN?.trim();
  if (!token) {
    try {
      const res = await fetch("https://cloudflare-dns.com/dns-query?name=clerk.fajita.io&type=CNAME", {
        headers: { Accept: "application/dns-json" },
      });
      if (res.ok) {
        const body = (await res.json()) as { Answer?: { data: string }[] };
        if (body.Answer?.length) {
          console.log("Clerk DNS (clerk.fajita.io) already resolves");
          return;
        }
      }
    } catch {
      // ignore lookup errors
    }
    console.warn(
      "Clerk DNS missing: set CLOUDFLARE_API_TOKEN and run npm run dns:clerk",
    );
    return;
  }

  const r = spawnSync("npx", ["tsx", "scripts/cloudflare-clerk-dns-setup.ts"], {
    cwd: ROOT,
    encoding: "utf8",
    env: { ...process.env, CLOUDFLARE_API_TOKEN: token },
  });
  if (r.status !== 0) {
    console.warn("Clerk DNS setup failed:", r.stderr || r.stdout);
    return;
  }
  console.log(r.stdout.trim());
}
  if (skipVercel) {
    console.log("Skipping Vercel sync (--skip-vercel)");
    return;
  }
  for (const [name, value] of Object.entries(keys)) {
    if (!value) continue;
    try {
      pushVercel(name, value);
    } catch (error) {
      console.warn(
        `Vercel sync skipped for ${name}:`,
        error instanceof Error ? error.message : error,
      );
    }
  }
}

async function main(): Promise<void> {
  console.log(`Wiring production integrations for ${APP_URL}\n`);

  let stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
  let clerkWebhookSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET ?? "";
  let resendWebhookSecret = process.env.SUBSCRIBER_EMAIL_WEBHOOK_SECRET ?? "";

  if (!skipWebhooks) {
    stripeWebhookSecret = await ensureStripeWebhook();
    clerkWebhookSecret = await ensureClerkWebhook();
    try {
      resendWebhookSecret = await ensureResendWebhook();
    } catch (error) {
      console.warn(
        "Resend webhook setup skipped:",
        error instanceof Error ? error.message : error,
      );
    }
    await ensureSupabaseClerkIntegration();
    await ensureClerkDns();
  }

  const workerToken =
    process.env.LIFECYCLE_WORKER_TOKEN ??
    randomBytes(24).toString("hex");

  const productionEnv: Record<string, string> = {
    NEXT_PUBLIC_APP_URL: APP_URL.replace(/\/$/, "") || "https://fajita.io",
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: requireEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"),
    CLERK_SECRET_KEY: requireEnv("CLERK_SECRET_KEY"),
    CLERK_WEBHOOK_SIGNING_SECRET: clerkWebhookSecret,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: "/login",
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: "/signup",
    NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: "/app",
    NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL: "/app",
    NEXT_PUBLIC_SUPABASE_URL: requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    SUPABASE_SERVICE_ROLE_KEY: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    SUPABASE_PROJECT_REF: requireEnv("SUPABASE_PROJECT_REF"),
    DATABASE_URL: requireEnv("DATABASE_URL"),
    STRIPE_SECRET_KEY: requireEnv("STRIPE_SECRET_KEY"),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: requireEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"),
    STRIPE_WEBHOOK_SECRET: stripeWebhookSecret,
    RESEND_API_KEY: requireEnv("RESEND_API_KEY"),
    ALERT_EMAIL_FROM: process.env.ALERT_EMAIL_FROM ?? "Fajita <alerts@fajita.io>",
    SUBSCRIBER_EMAIL_WEBHOOK_SECRET: resendWebhookSecret,
    CRON_SECRET: process.env.CRON_SECRET ?? randomBytes(32).toString("hex"),
    MONITOR_SECRET_KEYRING: requireEnv("MONITOR_SECRET_KEYRING"),
    LIFECYCLE_WORKER_TOKEN: workerToken,
    ALERT_WORKER_TOKEN: process.env.ALERT_WORKER_TOKEN ?? workerToken,
    SUBSCRIBER_WORKER_TOKEN: process.env.SUBSCRIBER_WORKER_TOKEN ?? workerToken,
  };

  if (process.env.SUPABASE_ACCESS_TOKEN) {
    productionEnv.SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
  }
  if (process.env.FAJITA_STRIPE_ACCOUNT_ID) {
    productionEnv.FAJITA_STRIPE_ACCOUNT_ID = process.env.FAJITA_STRIPE_ACCOUNT_ID;
  }
  if (process.env.RESEND_FULL_API_KEY?.trim()) {
    productionEnv.RESEND_FULL_API_KEY = process.env.RESEND_FULL_API_KEY.trim();
  }

  upsertEnvFile(".env.production.local", productionEnv);

  syncVercel(productionEnv);

  console.log("\nDone. Next:");
  console.log("  1. npm run stripe:production-ready");
  console.log("  2. npm run auth:verify:prod");
  console.log("  3. vercel --prod (redeploy after env sync)");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
