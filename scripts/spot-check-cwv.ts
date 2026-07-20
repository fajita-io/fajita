#!/usr/bin/env tsx
/**
 * Quick overflow and CSP worker spot check at mobile + desktop widths.
 */
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:3311";
const routes = ["/", "/pricing", "/docs", "/support", "/login"];

async function main() {
  const browser = await chromium.launch();
  let workerErrors = 0;
  let overflowIssues = 0;

  for (const route of routes) {
    for (const width of [360, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 800 } });
      const errors: string[] = [];
      page.on("console", (m) => {
        if (m.text().includes("worker") && m.text().includes("CSP")) {
          errors.push(m.text());
        }
      });
      await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      if (overflow > 0) overflowIssues += 1;
      workerErrors += errors.length;
      console.log(
        `${route} @ ${width}px  overflow=${overflow}px  cspWorkerErrors=${errors.length}`,
      );
      await page.close();
    }
  }

  await browser.close();

  if (overflowIssues > 0 || workerErrors > 0) {
    console.error(
      `Spot check failed (${overflowIssues} overflow, ${workerErrors} CSP worker errors).`,
    );
    process.exit(1);
  }

  console.log("Spot check passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
