#!/usr/bin/env tsx
/**
 * Create a Sentry project via browser when no API token exists.
 * Signs in with SENTRY_EMAIL + SENTRY_PASSWORD (or GitHub if configured).
 *
 *   SENTRY_EMAIL=… SENTRY_PASSWORD=… npm run wire:sentry:browser
 *
 * On success prints DSN to stdout and updates Vercel via wire:sentry helpers.
 */
import { chromium } from "playwright";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const ROOT = process.cwd();
const prodPath = resolve(ROOT, ".env.production.local");
const ORG_SLUG = process.env.SENTRY_ORG_SLUG?.trim() ?? "fajita";
const PROJECT_SLUG = process.env.SENTRY_PROJECT_SLUG?.trim() ?? "fajita-io";

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
    if (!out.includes("already exists")) {
      throw new Error(`vercel env add ${name} failed: ${out}`);
    }
  }
  console.log(`Vercel production: ${name}`);
}

async function extractDsnFromProjectPage(page: import("playwright").Page): Promise<string> {
  const clientKeysUrl = `https://sentry.io/settings/projects/${PROJECT_SLUG}/keys/`;
  await page.goto(clientKeysUrl, { waitUntil: "domcontentloaded", timeout: 90_000 });
  const body = await page.locator("body").innerText();
  const match = body.match(/https:\/\/[a-f0-9]+@[a-z0-9.-]+\.ingest(?:\.us)?\.sentry\.io\/\d+/i);
  if (!match) {
    throw new Error("Could not find DSN on Sentry client keys page");
  }
  return match[0];
}

async function ensureSignedIn(page: import("playwright").Page): Promise<void> {
  await page.goto("https://sentry.io/auth/login/", {
    waitUntil: "domcontentloaded",
    timeout: 90_000,
  });

  if (!page.url().includes("/auth/login")) {
    console.log("Already signed in to Sentry");
    return;
  }

  const email = process.env.SENTRY_EMAIL?.trim();
  const password = process.env.SENTRY_PASSWORD?.trim();
  if (!email || !password) {
    throw new Error("Set SENTRY_EMAIL and SENTRY_PASSWORD for browser Sentry provisioning");
  }

  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in|log in|continue/i }).click();
  await page.waitForURL(/sentry\.io(?!\/auth)/, { timeout: 120_000 });
  console.log("Signed in to Sentry");
}

async function ensureProject(page: import("playwright").Page): Promise<void> {
  const projectUrl = `https://${ORG_SLUG}.sentry.io/projects/${PROJECT_SLUG}/`;
  await page.goto(projectUrl, { waitUntil: "domcontentloaded", timeout: 90_000 });

  if (!page.url().includes("/projects/")) {
    await page.goto(`https://sentry.io/organizations/${ORG_SLUG}/projects/new/`, {
      waitUntil: "domcontentloaded",
      timeout: 90_000,
    });
    await page.getByLabel(/project name|name/i).first().fill("fajita-io");
    await page.getByText(/next\.?js|nextjs/i).first().click().catch(() => undefined);
    await page.getByRole("button", { name: /create project|create/i }).click();
    await page.waitForURL(/projects/, { timeout: 120_000 });
    console.log("Created Sentry project");
  } else {
    console.log("Sentry project already exists");
  }
}

async function main(): Promise<void> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await ensureSignedIn(page);
    await ensureProject(page);
    const dsn = await extractDsnFromProjectPage(page);
    console.log(`Sentry DSN acquired (${dsn.slice(0, 30)}…)`);

    pushVercel("SENTRY_DSN", dsn);
    pushVercel("NEXT_PUBLIC_SENTRY_DSN", dsn);

    if (existsSync(prodPath)) {
      const lines = readFileSync(prodPath, "utf8").split("\n");
      const map = new Map<string, string>();
      for (const line of lines) {
        const m = line.match(/^([A-Z0-9_]+)=/);
        if (m) map.set(m[1], line);
      }
      map.set("SENTRY_DSN", `SENTRY_DSN=${dsn}`);
      map.set("NEXT_PUBLIC_SENTRY_DSN", `NEXT_PUBLIC_SENTRY_DSN=${dsn}`);
      writeFileSync(prodPath, [...map.values()].filter(Boolean).join("\n") + "\n");
    }

    console.log("Sentry wired to Vercel and .env.production.local");
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
