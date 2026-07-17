/**
 * Section-level screenshots of the Brand Lab for visual QA.
 * Usage: npx tsx scripts/screenshot-sections.ts [baseUrl] [width]
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:3311";
const width = Number(process.argv[3] ?? 1440);
const ids = [
  "strategy",
  "logo-explorations",
  "logo-system",
  "color",
  "typography",
  "space",
  "icons",
  "thermal-stack",
  "motion",
  "status",
  "components",
  "status-page",
  "email",
  "social",
  "accessibility",
];

const out = ".qa-screens/sections";
mkdirSync(out, { recursive: true });

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width, height: 1200 } });
  await page.goto(`${base}/internal/brand-lab`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  for (const id of ids) {
    const el = page.locator(`#${id}`);
    try {
      await el.screenshot({ path: `${out}/${id}-${width}.png` });
      console.log("ok", id);
    } catch (e) {
      console.log("FAIL", id, String(e).slice(0, 120));
    }
  }
  await browser.close();
}

main();
