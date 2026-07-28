#!/usr/bin/env tsx
/**
 * Browser login production smoke (LB-008 supplement).
 *
 * Uses Clerk sign-in tokens (production-safe; no password in script).
 *
 *   SMOKE_USER_ID=user_xxx npm run smoke:browser
 *   npm run smoke:browser   # defaults to first Clerk user
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { loadEnvConfig } from "@next/env";
import { chromium, type Page } from "playwright";

loadEnvConfig(process.cwd());

const prodPath = resolve(process.cwd(), ".env.production.local");
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

const BASE = (process.env.SMOKE_BASE_URL ?? "https://fajita.io").replace(/\/$/, "");
const ACTIVE_ORG_COOKIE = "fajita-active-org";
const DEFAULT_INTERNAL_ORG_ID = "95d5b566-2b62-4ff8-b6c2-0de8f714f0ce";

type Check = { id: string; ok: boolean; detail: string };
const checks: Check[] = [];

function record(id: string, ok: boolean, detail: string): void {
  checks.push({ id, ok, detail });
  console.log(`${ok ? "OK" : "FAIL"} ${id}: ${detail}`);
}

async function clerkFetch(path: string, init?: RequestInit): Promise<Response> {
  const key = process.env.CLERK_SECRET_KEY?.trim();
  if (!key) throw new Error("CLERK_SECRET_KEY required");
  return fetch(`https://api.clerk.com/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

async function resolveUserId(): Promise<string> {
  const explicit = process.env.SMOKE_USER_ID?.trim();
  if (explicit) return explicit;

  const res = await clerkFetch("/users?limit=1&order_by=-created_at");
  if (!res.ok) throw new Error(`Clerk users list failed (${res.status})`);
  const users = (await res.json()) as Array<{ id: string }>;
  const id = users[0]?.id;
  if (!id) throw new Error("No Clerk users found for browser smoke");
  return id;
}

async function createSignInToken(userId: string): Promise<string> {
  const res = await clerkFetch("/sign_in_tokens", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, expires_in_seconds: 600 }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`sign_in_tokens failed (${res.status}): ${text.slice(0, 200)}`);
  }
  const body = (await res.json()) as { url?: string };
  if (!body.url) throw new Error("Clerk did not return sign-in token URL");
  const ticket = new URL(body.url).searchParams.get("__clerk_ticket");
  if (!ticket) throw new Error("Clerk sign-in token missing __clerk_ticket");
  return `${BASE}/login?__clerk_ticket=${encodeURIComponent(ticket)}`;
}

async function waitForAppShell(page: Page): Promise<void> {
  await page.waitForURL(/fajita\.io\/app/, { timeout: 120_000 });
  await page.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => undefined);
}

async function assertRoute(page: Page, path: string, mustInclude: RegExp | string): Promise<void> {
  const res = await page.goto(`${BASE}${path}`, {
    waitUntil: "domcontentloaded",
    timeout: 90_000,
  });
  const status = res?.status() ?? 0;
  const html = await page.content();
  const pattern = typeof mustInclude === "string" ? new RegExp(mustInclude, "i") : mustInclude;
  const matched = pattern.test(html) || pattern.test(await page.title());
  record(
    `route-${path.replace(/\//g, "-").replace(/^-/, "")}`,
    status < 400 && matched,
    `${path} status=${status} matched=${matched}`,
  );
}

async function main(): Promise<void> {
  console.log(`Browser production smoke against ${BASE}\n`);

  const userId = await resolveUserId();
  console.log(`Clerk user: ${userId}`);

  const signInUrl = await createSignInToken(userId);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    const orgId = process.env.SMOKE_ORG_ID?.trim() ?? DEFAULT_INTERNAL_ORG_ID;
    await page.context().addCookies([
      {
        name: ACTIVE_ORG_COOKIE,
        value: orgId,
        domain: new URL(BASE).hostname,
        path: "/",
        httpOnly: true,
        secure: BASE.startsWith("https"),
        sameSite: "Lax",
      },
    ]);

    await page.goto(signInUrl, { waitUntil: "networkidle", timeout: 120_000 });
    await waitForAppShell(page);
    record("clerk-sign-in", /fajita\.io\/app/.test(page.url()), `landed on ${page.url()}`);

    if (page.url().includes("/app/start/payment")) {
      await page.goto(`${BASE}/app`, { waitUntil: "domcontentloaded", timeout: 60_000 });
    }

    await assertRoute(page, "/app", /Monitors|Dashboard|monitor/i);
    await assertRoute(page, "/app/monitors", /monitor/i);
    await assertRoute(page, "/app/status-pages", /status/i);
    await assertRoute(page, "/app/settings/billing", /billing|plan|subscription/i);
    await assertRoute(page, "/app/support", /support|ask|fajita/i);

    const internal = await page.goto(`${BASE}/internal/launch`, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    const internalStatus = internal?.status() ?? 0;
    const internalHtml = await page.content();
    const internalOk =
      internalStatus === 404 ||
      (internalStatus < 400 &&
        !internalHtml.includes("Sign in") &&
        /launch|readiness|command/i.test(internalHtml));
    record(
      "internal-launch",
      internalOk,
      `/internal/launch status=${internalStatus}${internalStatus === 404 ? " (non-admin expected)" : ""}`,
    );
  } finally {
    await browser.close();
  }

  const failed = checks.filter((c) => !c.ok);
  console.log(`\nSummary: ${checks.length - failed.length}/${checks.length} checks passed`);
  if (failed.length > 0) {
    for (const f of failed) console.error(`  - ${f.id}: ${f.detail}`);
    process.exit(1);
  }
  console.log("\nBrowser production smoke PASSED.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
