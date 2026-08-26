#!/usr/bin/env tsx
/**
 * Self-hosted deployment diagnostics. Never prints secret values.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import postgres from "postgres";

import { deploymentConfig, resetDeploymentConfigCache } from "@/lib/deployment/config";

function emailProviderLabel(): { kind: string; configured: boolean } {
  if (process.env.RESEND_API_KEY?.trim()) {
    return { kind: "resend", configured: true };
  }
  if (
    process.env.SMTP_HOST?.trim() &&
    process.env.SMTP_PORT?.trim() &&
    process.env.SMTP_FROM?.trim()
  ) {
    return { kind: "smtp", configured: true };
  }
  return { kind: "disabled", configured: false };
}

type Check = { label: string; ok: boolean; detail: string; warn?: boolean };

function envPresent(name: string): boolean {
  return Boolean(process.env[name]?.trim());
}

function loadDotEnv(): void {
  for (const file of [".env", ".env.local"]) {
    const path = join(process.cwd(), file);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq);
      if (process.env[key]) continue;
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
}

async function checkDatabase(): Promise<Check> {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    return { label: "Database reachable", ok: false, detail: "DATABASE_URL missing" };
  }
  const sql = postgres(url, { max: 1, prepare: false, connect_timeout: 10 });
  try {
    await sql`select 1`;
    return { label: "Database reachable", ok: true, detail: "connected" };
  } catch (err) {
    return {
      label: "Database reachable",
      ok: false,
      detail: err instanceof Error ? err.message : "connection failed",
    };
  } finally {
    await sql.end({ timeout: 5 }).catch(() => undefined);
  }
}

async function checkMigrations(): Promise<Check> {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    return { label: "Migrations current", ok: false, detail: "DATABASE_URL missing" };
  }
  const sql = postgres(url, { max: 1, prepare: false });
  try {
    const rows = await sql`
      select exists (
        select 1 from information_schema.tables
        where table_schema = 'public' and table_name = 'organizations'
      ) as ok
    `;
    if (!rows[0]?.ok) {
      return { label: "Migrations current", ok: false, detail: "core schema missing (run db:migrate)" };
    }
    return { label: "Migrations current", ok: true, detail: "core tables present" };
  } catch (err) {
    return {
      label: "Migrations current",
      ok: false,
      detail: err instanceof Error ? err.message : "check failed",
    };
  } finally {
    await sql.end({ timeout: 5 }).catch(() => undefined);
  }
}

async function main(): Promise<void> {
  loadDotEnv();
  resetDeploymentConfigCache();
  const cfg = deploymentConfig();

  const checks: Check[] = [
    {
      label: "Deployment mode",
      ok: cfg.isSelfHosted,
      detail: cfg.mode,
      warn: !cfg.isSelfHosted,
    },
    {
      label: "Public app URL",
      ok: Boolean(cfg.publicAppUrl),
      detail: cfg.publicAppUrl,
    },
    {
      label: "Clerk publishable key",
      ok: envPresent("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"),
      detail: envPresent("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY") ? "present" : "missing",
    },
    {
      label: "Clerk secret key",
      ok: envPresent("CLERK_SECRET_KEY"),
      detail: envPresent("CLERK_SECRET_KEY") ? "present" : "missing",
    },
    {
      label: "Supabase URL",
      ok: envPresent("NEXT_PUBLIC_SUPABASE_URL"),
      detail: envPresent("NEXT_PUBLIC_SUPABASE_URL") ? "present" : "missing",
    },
    {
      label: "Supabase service role",
      ok: envPresent("SUPABASE_SERVICE_ROLE_KEY"),
      detail: envPresent("SUPABASE_SERVICE_ROLE_KEY") ? "present" : "missing",
    },
    {
      label: "Encryption configured",
      ok: envPresent("MONITOR_SECRET_KEYRING"),
      detail: envPresent("MONITOR_SECRET_KEYRING") ? "keyring present" : "MONITOR_SECRET_KEYRING missing",
    },
    {
      label: "Cron secret",
      ok: envPresent("CRON_SECRET"),
      detail: envPresent("CRON_SECRET") ? "present" : "missing (scheduler disabled)",
      warn: !envPresent("CRON_SECRET"),
    },
    {
      label: "Worker configuration",
      ok: envPresent("MONITOR_WORKER_KEY") || cfg.isSelfHosted,
      detail: envPresent("MONITOR_WORKER_KEY")
        ? "MONITOR_WORKER_KEY set"
        : "uses compose default (selfhost-primary)",
    },
    {
      label: "Scheduler enabled",
      ok: envPresent("CRON_SECRET"),
      detail: envPresent("CRON_SECRET") ? "CRON_SECRET configured" : "set CRON_SECRET for scheduler sidecar",
      warn: !envPresent("CRON_SECRET"),
    },
    {
      label: "Billing disabled",
      ok: !cfg.billingEnabled,
      detail: cfg.billingEnabled ? "billing enforcement on" : "self-hosted (no Stripe required)",
    },
    {
      label: "Analytics default",
      ok: !cfg.analyticsEnabled || envPresent("FAJITA_ANALYTICS_ENABLED"),
      detail: cfg.analyticsEnabled ? "enabled" : "disabled (self-hosted default)",
    },
    {
      label: "Network policy",
      ok: true,
      detail: cfg.allowPrivateNetworks
        ? "private networks allowed (review security)"
        : "private networks blocked (default)",
      warn: cfg.allowPrivateNetworks,
    },
  ];

  checks.push(await checkDatabase());
  checks.push(await checkMigrations());

  const email = emailProviderLabel();
  checks.push({
    label: "Email provider",
    ok: email.configured,
    detail: email.configured
      ? email.kind
      : "disabled (alerts email channels need SMTP or Resend)",
    warn: !email.configured,
  });

  let failed = false;
  for (const c of checks) {
    const icon = c.ok ? (c.warn ? "⚠" : "✓") : "✗";
    if (!c.ok) failed = true;
    console.log(`${icon} ${c.label}: ${c.detail}`);
  }

  if (failed) {
    console.log("\nFajita not ready. Fix failed checks above.");
    process.exit(1);
  }
  console.log("\n✓ Fajita ready");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
