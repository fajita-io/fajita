#!/usr/bin/env tsx
/**
 * Complete Sentry provisioning via Vercel Marketplace in a real browser.
 * Uses a copied Chrome profile when available for existing Vercel/GitHub sessions.
 *
 *   npm run wire:sentry:vercel
 */
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

import { loadEnvConfig } from "@next/env";
import { chromium } from "playwright";

loadEnvConfig(process.cwd());

const ROOT = process.cwd();
const prodPath = resolve(ROOT, ".env.production.local");
const TEAM_SLUG = "accomplishs-projects";
const VERIFY = process.argv.includes("--verify");
const BASE = (process.env.SMOKE_BASE_URL ?? "https://fajita.io").replace(/\/$/, "");

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

loadProdEnv();

function chromeProfileDir(): string {
  const src = join(homedir(), "Library/Application Support/Google/Chrome");
  const dest = join("/tmp", "fajita-chrome-profile-copy");
  if (!existsSync(src)) return dest;
  try {
    rmSync(dest, { recursive: true, force: true });
    mkdirSync(dest, { recursive: true });
    for (const item of ["Default", "Local State"]) {
      const from = join(src, item);
      if (existsSync(from)) cpSync(from, join(dest, item), { recursive: true });
    }
    console.log("Using copied Chrome profile for Vercel/GitHub sessions");
  } catch {
    console.log("Could not copy Chrome profile; continuing with empty profile");
  }
  return dest;
}

async function waitForIntegration(timeoutMs = 300_000): Promise<boolean> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const r = spawnSync("vercel", ["integration", "installations", "--format=json"], {
      cwd: ROOT,
      encoding: "utf8",
    });
    if (r.status === 0 && r.stdout.includes("sentry")) {
      console.log("Sentry marketplace installation detected");
      return true;
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 4000));
  }
  return false;
}

function pullSentryEnv(): { dsn?: string } {
  spawnSync("vercel", ["env", "pull", prodPath, "--environment=production", "--yes"], {
    cwd: ROOT,
    encoding: "utf8",
    stdio: "inherit",
  });
  loadProdEnv();
  const dsn =
    process.env.SENTRY_DSN?.trim() || process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();
  return { dsn };
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

async function completeBrowserFlow(page: import("playwright").Page): Promise<void> {
  const termsUrl = `https://vercel.com/${TEAM_SLUG}/~/integrations/accept-terms/sentry?source=cli`;
  console.log(`Opening ${termsUrl}`);
  await page.goto(termsUrl, { waitUntil: "domcontentloaded", timeout: 120_000 });

  if (page.url().includes("/login")) {
    console.log("Vercel login required; trying GitHub…");
    const githubBtn = page.getByRole("button", { name: /continue with github/i });
    if ((await githubBtn.count()) === 0) {
      throw new Error("Vercel login page did not offer GitHub. Complete login in the opened browser tab.");
    }
    await githubBtn.first().click();
    await page.waitForLoadState("domcontentloaded", { timeout: 120_000 });
    if (page.url().includes("github.com/login")) {
      throw new Error("Not logged into GitHub in browser. Log into Vercel manually, then retry.");
    }
    await page.waitForURL(/vercel\.com/, { timeout: 120_000 });
    await page.goto(termsUrl, { waitUntil: "domcontentloaded", timeout: 120_000 });
  }

  const acceptBtn = page.getByRole("button", {
    name: /accept|agree|install|continue|confirm/i,
  });
  for (let i = 0; i < 8; i++) {
    if ((await acceptBtn.count()) > 0) {
      await acceptBtn.first().click().catch(() => undefined);
      await page.waitForTimeout(2000);
    }
    if (page.url().includes("github.com") || page.url().includes("sentry.io")) break;
  }

  const deadline = Date.now() + 240_000;
  while (Date.now() < deadline) {
    const url = page.url();
    if (url.includes("sentry.io")) {
      console.log("Sentry OAuth step:", url);
      const authorize = page.getByRole("button", { name: /authorize|allow|approve|install|continue/i });
      if ((await authorize.count()) > 0) {
        await authorize.first().click();
        await page.waitForTimeout(3000);
      }
    }
    if (url.includes("vercel.com") && /integrations|dashboard|projects/.test(url)) {
      const install = page.getByRole("button", { name: /add|install|connect|create|continue/i });
      if ((await install.count()) > 0) {
        await install.first().click().catch(() => undefined);
        await page.waitForTimeout(2000);
      }
    }
    const installed = await waitForIntegration(1);
    if (installed) return;
    await page.waitForTimeout(4000);
  }
}

async function provisionViaCli(): Promise<void> {
  const args = [
    "integration",
    "add",
    "sentry",
    "-m",
    "name=Fajita",
    "-m",
    "region=us",
    "-m",
    "platform=javascript-nextjs",
    "-p",
    "am3_f",
    "-e",
    "production",
    "--yes",
  ];
  const r = spawnSync("vercel", args, { cwd: ROOT, encoding: "utf8", stdio: "inherit" });
  if (r.status !== 0) {
    throw new Error("vercel integration add sentry failed after browser setup");
  }
}

async function main(): Promise<void> {
  const profileDir = chromeProfileDir();
  const browser = await chromium.launchPersistentContext(profileDir, {
    channel: "chrome",
    headless: false,
    viewport: { width: 1400, height: 900 },
    args: ["--disable-blink-features=AutomationControlled"],
  });

  const page = browser.pages()[0] ?? (await browser.newPage());
  try {
    await completeBrowserFlow(page);
  } finally {
    await browser.close();
  }

  if (!(await waitForIntegration(30_000))) {
    console.log("Terms may be accepted; running CLI provision…");
  }

  await provisionViaCli();

  const { dsn } = pullSentryEnv();
  if (!dsn) {
    throw new Error("SENTRY_DSN not found after integration. Check Vercel env for production.");
  }
  console.log(`Sentry DSN present (${dsn.slice(0, 32)}…)`);

  console.log("Deploying production…");
  const deploy = spawnSync("vercel", ["--prod", "--yes"], {
    cwd: ROOT,
    encoding: "utf8",
    stdio: "inherit",
  });
  if (deploy.status !== 0) throw new Error("vercel --prod failed");

  if (VERIFY) await verifyProbe();
  console.log("Sentry wired via Vercel Marketplace.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
