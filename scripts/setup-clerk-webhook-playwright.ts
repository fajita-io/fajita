#!/usr/bin/env npx tsx
/**
 * Ensure the production Clerk webhook exists in Svix and return its signing secret.
 * Writes WHSEC=... to stdout only (no other secrets logged).
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";

import { loadEnvConfig } from "@next/env";

const ROOT = resolve(import.meta.dirname, "..");
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://fajita.io";
const TARGET = `${APP_URL.replace(/\/$/, "")}/api/webhooks/clerk`;
const EVENTS = ["user.created", "user.updated", "user.deleted"];

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
    process.env[key] = val;
  }
}

async function svixPortalUrl(): Promise<string> {
  const key = process.env.CLERK_SECRET_KEY?.trim();
  if (!key) throw new Error("Missing CLERK_SECRET_KEY");
  const res = await fetch("https://api.clerk.com/v1/webhooks/svix_url", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  const json = (await res.json()) as { svix_url?: string };
  if (!res.ok || !json.svix_url) {
    throw new Error("Could not obtain Svix portal URL from Clerk");
  }
  return json.svix_url;
}

async function readSigningSecret(page: import("playwright").Page): Promise<string> {
  const reveal = page.getByRole("button", { name: /click to reveal|reveal/i }).first();
  if (await reveal.isVisible({ timeout: 10_000 }).catch(() => false)) {
    await reveal.click();
  }
  const body = await page.locator("body").innerText();
  const secret = body.match(/whsec_[A-Za-z0-9+/=_-]+/)?.[0];
  if (!secret) throw new Error("Could not read whsec signing secret from Svix portal");
  return secret;
}

async function main(): Promise<void> {
  const portalUrl = await svixPortalUrl();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(portalUrl, { waitUntil: "networkidle", timeout: 120_000 });

    const existing = page.getByText(TARGET, { exact: false });
    if (await existing.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await existing.click();
    } else {
      await page.getByText("Add Endpoint", { exact: true }).click();
      await page.getByLabel("Endpoint URL").fill(TARGET);
      for (const ev of EVENTS) {
        await page.getByLabel(ev, { exact: true }).check().catch(async () => {
          await page.getByText(ev, { exact: true }).click();
        });
      }
      await page.getByRole("button", { name: "Create" }).click();
      await page.waitForURL(/\/endpoints\/ep_/, { timeout: 120_000 });
    }

    const secret = await readSigningSecret(page);
    process.stdout.write(`WHSEC=${secret}\n`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
