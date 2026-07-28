/**
 * Authenticated app screenshot QA at required breakpoints.
 * Usage: npx tsx scripts/screenshot-app-qa.ts [baseUrl]
 *
 * Requires CLERK_SECRET_KEY + NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY in env.
 */
import { chromium, type Page } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { loadEnvConfig } from "@next/env";
import { clerk, clerkSetup } from "@clerk/testing/playwright";

loadEnvConfig(process.cwd());

const base = (process.argv[2] ?? "http://localhost:3311").replace(/\/$/, "");
const out = ".qa-screens/app";
const QA_EMAIL = "visualqa+fajita@gmail.com";

const widths = [1440, 1280, 1024, 768, 430, 390, 360];

const routes: Array<[string, string]> = [
  ["/app", "app-overview"],
  ["/app/monitors", "app-monitors"],
  ["/app/monitors/new", "app-monitors-new"],
  ["/app/monitors/new/website", "app-monitors-new-website"],
  ["/app/monitors/new/api", "app-monitors-new-api"],
  ["/app/monitors/new/ssl", "app-monitors-new-ssl"],
  ["/app/incidents", "app-incidents"],
  ["/app/incidents/new", "app-incidents-new"],
  ["/app/status-pages", "app-status-pages"],
  ["/app/status-pages/new", "app-status-new"],
  ["/app/integrations", "app-integrations"],
  ["/app/integrations/new", "app-integrations-new"],
  ["/app/maintenance", "app-maintenance"],
  ["/app/maintenance/new", "app-maintenance-new"],
  ["/app/monitor-groups", "app-monitor-groups"],
  ["/app/reports", "app-reports"],
  ["/app/team", "app-team"],
  ["/app/settings/profile", "app-settings-profile"],
  ["/app/settings/organization", "app-settings-org"],
  ["/app/settings/billing", "app-settings-billing"],
  ["/app/settings/security", "app-settings-security"],
  ["/app/settings/preferences", "app-settings-preferences"],
  ["/app/settings/notifications", "app-settings-notifications"],
  ["/app/onboarding", "app-onboarding"],
  ["/app/support", "app-support"],
  ["/app/referrals", "app-referrals"],
  ["/app/coming-soon", "app-coming-soon"],
];

interface Defect {
  route: string;
  width: number;
  overflow: number;
  consoleErrors: string[];
  note?: string;
}

mkdirSync(out, { recursive: true });

const IGNORED_CONSOLE = [
  "unsafe-eval",
  "Content Security Policy",
  "Failed to load resource",
  "net::ERR",
];

function filterErrors(errors: string[]): string[] {
  return errors.filter(
    (e) => !IGNORED_CONSOLE.some((fragment) => e.includes(fragment)),
  );
}

async function ensureOrg(page: Page) {
  await page.goto(`${base}/app`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  if (page.url().includes("/app/new-organization")) {
    await page.getByLabel("Organization name").fill("Visual QA Workspace");
    await page.getByRole("button", { name: /create organization/i }).click();
    await page.waitForURL(/\/app\/(start|onboarding)/, { timeout: 45_000 });
    await page.waitForTimeout(800);
  }

  if (page.url().includes("/app/start/payment")) {
    await page.goto(`${base}/app/onboarding`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
  }
}

async function capture(page: Page, route: string, name: string, width: number): Promise<Defect> {
  const errors: string[] = [];
  page.removeAllListeners("console");
  page.removeAllListeners("pageerror");
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(String(e)));

  await page.setViewportSize({ width, height: 960 });
  await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);

  const finalUrl = page.url();
  const redirectedToLogin = finalUrl.includes("/login");
  await page.screenshot({ path: `${out}/${name}-${width}.png`, fullPage: true });

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );

  return {
    route,
    width,
    overflow,
    consoleErrors: filterErrors(errors),
    note: redirectedToLogin ? "redirected to login" : undefined,
  };
}

async function main() {
  await clerkSetup();

  const browser = await chromium.launch();
  const context = await browser.newContext({ bypassCSP: true });
  const page = await context.newPage();

  await page.goto(`${base}/login`, { waitUntil: "networkidle" });
  await clerk.signIn({
    page,
    emailAddress: QA_EMAIL,
  });
  await page.goto(`${base}/app`, { waitUntil: "networkidle" });
  await ensureOrg(page);

  if (page.url().includes("/login")) {
    throw new Error("Clerk sign-in failed; session not established.");
  }

  const defects: Defect[] = [];
  for (const [route, name] of routes) {
    for (const width of widths) {
      const result = await capture(page, route, name, width);
      defects.push(result);
      const bad = result.overflow > 0 || result.consoleErrors.length > 0 || result.note;
      console.log(
        `${name} @ ${width}px  overflow=${result.overflow}px  errors=${result.consoleErrors.length}${result.note ? `  ${result.note}` : ""}`,
        bad ? result.consoleErrors.slice(0, 2) : "",
      );
    }
  }

  await browser.close();

  const report = {
    capturedAt: new Date().toISOString(),
    base,
    routes: routes.length,
    widths: widths.length,
    defects: defects.filter(
      (d) => d.overflow > 0 || d.consoleErrors.length > 0 || d.note,
    ),
    overflowOnly: defects.filter((d) => d.overflow > 0),
    errorCount: defects.filter((d) => d.consoleErrors.length > 0).length,
  };

  writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 2));
  console.log(`\ndone -> ${out}`);
  console.log(
    `routes=${routes.length} widths=${widths.length} issues=${report.defects.length} overflow=${report.overflowOnly.length}`,
  );
  process.exit(report.overflowOnly.length > 0 || report.defects.some((d) => d.note) ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
