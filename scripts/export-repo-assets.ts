/**
 * Export README and GitHub social assets from SVG sources.
 * Run: npx tsx scripts/export-repo-assets.ts
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const assetsDir = path.join(root, ".github", "assets");

const exports: { svg: string; png: string; width: number; height: number }[] = [
  { svg: "fajita-dashboard.svg", png: "fajita-dashboard.png", width: 1440, height: 900 },
  { svg: "fajita-monitor-detail.svg", png: "fajita-monitor-detail.png", width: 1440, height: 900 },
  { svg: "fajita-incident-verification.svg", png: "fajita-incident-verification.png", width: 1440, height: 900 },
  { svg: "fajita-status-page.svg", png: "fajita-status-page.png", width: 1440, height: 900 },
  { svg: "fajita-verification-flow.svg", png: "fajita-verification-flow.png", width: 1200, height: 640 },
  { svg: "github-social-preview.svg", png: "github-social-preview.png", width: 1280, height: 640 },
];

async function main() {
  mkdirSync(assetsDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage();

  for (const item of exports) {
    const svgPath = path.join(assetsDir, item.svg);
    const pngPath = path.join(assetsDir, item.png);
    const svg = readFileSync(svgPath, "utf8");
    await page.setViewportSize({ width: item.width, height: item.height });
    await page.setContent(
      `<!DOCTYPE html><html><body style="margin:0;background:#17130e">${svg}</body></html>`,
      { waitUntil: "load" },
    );
    const svgEl = page.locator("svg").first();
    await svgEl.screenshot({ path: pngPath, type: "png" });
    console.log(`Wrote ${item.png}`);
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
