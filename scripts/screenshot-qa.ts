/**
 * Screenshot QA at required breakpoints (frontend-quality.mdc).
 * Usage: npx tsx scripts/screenshot-qa.ts [baseUrl]
 * Writes to .qa-screens/ (gitignored).
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:3311";
const widths = [1440, 1280, 1024, 768, 430, 390, 360];
/** Dark mode is captured at a desktop and a mobile width per route. */
const darkWidths = [1440, 390];
const routes: Array<[string, string]> = [
  ["/", "home"],
  ["/pricing", "pricing"],
  ["/features", "features"],
  ["/features/uptime-monitoring", "feat-uptime"],
  ["/features/api-monitoring", "feat-api"],
  ["/features/ssl-monitoring", "feat-ssl"],
  ["/features/cron-monitoring", "feat-cron"],
  ["/features/status-pages", "feat-status"],
  ["/features/incident-communication", "feat-incident"],
  ["/integrations", "integrations"],
  ["/security", "security"],
  ["/about", "about"],
  ["/contact", "contact"],
  ["/changelog", "changelog"],
  ["/roadmap", "roadmap"],
  ["/status", "status"],
  ["/early-access", "early-access"],
  ["/login", "login"],
  ["/signup", "signup"],
  ["/legal", "legal"],
  ["/this-page-does-not-exist", "not-found"],
  ["/internal/brand-lab", "brand-lab"],
];

const out = ".qa-screens";
mkdirSync(out, { recursive: true });

async function main() {
  const browser = await chromium.launch();
  let defects = 0;
  for (const [route, name] of routes) {
    for (const scheme of ["light", "dark"] as const) {
      for (const width of scheme === "light" ? widths : darkWidths) {
        const page = await browser.newPage({
          viewport: { width, height: 960 },
          deviceScaleFactor: 1,
          colorScheme: scheme,
        });
        const errors: string[] = [];
        page.on("console", (m) => {
          if (m.type() === "error") errors.push(m.text());
        });
        page.on("pageerror", (e) => errors.push(String(e)));
        await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
        await page.waitForTimeout(600);
        const suffix = scheme === "dark" ? "-dark" : "";
        await page.screenshot({
          path: `${out}/${name}-${width}${suffix}.png`,
          fullPage: true,
        });
        const overflow = await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        );
        if (overflow > 0 || errors.length > 0) defects += 1;
        console.log(
          `${name} @ ${width}px ${scheme}  overflow=${overflow}px  consoleErrors=${errors.length}`,
          errors.slice(0, 3),
        );
        await page.close();
      }
    }
  }
  await browser.close();
  console.log(`done -> ${out}  defects=${defects}`);
}

main();
