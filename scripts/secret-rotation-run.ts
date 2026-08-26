#!/usr/bin/env tsx
/**
 * Generate rotation values and verify required secrets are configured.
 * Never prints existing secret values. Safe to run in CI with env present.
 */
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROTATION_SECRETS = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "DATABASE_URL",
  "CLERK_SECRET_KEY",
  "CLERK_WEBHOOK_SIGNING_SECRET",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "RESEND_API_KEY",
  "MONITOR_SECRET_KEYRING",
  "CRON_SECRET",
  "ALERT_WORKER_TOKEN",
  "SUBSCRIBER_WORKER_TOKEN",
  "LIFECYCLE_WORKER_TOKEN",
  "AFFILIATE_WORKER_TOKEN",
  "AFFILIATE_COOKIE_SECRET",
  "SUBSCRIBER_EMAIL_WEBHOOK_SECRET",
  "DATAFAST_API_KEY",
  "ANTHROPIC_API_KEY",
] as const;

function loadDotEnv(): void {
  for (const file of [".env", ".env.local", ".env.production.local"]) {
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

function token(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

function keyring(): string {
  return `1:${randomBytes(32).toString("base64")}`;
}

const args = new Set(process.argv.slice(2));
const generate = args.has("--generate");
const verify = args.has("--verify") || !generate;

loadDotEnv();

if (generate) {
  console.log("# Paste into your secret manager / Vercel env. Do not commit.\n");
  console.log(`CRON_SECRET=${token()}`);
  console.log(`ALERT_WORKER_TOKEN=${token()}`);
  console.log(`SUBSCRIBER_WORKER_TOKEN=${token()}`);
  console.log(`LIFECYCLE_WORKER_TOKEN=${token()}`);
  console.log(`AFFILIATE_WORKER_TOKEN=${token()}`);
  console.log(`AFFILIATE_COOKIE_SECRET=${token()}`);
  console.log(`MONITOR_SECRET_KEYRING=${keyring()}`);
  console.log("\n# Rotate these in their provider dashboards:");
  console.log("# CLERK_SECRET_KEY, STRIPE_SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY");
  console.log("\nSee docs/open-source/SECRET_ROTATION_RUNBOOK.md");
}

if (verify) {
  let missing = 0;
  console.log("Secret presence check (names only, no values):\n");
  for (const name of ROTATION_SECRETS) {
    const present = Boolean(process.env[name]?.trim());
    if (!present) missing += 1;
    console.log(`${present ? "✓" : "○"} ${name}${present ? "" : " (not set in current env)"}`);
  }
  if (missing === ROTATION_SECRETS.length) {
    console.log("\nNo secrets in current environment (expected for CI).");
    console.log("Run with production env loaded to verify before go-live.");
    process.exit(0);
  }
  if (missing > 0) {
    console.log(`\n${missing} secret(s) not set in current environment.`);
    process.exit(args.has("--strict") ? 1 : 0);
  }
  console.log("\n✓ All tracked secrets present in current environment.");
}
