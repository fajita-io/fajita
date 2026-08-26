#!/usr/bin/env tsx
/**
 * Rotate app-controlled production secrets on Vercel and trigger redeploy.
 * Does not print secret values. Provider keys (Clerk, Stripe, Supabase, Resend)
 * must still be rotated in their dashboards per SECRET_ROTATION_RUNBOOK.md.
 */
import { randomBytes } from "node:crypto";
import { execSync } from "node:child_process";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const pullPath = join(root, ".rotation.env.pull");

function token(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

function parseEnvFile(path: string): Map<string, string> {
  const map = new Map<string, string>();
  if (!existsSync(path)) return map;
  for (const line of readFileSync(path, "utf8").split("\n")) {
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
    map.set(key, val);
  }
  return map;
}

function rotateKeyring(current: string | undefined): string {
  const newKey = randomBytes(32).toString("base64");
  if (!current?.trim()) return `1:${newKey}`;
  const parts = current.split(",").map((p) => p.trim()).filter(Boolean);
  let maxVersion = 0;
  for (const part of parts) {
    const v = Number.parseInt(part.split(":")[0] ?? "", 10);
    if (!Number.isNaN(v)) maxVersion = Math.max(maxVersion, v);
  }
  const next = maxVersion + 1;
  return `${parts.join(",")},${next}:${newKey}`;
}

function vercel(args: string, input?: string): void {
  execSync(`vercel ${args}`, {
    cwd: root,
    stdio: input ? ["pipe", "inherit", "inherit"] : "inherit",
    input,
    env: process.env,
  });
}

function setVercelEnv(name: string, value: string, environments: string[]): void {
  for (const env of environments) {
    try {
      execSync(`vercel env rm ${name} ${env} --yes`, {
        cwd: root,
        stdio: "pipe",
        env: process.env,
      });
    } catch {
      /* may not exist in this environment */
    }
    vercel(`env add ${name} ${env}`, `${value}\n`);
  }
}

const dryRun = process.argv.includes("--dry-run");

console.log("Pulling current production env (local file, gitignored)…");
try {
  if (existsSync(pullPath)) unlinkSync(pullPath);
  execSync(`vercel env pull "${pullPath}" --environment=production --yes`, {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });
} catch (error) {
  console.error("Failed to pull Vercel production env. Is the project linked?");
  throw error;
}

const current = parseEnvFile(pullPath);
const rotated: Record<string, string> = {
  CRON_SECRET: token(),
  ALERT_WORKER_TOKEN: token(),
  SUBSCRIBER_WORKER_TOKEN: token(),
  LIFECYCLE_WORKER_TOKEN: token(),
  AFFILIATE_COOKIE_SECRET: token(),
  MONITOR_SECRET_KEYRING: rotateKeyring(current.get("MONITOR_SECRET_KEYRING")),
};

console.log("\nRotating app-controlled Vercel secrets:");
for (const name of Object.keys(rotated)) {
  console.log(`  • ${name}`);
}

if (dryRun) {
  console.log("\nDry run. No Vercel changes applied.");
  unlinkSync(pullPath);
  process.exit(0);
}

for (const [name, value] of Object.entries(rotated)) {
  setVercelEnv(name, value, ["production"]);
}

unlinkSync(pullPath);

console.log("\nTriggering production redeploy…");
vercel("deploy --prod --yes");

console.log("\n✓ App-controlled secrets rotated and production redeploy triggered.");
console.log("\nStill rotate in provider dashboards before public release:");
console.log("  CLERK_SECRET_KEY, CLERK_WEBHOOK_SIGNING_SECRET");
console.log("  STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET");
console.log("  SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL");
console.log("  RESEND_API_KEY, SUBSCRIBER_EMAIL_WEBHOOK_SECRET");
