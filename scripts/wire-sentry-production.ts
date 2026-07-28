#!/usr/bin/env tsx
/**
 * Push Sentry DSN to Vercel production and verify capture via the internal probe.
 *
 * Option A (recommended): set SENTRY_DSN and NEXT_PUBLIC_SENTRY_DSN in env.
 * Option B: set SENTRY_AUTH_TOKEN + SENTRY_ORG_SLUG to create a project via API.
 *
 *   npm run wire:sentry
 *   SMOKE_BASE_URL=https://fajita.io npm run wire:sentry -- --verify
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const ROOT = process.cwd();
const prodPath = resolve(ROOT, ".env.production.local");
const verify = process.argv.includes("--verify");
const BASE = (process.env.SMOKE_BASE_URL ?? "https://fajita.io").replace(/\/$/, "");

if (existsSync(prodPath)) {
  for (const line of readFileSync(prodPath, "utf8").split("\n")) {
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
    process.env[key] = val;
  }
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
      console.log(`Vercel production: ${name} updated`);
      return;
    }
    throw new Error(`vercel env add ${name} failed: ${out}`);
  }
  console.log(`Vercel production: ${name}`);
}

async function createSentryProject(): Promise<string> {
  const token = process.env.SENTRY_AUTH_TOKEN?.trim();
  const org = process.env.SENTRY_ORG_SLUG?.trim() ?? "fajita";
  if (!token) {
    throw new Error(
      "Set SENTRY_DSN or SENTRY_AUTH_TOKEN. Create a project at sentry.io → Settings → Projects → fajita-io.",
    );
  }

  const teamRes = await fetch(`https://sentry.io/api/0/organizations/${org}/teams/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!teamRes.ok) {
    throw new Error(`Sentry teams fetch failed (${teamRes.status}). Check SENTRY_ORG_SLUG.`);
  }
  const teams = (await teamRes.json()) as Array<{ slug: string }>;
  const teamSlug = teams[0]?.slug;
  if (!teamSlug) throw new Error("No Sentry team found for org");

  const createRes = await fetch(`https://sentry.io/api/0/teams/${org}/${teamSlug}/projects/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "fajita-io",
      slug: "fajita-io",
      platform: "javascript-nextjs",
    }),
  });
  const project = (await createRes.json()) as { slug?: string; detail?: string };
  if (!createRes.ok && !project.detail?.includes("already exists")) {
    throw new Error(project.detail ?? `Sentry project create failed (${createRes.status})`);
  }

  const keysRes = await fetch(
    `https://sentry.io/api/0/projects/${org}/${project.slug ?? "fajita-io"}/keys/`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!keysRes.ok) throw new Error(`Sentry keys fetch failed (${keysRes.status})`);
  const keys = (await keysRes.json()) as Array<{ dsn?: { public?: string } }>;
  const dsn = keys[0]?.dsn?.public;
  if (!dsn) throw new Error("Sentry did not return a DSN");
  return dsn;
}

async function verifyProbe(): Promise<void> {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret) {
    console.warn("CRON_SECRET missing locally; skip probe verify until redeploy");
    return;
  }

  console.log("Waiting 45s for redeploy propagation…");
  await new Promise((r) => setTimeout(r, 45_000));

  const res = await fetch(`${BASE}/api/internal/observability/sentry-probe`, {
    method: "POST",
    headers: { authorization: `Bearer ${cronSecret}` },
  });
  const body = (await res.json()) as { ok?: boolean; eventId?: string };
  if (!res.ok || !body.ok) {
    throw new Error(`Sentry probe failed: ${res.status} ${JSON.stringify(body)}`);
  }
  console.log(`Sentry probe OK eventId=${body.eventId ?? "pending"}`);

  const health = await fetch(`${BASE}/api/health`, { cache: "no-store" });
  const healthBody = (await health.json()) as { sentryConfigured?: boolean };
  if (!healthBody.sentryConfigured) {
    throw new Error("/api/health still reports sentryConfigured=false after deploy");
  }
  console.log("Health reports sentryConfigured=true");
}

async function main(): Promise<void> {
  let dsn = process.env.SENTRY_DSN?.trim() || process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();
  if (!dsn) {
    console.log("No SENTRY_DSN in env; attempting Sentry API project create…");
    dsn = await createSentryProject();
  }

  pushVercel("SENTRY_DSN", dsn);
  pushVercel("NEXT_PUBLIC_SENTRY_DSN", dsn);

  const lines = existsSync(prodPath) ? readFileSync(prodPath, "utf8").split("\n") : [];
  const map = new Map<string, string>();
  for (const line of lines) {
    const m = line.match(/^([A-Z0-9_]+)=/);
    if (m) map.set(m[1], line);
  }
  map.set("SENTRY_DSN", `SENTRY_DSN=${dsn}`);
  map.set("NEXT_PUBLIC_SENTRY_DSN", `NEXT_PUBLIC_SENTRY_DSN=${dsn}`);
  const { writeFileSync } = await import("node:fs");
  writeFileSync(prodPath, [...map.values()].filter(Boolean).join("\n") + "\n");
  console.log("Updated .env.production.local with Sentry DSN");

  console.log("\nNext: vercel --prod");
  if (verify) {
    await verifyProbe();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
