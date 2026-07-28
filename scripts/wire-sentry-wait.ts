#!/usr/bin/env tsx
/**
 * Poll Vercel production env for Sentry DSN, then deploy and verify.
 * Run after completing Vercel Marketplace Sentry setup in the browser.
 *
 *   npm run wire:sentry:wait -- --verify
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
const TIMEOUT_MS = Number(process.env.SENTRY_WAIT_TIMEOUT_MS ?? 600_000);

function loadProdEnv(): void {
  if (!existsSync(prodPath)) return;
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

function pullEnv(): string | undefined {
  spawnSync("vercel", ["env", "pull", prodPath, "--environment=production", "--yes"], {
    cwd: ROOT,
    stdio: "inherit",
  });
  loadProdEnv();
  return process.env.SENTRY_DSN?.trim() || process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();
}

function listEnvDsn(): string | undefined {
  const r = spawnSync("vercel", ["env", "ls", "production"], {
    cwd: ROOT,
    encoding: "utf8",
  });
  const hasSentry =
    r.status === 0 &&
    (/SENTRY_DSN/i.test(r.stdout) || /NEXT_PUBLIC_SENTRY_DSN/i.test(r.stdout));
  if (!hasSentry) return undefined;

  spawnSync("vercel", ["env", "pull", prodPath, "--environment=production", "--yes"], {
    cwd: ROOT,
    stdio: "inherit",
  });
  loadProdEnv();
  const dsn =
    process.env.SENTRY_DSN?.trim() || process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();
  if (!dsn) {
    // env pull may write empty placeholders for encrypted vars; rely on deploy + /api/health
    return undefined;
  }
  return dsn;
}

async function verifyProbe(): Promise<void> {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret) throw new Error("CRON_SECRET missing after env pull");
  console.log("Waiting 60s for redeploy propagation…");
  await new Promise((r) => setTimeout(r, 60_000));
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
    throw new Error("/api/health still reports sentryConfigured=false");
  }
  console.log("Health reports sentryConfigured=true");
}

async function main(): Promise<void> {
  console.log(`Waiting up to ${Math.round(TIMEOUT_MS / 1000)}s for SENTRY_DSN in Vercel production…`);
  const started = Date.now();
  let dsn: string | undefined;
  while (Date.now() - started < TIMEOUT_MS) {
    dsn = listEnvDsn();
    if (dsn) break;
    await new Promise((r) => setTimeout(r, 5000));
  }
  if (!dsn) {
    throw new Error(
      "Timed out waiting for SENTRY_DSN. Finish Vercel → Integrations → Sentry in your browser, then rerun.",
    );
  }
  console.log(`SENTRY_DSN found (${dsn.slice(0, 32)}…)`);

  console.log("Deploying production…");
  const deploy = spawnSync("vercel", ["--prod", "--yes"], {
    cwd: ROOT,
    encoding: "utf8",
    stdio: "inherit",
  });
  if (deploy.status !== 0) throw new Error("vercel --prod failed");

  if (verify) await verifyProbe();

  const smoke = spawnSync("npm", ["run", "smoke:authenticated"], {
    cwd: ROOT,
    encoding: "utf8",
    stdio: "inherit",
  });
  if (smoke.status !== 0) process.exit(smoke.status ?? 1);
  console.log("Sentry wiring complete.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
