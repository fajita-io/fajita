#!/usr/bin/env tsx
/**
 * Create a Sentry SaaS org + project via email signup (mail.tm inbox),
 * push DSN to Vercel production, deploy, and verify probe.
 *
 *   npm run wire:sentry:auto -- --verify
 */
import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { loadEnvConfig } from "@next/env";
import { chromium } from "playwright";

loadEnvConfig(process.cwd());

const ROOT = process.cwd();
const prodPath = resolve(ROOT, ".env.production.local");
const verify = process.argv.includes("--verify");
const BASE = (process.env.SMOKE_BASE_URL ?? "https://fajita.io").replace(/\/$/, "");
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

type MailToken = { token: string; id: string };

async function createMailInbox(): Promise<{ email: string; password: string; token: MailToken }> {
  const domainsRes = await fetch("https://api.mail.tm/domains");
  const domains = (await domainsRes.json()) as {
    "hydra:member"?: Array<{ domain: string }>;
  };
  const domain = domains["hydra:member"]?.[0]?.domain;
  if (!domain) throw new Error("mail.tm returned no domains");

  const local = `fajita-${randomBytes(4).toString("hex")}`;
  const email = `${local}@${domain}`;
  const password = randomBytes(16).toString("hex");

  const accountRes = await fetch("https://api.mail.tm/accounts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address: email, password }),
  });
  if (!accountRes.ok) {
    throw new Error(`mail.tm account create failed (${accountRes.status})`);
  }

  const tokenRes = await fetch("https://api.mail.tm/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address: email, password }),
  });
  if (!tokenRes.ok) throw new Error(`mail.tm token failed (${tokenRes.status})`);
  const token = (await tokenRes.json()) as MailToken;
  console.log(`Disposable inbox: ${email}`);
  return { email, password, token };
}

async function waitForVerificationLink(token: MailToken, timeoutMs = 180_000): Promise<string> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const res = await fetch("https://api.mail.tm/messages", {
      headers: { Authorization: `Bearer ${token.token}` },
    });
    if (res.ok) {
      const body = (await res.json()) as {
        "hydra:member"?: Array<{ id: string; subject?: string }>;
      };
      for (const msg of body["hydra:member"] ?? []) {
        const detailRes = await fetch(`https://api.mail.tm/messages/${msg.id}`, {
          headers: { Authorization: `Bearer ${token.token}` },
        });
        if (!detailRes.ok) continue;
        const detail = (await detailRes.json()) as {
          text?: string;
          html?: string[];
        };
        const blob = `${detail.text ?? ""} ${(detail.html ?? []).join(" ")}`;
        const match =
          blob.match(/https:\/\/[^\s"'<>]+(?:confirm|verify|activate|account)[^\s"'<>]*/i) ??
          blob.match(/https:\/\/[^\s"'<>]*sentry\.io[^\s"'<>]*/i);
        if (match) return match[0].replace(/&amp;/g, "&");
      }
    }
    await new Promise((r) => setTimeout(r, 5000));
  }
  throw new Error("Timed out waiting for Sentry verification email");
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

async function signupSentry(email: string, password: string): Promise<void> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.setViewportSize({ width: 1280, height: 2400 });
    await page.goto("https://sentry.io/signup/", {
      waitUntil: "networkidle",
      timeout: 90_000,
    });

    await page.getByLabel(/^name$/i).first().fill("Fajita Ops");
    await page.getByLabel(/^organization$/i).first().fill("Fajita");
    await page.getByLabel(/^email$/i).first().fill(email);
    await page.getByLabel(/^password$/i).first().fill(password);
    await page.locator('select[name="dataStorageLocation"]').selectOption("us");
    const label = page.locator("#iAgree-label");
    await label.scrollIntoViewIfNeeded();
    await label.click({ position: { x: 8, y: 8 } });
    await page.locator('button[type="submit"]').click();
    await page.waitForLoadState("domcontentloaded", { timeout: 120_000 });

    if (page.url().includes("/captchav2")) {
      throw new Error(
        "Sentry signup hit reCAPTCHA. Complete signup in a browser, copy the DSN, then run npm run wire:sentry.",
      );
    }
    console.log(`Sentry signup submitted (${page.url()})`);
  } finally {
    await browser.close();
  }
}

async function finishSentrySetup(
  email: string,
  password: string,
  verifyUrl: string,
): Promise<string> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto(verifyUrl, { waitUntil: "domcontentloaded", timeout: 120_000 });

    if (page.url().includes("/auth/login")) {
      await page.getByLabel(/email/i).first().fill(email);
      await page.getByLabel(/password/i).first().fill(password);
      await page.getByRole("button", { name: /sign in|log in|continue/i }).first().click();
      await page.waitForURL(/sentry\.io(?!\/auth)/, { timeout: 120_000 });
    }

    if (page.url().includes("/organizations/new")) {
      await page.getByLabel(/organization name|name/i).first().fill("Fajita");
      const slug = page.getByLabel(/slug/i).first();
      if ((await slug.count()) > 0) await slug.fill(ORG_SLUG);
      await page.getByRole("button", { name: /create|continue/i }).first().click();
      await page.waitForURL(/organizations|projects/, { timeout: 120_000 });
    }

    const projectUrl = `https://${ORG_SLUG}.sentry.io/projects/${PROJECT_SLUG}/`;
    await page.goto(projectUrl, { waitUntil: "domcontentloaded", timeout: 90_000 });
    if (!page.url().includes(`/projects/${PROJECT_SLUG}`)) {
      await page.goto(`https://sentry.io/organizations/${ORG_SLUG}/projects/new/`, {
        waitUntil: "domcontentloaded",
        timeout: 90_000,
      });
      await page.getByLabel(/project name|name/i).first().fill("fajita-io");
      await page.getByText(/next\.?js|nextjs/i).first().click().catch(() => undefined);
      await page.getByRole("button", { name: /create project|create/i }).first().click();
      await page.waitForURL(/projects/, { timeout: 120_000 });
    }

    await page.goto(`https://sentry.io/settings/projects/${PROJECT_SLUG}/keys/`, {
      waitUntil: "domcontentloaded",
      timeout: 90_000,
    });
    const body = await page.locator("body").innerText();
    const match = body.match(/https:\/\/[a-f0-9]+@[a-z0-9.-]+\.ingest(?:\.us)?\.sentry\.io\/\d+/i);
    if (!match) throw new Error("Could not find DSN on Sentry client keys page");
    return match[0];
  } finally {
    await browser.close();
  }
}

async function verifyProbe(): Promise<void> {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret) {
    console.warn("CRON_SECRET missing locally; skip probe verify");
    return;
  }
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
  const inbox = await createMailInbox();
  const sentryPassword = randomBytes(18).toString("base64url");
  await signupSentry(inbox.email, sentryPassword);

  console.log("Waiting for verification email…");
  const verifyUrl = await waitForVerificationLink(inbox.token);
  console.log("Verification link received");

  const dsn = await finishSentrySetup(inbox.email, sentryPassword, verifyUrl);
  console.log(`Sentry DSN acquired (${dsn.slice(0, 32)}…)`);

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
    console.log("Updated .env.production.local");
  }

  console.log("\nDeploying production…");
  const deploy = spawnSync("vercel", ["--prod", "--yes"], {
    cwd: ROOT,
    encoding: "utf8",
    stdio: "inherit",
  });
  if (deploy.status !== 0) throw new Error("vercel --prod failed");

  if (verify) await verifyProbe();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
